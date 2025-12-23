<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            // Subtotal (before discount and VAT)
            $table->decimal('subtotal', 10, 2)->after('total_amount')->default(0);
            
            // Discount fields
            $table->string('discount_type')->nullable()->after('subtotal'); // 'percentage' or 'fixed'
            $table->decimal('discount_value', 10, 2)->default(0)->after('discount_type'); // The input value (e.g., 10 for 10% or $10)
            $table->decimal('discount_amount', 10, 2)->default(0)->after('discount_value'); // Calculated discount amount
            
            // VAT fields
            $table->boolean('vat_enabled')->default(false)->after('discount_amount');
            $table->decimal('vat_rate', 5, 2)->default(0)->after('vat_enabled'); // VAT percentage (e.g., 13.00)
            $table->decimal('vat_amount', 10, 2)->default(0)->after('vat_rate'); // Calculated VAT amount
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn([
                'subtotal',
                'discount_type',
                'discount_value',
                'discount_amount',
                'vat_enabled',
                'vat_rate',
                'vat_amount'
            ]);
        });
    }
};

