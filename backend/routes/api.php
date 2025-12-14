<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\InventoryController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::apiResource('categories', CategoryController::class);
Route::apiResource('products', InventoryController::class);
Route::post('products/{product}/stock', [InventoryController::class, 'adjustStock']);
Route::apiResource('clients', ClientController::class);
Route::apiResource('transactions', \App\Http\Controllers\TransactionController::class);
