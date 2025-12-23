<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Product;
use App\Models\StockMovement;
use App\Models\Transaction;
use App\Models\TransactionItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $query = Transaction::with(['client', 'items.product']);

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        return $query->latest()->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'client_id' => 'nullable|exists:clients,id',
            'type' => 'required|in:sale,purchase',
            'status' => 'required|in:pending,completed,cancelled',
            'payment_status' => 'required|in:unpaid,partial,paid,credit',
            'date' => 'required|date',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0', // Unit price
            // Discount fields
            'discount_type' => 'nullable|in:percentage,fixed',
            'discount_value' => 'nullable|numeric|min:0',
            'discount_amount' => 'nullable|numeric|min:0',
            // VAT fields
            'vat_enabled' => 'nullable|boolean',
            'vat_rate' => 'nullable|numeric|min:0|max:100',
            'vat_amount' => 'nullable|numeric|min:0',
            // Total
            'subtotal' => 'nullable|numeric|min:0',
            'total_amount' => 'nullable|numeric|min:0',
        ]);

        return DB::transaction(function () use ($validated) {
            // Calculate subtotal from items
            $subtotal = 0;
            foreach ($validated['items'] as $item) {
                $subtotal += $item['quantity'] * $item['price'];
            }

            // Get discount values
            $discountType = $validated['discount_type'] ?? null;
            $discountValue = $validated['discount_value'] ?? 0;
            $discountAmount = $validated['discount_amount'] ?? 0;

            // If discount_amount not provided, calculate it
            if ($discountValue > 0 && $discountAmount == 0) {
                if ($discountType === 'percentage') {
                    $discountAmount = ($subtotal * $discountValue) / 100;
                } else {
                    $discountAmount = min($discountValue, $subtotal);
                }
            }

            // Subtotal after discount
            $subtotalAfterDiscount = max(0, $subtotal - $discountAmount);

            // Get VAT values
            $vatEnabled = $validated['vat_enabled'] ?? false;
            $vatRate = $validated['vat_rate'] ?? 0;
            $vatAmount = $validated['vat_amount'] ?? 0;

            // If vat_amount not provided, calculate it
            if ($vatEnabled && $vatRate > 0 && $vatAmount == 0) {
                $vatAmount = ($subtotalAfterDiscount * $vatRate) / 100;
            }

            // Calculate final total
            $totalAmount = $validated['total_amount'] ?? ($subtotalAfterDiscount + $vatAmount);

            $transaction = Transaction::create([
                'client_id' => $validated['client_id'] ?? null,
                'type' => $validated['type'],
                'status' => $validated['status'],
                'payment_status' => $validated['payment_status'],
                'subtotal' => $subtotal,
                'discount_type' => $discountType,
                'discount_value' => $discountValue,
                'discount_amount' => $discountAmount,
                'vat_enabled' => $vatEnabled,
                'vat_rate' => $vatRate,
                'vat_amount' => $vatAmount,
                'total_amount' => $totalAmount,
                'date' => $validated['date'],
                'notes' => $validated['notes'] ?? null,
            ]);

            foreach ($validated['items'] as $itemData) {
                $itemTotal = $itemData['quantity'] * $itemData['price'];

                // Create Item
                TransactionItem::create([
                    'transaction_id' => $transaction->id,
                    'product_id' => $itemData['product_id'],
                    'quantity' => $itemData['quantity'],
                    'price' => $itemData['price'],
                    'total' => $itemTotal,
                ]);

                // Update Stock
                // Sale = Out, Purchase = In
                $stockType = $transaction->type === 'sale' ? 'out' : 'in';

                StockMovement::create([
                    'product_id' => $itemData['product_id'],
                    'type' => $stockType,
                    'quantity' => $itemData['quantity'],
                    'reason' => ucfirst($transaction->type) . " #{$transaction->id}",
                    'reference_type' => Transaction::class,
                    'reference_id' => $transaction->id,
                ]);

                $product = Product::find($itemData['product_id']);
                if ($stockType === 'in') {
                    $product->increment('stock_quantity', $itemData['quantity']);
                } else {
                    $product->decrement('stock_quantity', $itemData['quantity']);
                }
            }

            // Update Client Balance if Sale & Credit (Not fully paid)
            // Or simplifies: Balance = Owe us.
            // Sale increases balance (they owe us). Payment decreases balance.
            // If we treat this purely as accrual accounting:
            // Sale = Debit Client (Increase Balance).
            // Purchase = Credit Client (Decrease Balance - we owe them or they owe less).
            // Usually purchases are from Suppliers, but here "Client" might be user for both?
            // Let's assume Sale increases Client Balance.

            if ($transaction->client_id) {
                $client = Client::find($transaction->client_id);
                if ($transaction->type === 'sale') {
                    $client->increment('current_balance', $transaction->total_amount);
                }
                // If it's a return or purchase from client? Less common, but let's leave it for now.
            }

            return $transaction->load('items');
        });
    }

    public function show(Transaction $transaction)
    {
        return $transaction->load(['client', 'items.product', 'payments']);
    }

    public function update(Request $request, Transaction $transaction)
    {
        // Limiting updates to status for now to avoid complex stock reversal logic in MVP
        $validated = $request->validate([
            'status' => 'in:pending,completed,cancelled',
            'payment_status' => 'in:unpaid,partial,paid',
            'notes' => 'nullable|string'
        ]);

        $transaction->update($validated);

        return $transaction;
    }

    public function destroy(Transaction $transaction)
    {
        // Logic to reverse stock?
        // For MVP, forbid delete or just delete.
        // Let's delete but stock remains affected unless we reverse.
        // Safe approach: generic soft delete or just delete.
        $transaction->delete();
        return response()->noContent();
    }
}
