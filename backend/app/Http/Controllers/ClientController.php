<?php

namespace App\Http\Controllers;

use App\Models\Client;
use Illuminate\Http\Request;

class ClientController extends Controller
{
    public function index()
    {
        return Client::all();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email',
            'phone' => 'nullable|string',
            'address' => 'nullable|string',
            'credit_limit' => 'numeric|min:0',
            'current_balance' => 'numeric',
        ]);

        return Client::create($validated);
    }

    public function show(Client $client)
    {
        return $client->load('transactions');
    }

    public function update(Request $request, Client $client)
    {
        $validated = $request->validate([
            'name' => 'string|max:255',
            'email' => 'nullable|email',
            'phone' => 'nullable|string',
            'address' => 'nullable|string',
            'credit_limit' => 'numeric|min:0',
            // Balance is usually updated via transactions, but admins might need manual override.
            'current_balance' => 'numeric',
        ]);

        $client->update($validated);

        return $client;
    }

    public function destroy(Client $client)
    {
        $client->delete();
        return response()->noContent();
    }
}
