<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class LogInstanceId
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Try multiple methods to get instance ID
        $instanceId = getenv('INSTANCE_ID') 
            ?: ($_ENV['INSTANCE_ID'] ?? null)
            ?: ($_SERVER['INSTANCE_ID'] ?? null)
            ?: gethostname();  // Falls back to container hostname
        
        // Get worker process ID
        $workerId = getmypid();
        
        // Log the request with instance ID and worker
        Log::info("Request handled by {$instanceId} (worker: {$workerId})", [
            'instance' => $instanceId,
            'worker_pid' => $workerId,
            'method' => $request->method(),
            'path' => $request->path(),
        ]);

        $response = $next($request);

        // Add instance ID and worker to response headers
        $response->headers->set('X-Backend-Instance', $instanceId);
        $response->headers->set('X-Worker-PID', (string) $workerId);

        return $response;
    }
}

