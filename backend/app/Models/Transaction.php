<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_id',
        'type',
        'status',
        'payment_status',
        'subtotal',
        'discount_type',
        'discount_value',
        'discount_amount',
        'vat_enabled',
        'vat_rate',
        'vat_amount',
        'total_amount',
        'date',
        'notes'
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'discount_value' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'vat_enabled' => 'boolean',
        'vat_rate' => 'decimal:2',
        'vat_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'date' => 'date',
    ];

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function items()
    {
        return $this->hasMany(TransactionItem::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }
}
