# Nginx Load Balancing with Multiple Backend Instances

## Documentation for CMS Inventory System

**Created:** December 27, 2025  
**Version:** 1.0

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [System Components](#system-components)
3. [File Structure](#file-structure)
4. [Configuration Details](#configuration-details)
5. [PHP-FPM Deep Dive](#php-fpm-deep-dive)
6. [CPU Cores vs Workers](#cpu-cores-vs-workers)
7. [How It Works](#how-it-works)
8. [Running the Application](#running-the-application)
9. [Testing Load Balancing](#testing-load-balancing)
10. [Scaling Guide](#scaling-guide)
11. [Handling High Traffic](#handling-high-traffic)
12. [Monitoring & Logging](#monitoring--logging)
13. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

The system uses a multi-tier architecture with Nginx as a reverse proxy/load balancer distributing traffic across multiple PHP backend instances.

```
                     ┌─────────────────────────────┐
                     │         CLIENTS             │
                     │   (Browser / API Requests)  │
                     └─────────────┬───────────────┘
                                   │
                                   ▼ Port 8000
                     ┌─────────────────────────────┐
                     │     NGINX LOAD BALANCER     │
                     │   (Round-Robin Distribution)│
                     └─────────────┬───────────────┘
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         │                         │                         │
         ▼                         ▼                         ▼
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│    BACKEND 1    │      │    BACKEND 2    │      │    BACKEND 3    │
│  ┌───────────┐  │      │  ┌───────────┐  │      │  ┌───────────┐  │
│  │   Nginx   │  │      │  │   Nginx   │  │      │  │   Nginx   │  │
│  └─────┬─────┘  │      │  └─────┬─────┘  │      │  └─────┬─────┘  │
│        │        │      │        │        │      │        │        │
│  ┌─────▼─────┐  │      │  ┌─────▼─────┐  │      │  ┌─────▼─────┐  │
│  │  PHP-FPM  │  │      │  │  PHP-FPM  │  │      │  │  PHP-FPM  │  │
│  │ 4-8 workers│ │      │  │ 4-8 workers│ │      │  │ 4-8 workers│ │
│  └───────────┘  │      │  └───────────┘  │      │  └───────────┘  │
└────────┬────────┘      └────────┬────────┘      └────────┬────────┘
         │                        │                        │
         └────────────────────────┼────────────────────────┘
                                  │
                                  ▼
                     ┌─────────────────────────────┐
                     │       POSTGRESQL DB         │
                     │        (Port 5432)          │
                     └─────────────────────────────┘
```

### Capacity

| Component | Count | Workers | Total Capacity |
|-----------|-------|---------|----------------|
| Backend Containers | 3 | 8 each | 24 concurrent requests |

---

## System Components

### 1. Nginx Load Balancer
- **Purpose:** Distributes incoming HTTP requests across backend instances
- **Algorithm:** Round-robin (default)
- **Port:** 8000 (external) → 80 (internal)

### 2. Backend Containers (×3)
Each backend container runs:
- **Nginx:** Local web server (port 80)
- **PHP-FPM:** FastCGI Process Manager with multiple workers
- **Supervisor:** Process manager to run Nginx + PHP-FPM

### 3. PHP-FPM Workers
- **Type:** Dynamic pool
- **Max Workers:** 8 per container
- **Start Workers:** 4 per container
- **Min Spare:** 2
- **Max Spare:** 6

### 4. PostgreSQL Database
- **Version:** 15
- **Port:** 5432
- Shared across all backend instances

### 5. Vue.js Frontend
- **Port:** 5173
- Development server with hot reload

---

## File Structure

```
cms/
├── docker/
│   ├── backend/
│   │   ├── Dockerfile           # Backend container definition
│   │   ├── nginx.conf           # Backend nginx configuration
│   │   ├── php-fpm.conf         # PHP-FPM worker configuration
│   │   └── supervisord.conf     # Process manager configuration
│   ├── frontend/
│   │   └── Dockerfile           # Frontend container definition
│   └── nginx/
│       ├── Dockerfile           # Load balancer container definition
│       └── nginx.conf           # Load balancer configuration
├── backend/                     # Laravel application
├── frontend/                    # Vue.js application
├── docker-compose.yml           # Container orchestration
└── docs/
    └── NGINX_LOAD_BALANCING.md  # This documentation
```

---

## Configuration Details

### 1. Docker Compose (`docker-compose.yml`)

Defines all services and their relationships:

```yaml
services:
  nginx:           # Load balancer
  backend1:        # First backend instance
  backend2:        # Second backend instance
  backend3:        # Third backend instance
  frontend:        # Vue.js development server
  db:              # PostgreSQL database
```

**Key configurations per backend:**
- `hostname: backend1/2/3` - Unique hostname for identification
- `INSTANCE_ID` environment variable
- Shared volume for Laravel code
- Connected to `app-network`

### 2. Load Balancer Nginx (`docker/nginx/nginx.conf`)

```nginx
# Upstream servers for load balancing
upstream backend_servers {
    server backend1:80;
    server backend2:80;
    server backend3:80;
}

# Custom log format showing which backend handled request
log_format upstream_log '$remote_addr - $remote_user [$time_local] '
                        '"$request" $status $body_bytes_sent '
                        'upstream: $upstream_addr response_time: $upstream_response_time';
```

**Features:**
- Round-robin load balancing
- Custom logging with upstream server info
- `X-Upstream-Server` response header
- Proxy headers for proper client IP forwarding

### 3. Backend Nginx (`docker/backend/nginx.conf`)

Handles PHP requests via FastCGI:

```nginx
location ~ \.php$ {
    fastcgi_pass 127.0.0.1:9000;
    fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
    include fastcgi_params;
}
```

### 4. PHP-FPM Configuration (`docker/backend/php-fpm.conf`)

```ini
pm = dynamic              # Dynamic process management
pm.max_children = 8       # Maximum workers
pm.start_servers = 4      # Initial workers
pm.min_spare_servers = 2  # Minimum idle workers
pm.max_spare_servers = 6  # Maximum idle workers
pm.max_requests = 500     # Requests before worker respawn
clear_env = no            # Preserve environment variables
```

### 5. Supervisor Configuration (`docker/backend/supervisord.conf`)

Manages both Nginx and PHP-FPM processes:

```ini
[program:php-fpm]
command=/usr/local/sbin/php-fpm --nodaemonize

[program:nginx]
command=/usr/sbin/nginx -g "daemon off;"
```

---

## PHP-FPM Deep Dive

### What is PHP-FPM?

**PHP-FPM** (FastCGI Process Manager) is a PHP process manager that:
- Spawns multiple PHP worker processes
- Manages their lifecycle
- Distributes incoming requests to available workers

```
┌─────────────────────────────────────────────────────────┐
│                      PHP-FPM                            │
│  ┌─────────────────────────────────────────────────┐   │
│  │              MASTER PROCESS                      │   │
│  │   - Reads config file                            │   │
│  │   - Spawns/kills workers                         │   │
│  │   - Listens on port 9000                         │   │
│  │   - Assigns requests to workers                  │   │
│  └─────────────────────────────────────────────────┘   │
│                         │                               │
│       ┌─────────────────┼─────────────────┐            │
│       ▼                 ▼                 ▼            │
│  ┌─────────┐      ┌─────────┐      ┌─────────┐        │
│  │Worker 1 │      │Worker 2 │      │Worker 3 │  ...   │
│  │ (PHP)   │      │ (PHP)   │      │ (PHP)   │        │
│  └─────────┘      └─────────┘      └─────────┘        │
└─────────────────────────────────────────────────────────┘
```

### Configuration Explained

#### Pool Name
```ini
[www]
```
- Pool name is `www`
- One PHP-FPM can have multiple pools (e.g., `[www]`, `[api]`, `[admin]`)
- Each pool has its own workers and settings

#### User/Group
```ini
user = www-data
group = www-data
```
- Workers run as `www-data` user (not root)
- Security: limits what PHP can access
- Must match nginx user for file permissions

#### Listen Address
```ini
listen = 127.0.0.1:9000
```
- Workers accept connections on `localhost:9000`
- Nginx connects here to run PHP files

```
Nginx                    PHP-FPM
  │                         │
  │  "Run index.php"        │
  │ ──────────────────────► │ port 9000
  │                         │
  │  HTML response          │
  │ ◄────────────────────── │
```

#### Process Manager Mode
```ini
pm = dynamic
```

| Mode | Behavior | Best For |
|------|----------|----------|
| `static` | Fixed number of workers always running | Consistent high traffic |
| `dynamic` | Workers scale between min/max | Variable traffic ✓ |
| `ondemand` | Workers spawn only when needed | Low traffic, save RAM |

#### Maximum Workers
```ini
pm.max_children = 8
```
- **Maximum** 8 workers can exist at once
- Limits memory usage: 8 × 50MB = 400MB max
- More workers = more concurrent requests

```
Requests: 10 arrive simultaneously

Workers: [1][2][3][4][5][6][7][8] ← All busy (8 max)
                                     
Queue:   [9][10] ← Wait for free worker
```

#### Starting Workers
```ini
pm.start_servers = 4
```
- Start with **4 workers** when PHP-FPM boots
- Ready to handle requests immediately
- Scales up/down based on demand

```
Startup Timeline:

T=0   PHP-FPM starts
      ├── Worker 1 spawned
      ├── Worker 2 spawned
      ├── Worker 3 spawned
      └── Worker 4 spawned
      
      Ready to handle 4 concurrent requests!
```

#### Spare Worker Limits
```ini
pm.min_spare_servers = 2
pm.max_spare_servers = 6
```
- **Spare** = idle workers waiting for requests
- Keep at least 2 idle workers (ready for sudden traffic)
- Kill workers if more than 6 are idle (save memory)

```
Scenario: Traffic decreases

Before:  [BUSY][BUSY][IDLE][IDLE][IDLE][IDLE][IDLE][IDLE]
                      └────────── 6 spare ──────────┘
                      
         max_spare_servers = 6, so this is OK

After more traffic drop:
         [BUSY][IDLE][IDLE][IDLE][IDLE][IDLE][IDLE][IDLE]
                └───────────── 7 spare ─────────────┘
                
         7 > 6, so kill 1 worker:
         [BUSY][IDLE][IDLE][IDLE][IDLE][IDLE][IDLE]
                └──────────── 6 spare ────────────┘
```

#### Worker Recycling
```ini
pm.max_requests = 500
```
- Each worker handles **500 requests** then dies
- Master spawns a new worker to replace it
- **Why?** Prevents memory leaks from accumulating

```
Worker Lifecycle:

Birth → Request 1 → Request 2 → ... → Request 500 → Death
                                                      ↓
                                              New Worker Born
```

#### Environment Variables
```ini
clear_env = no
```
- `no` = Workers **inherit** environment variables from Docker
- `yes` = Workers start with empty environment (more secure)
- We need `no` to pass `INSTANCE_ID` from Docker

```
Docker Container
├── INSTANCE_ID=backend1
├── DB_HOST=db
└── ...
    ↓
PHP-FPM Master (reads env)
    ↓ clear_env = no
Worker (has access to env)
    ↓
getenv('INSTANCE_ID') → "backend1" ✓
```

#### Logging
```ini
catch_workers_output = yes
decorate_workers_output = no
access.log = /var/log/php-fpm-access.log
```

| Setting | Effect |
|---------|--------|
| `catch_workers_output = yes` | Capture `echo`, errors from PHP |
| `decorate_workers_output = no` | Don't add prefixes to output |
| `access.log` | Log each request to this file |

### How Dynamic Scaling Works

```
Traffic Pattern → Worker Count

Low Traffic (2 req/s):
┌──────────────────────────────────┐
│ [W1:busy] [W2:idle] [W3:idle]    │  3 workers
└──────────────────────────────────┘
  min_spare_servers = 2 ✓

Medium Traffic (5 req/s):
┌──────────────────────────────────────────────┐
│ [W1:busy][W2:busy][W3:busy][W4:idle][W5:idle]│  5 workers
└──────────────────────────────────────────────┘

High Traffic (8 req/s):
┌────────────────────────────────────────────────────────┐
│ [W1][W2][W3][W4][W5][W6][W7][W8] ← All 8 busy          │
└────────────────────────────────────────────────────────┘
  max_children = 8, can't spawn more

Traffic Spike (15 req/s):
┌────────────────────────────────────────────────────────┐
│ [W1][W2][W3][W4][W5][W6][W7][W8] + [Queue: 7 waiting]  │
└────────────────────────────────────────────────────────┘
```

### Complete Request Flow

```
1. Request arrives at Nginx (port 80)
              │
              ▼
2. Nginx sees .php file
              │
              ▼
3. Nginx connects to PHP-FPM (port 9000)
              │
              ▼
4. PHP-FPM Master receives request
              │
              ▼
5. Master checks for idle worker
              │
   ┌──────────┴──────────┐
   │                     │
   ▼                     ▼
Worker Available?     No Worker Free?
   │                     │
   ▼                     ▼
Assign to idle      Queue request
worker              (wait for worker)
   │                     │
   └──────────┬──────────┘
              │
              ▼
6. Worker executes PHP/Laravel code
              │
              ▼
7. Worker sends response to Nginx
              │
              ▼
8. Worker becomes idle (ready for next)
              │
              ▼
9. After 500 requests, worker dies
              │
              ▼
10. Master spawns replacement worker
```

### Quick Reference

| Setting | Value | Meaning |
|---------|-------|---------|
| `pm` | dynamic | Scale workers based on load |
| `max_children` | 8 | Never more than 8 workers |
| `start_servers` | 4 | Boot with 4 workers |
| `min_spare_servers` | 2 | Always keep 2 idle |
| `max_spare_servers` | 6 | Kill extras beyond 6 idle |
| `max_requests` | 500 | Recycle worker after 500 requests |
| `clear_env` | no | Keep Docker environment vars |

---

## CPU Cores vs Workers

### The Basic Rule

| Workload Type | Optimal Workers per Core |
|---------------|-------------------------|
| **CPU-bound** (heavy computation, image processing) | 1 worker per core |
| **I/O-bound** (database, API calls, file reads) | 2-4 workers per core |

**PHP/Laravel is typically I/O-bound** (waiting for database, external APIs), so you can run more workers than cores.

### Why More Workers Than Cores Works

```
Scenario: 2 CPU Cores, 8 Workers

Core 1                          Core 2
──────                          ──────
Worker 1: [COMPUTE]             Worker 5: [COMPUTE]
Worker 2: [WAIT DB...]          Worker 6: [WAIT DB...]
Worker 3: [WAIT DB...]          Worker 7: [WAIT API...]
Worker 4: [WAIT DB...]          Worker 8: [WAIT DB...]
    │                               │
    └───── Only 2 actually          │
           using CPU ───────────────┘

The other 6 workers are SLEEPING (waiting for I/O)
They cost memory but NOT CPU time
```

### What Happens During a Request

```
Timeline of a typical Laravel request:

[CPU: 2ms] Parse request
[WAIT: 50ms] Database query ←── Worker sleeps, CPU runs other workers
[CPU: 1ms] Process data
[WAIT: 30ms] Another query ←── Worker sleeps again
[CPU: 1ms] Build response

Total: 84ms
CPU time: 4ms (5%)
I/O wait: 80ms (95%)
```

**95% of the time, the worker is waiting** - that's why we can have many workers per core!

### Visual Comparison

```
CPU-BOUND Work (Video Encoding):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2 cores, 2 workers = ✅ Good (100% CPU usage)
2 cores, 8 workers = ❌ Bad (workers fight for CPU, slower)

I/O-BOUND Work (Laravel API):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2 cores, 2 workers = ❌ Wasted (cores idle during DB waits)
2 cores, 8 workers = ✅ Good (always work ready when CPU free)
```

### Formula

```
Optimal Workers = CPU Cores × (1 + Wait Time / Compute Time)

For Laravel (typical 95% wait, 5% compute):
Workers = Cores × (1 + 95/5)
Workers = Cores × 20

But limited by:
- Memory (each worker uses 30-50MB)
- Database connections
- Diminishing returns after ~4× cores
```

**Practical recommendation for Laravel:**

```
Workers per container = 2-4 × CPU cores allocated
```

### Current Setup Visualization

```
┌─────────────────────────────────────────────────────────┐
│  Machine: Let's say 4 CPU cores                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Container 1        Container 2        Container 3      │
│  ┌───────────┐      ┌───────────┐      ┌───────────┐   │
│  │ 8 workers │      │ 8 workers │      │ 8 workers │   │
│  └───────────┘      └───────────┘      └───────────┘   │
│       │                  │                  │          │
│       └──────────────────┼──────────────────┘          │
│                          │                              │
│                    24 total workers                     │
│                          │                              │
│                    Share 4 CPU cores                    │
│                          │                              │
│           At any moment: ~4 running, ~20 waiting        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Key Insight

> **Workers ≠ Parallel Execution**
>
> Having 24 workers doesn't mean 24 requests run *simultaneously* on CPU.
> It means 24 requests can be *in progress* at once (most waiting for I/O).
> Only `N` workers run at any instant, where `N` = number of CPU cores.

### Quick Reference Table

| CPU Cores | Min Workers | Recommended | Max Workers |
|-----------|-------------|-------------|-------------|
| 1 | 2 | 4 | 8 |
| 2 | 4 | 8 | 16 |
| 4 | 8 | 16 | 32 |
| 8 | 16 | 32 | 64 |

**Memory check:** Workers × 50MB should fit in available RAM

---

## How It Works

### Request Flow

```
1. Client Request
   │
   ▼
2. Nginx Load Balancer (port 8000)
   - Receives request
   - Selects backend using round-robin
   - Forwards to selected backend
   │
   ▼
3. Backend Nginx (port 80)
   - Receives proxied request
   - Routes to PHP-FPM for .php files
   │
   ▼
4. PHP-FPM Worker Pool
   - Master assigns request to available worker
   - Worker executes Laravel code
   │
   ▼
5. Laravel Application
   - Middleware logs instance ID
   - Controller processes request
   - Database queries executed
   │
   ▼
6. Response
   - Includes X-Backend-Instance header
   - Includes X-Worker-PID header
   - Returns through nginx chain to client
```

### Multiple Instances & Workers Together

```
                              ┌─────────────────┐
                              │  Nginx (LB)     │
                              │   port 8000     │
                              └────────┬────────┘
                                       │
          ┌────────────────────────────┼────────────────────────────┐
          │                            │                            │
          ▼                            ▼                            ▼
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│     backend1        │    │     backend2        │    │     backend3        │
│  ┌───────────────┐  │    │  ┌───────────────┐  │    │  ┌───────────────┐  │
│  │    Nginx      │  │    │  │    Nginx      │  │    │  │    Nginx      │  │
│  │   (port 80)   │  │    │  │   (port 80)   │  │    │  │   (port 80)   │  │
│  └───────┬───────┘  │    │  └───────┬───────┘  │    │  └───────┬───────┘  │
│          │          │    │          │          │    │          │          │
│  ┌───────▼───────┐  │    │  ┌───────▼───────┐  │    │  ┌───────▼───────┐  │
│  │   PHP-FPM     │  │    │  │   PHP-FPM     │  │    │  │   PHP-FPM     │  │
│  │  4-8 workers  │  │    │  │  4-8 workers  │  │    │  │  4-8 workers  │  │
│  └───────────────┘  │    │  └───────────────┘  │    │  └───────────────┘  │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘

Total concurrent capacity: 3 containers × 8 workers = 24 requests
```

### Request Assignment Flow

```
1. Request arrives at Nginx
         │
         ▼
2. Nginx picks a backend (round-robin)
   → Sends to backend2:80
         │
         ▼
3. PHP-FPM master receives request
         │
         ▼
4. PHP-FPM assigns to available worker
   ┌─────────────────────────────┐
   │ Worker 1: [BUSY]            │
   │ Worker 2: [BUSY]            │
   │ Worker 3: [IDLE] ← Assigned │
   │ Worker 4: [BUSY]            │
   └─────────────────────────────┘
         │
         ▼
5. Worker 3 processes request
   - Runs PHP code
   - Queries database (waits)
   - Returns response
         │
         ▼
6. Worker 3 → [IDLE] (ready for next request)
```

### Why Both Containers AND Workers?

**Multiple Containers:**
- ✓ Fault isolation (one crashes, others continue)
- ✓ Can run on different servers
- ✓ Independent deployments

**Multiple Workers (inside each container):**
- ✓ Efficient memory sharing (same PHP code loaded once)
- ✓ Better CPU utilization
- ✓ Less overhead than containers

**Best Practice Formula:**

```
Workers per container = 2-4 × CPU cores allocated to that container

Example:
- Container has 2 CPU cores allocated
- Use 4-8 PHP-FPM workers per container
- 3 containers × 6 workers = 18 concurrent capacity
```

---

## Running the Application

### Start All Services

```bash
docker-compose up --build
```

### Start in Background

```bash
docker-compose up --build -d
```

### Stop All Services

```bash
docker-compose down
```

### Rebuild Specific Service

```bash
docker-compose up --build backend1 backend2 backend3
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f nginx
docker-compose logs -f backend1
```

---

## Testing Load Balancing

### Single Request Test

```bash
curl -I http://localhost:8000/api/categories
```

Look for headers:
- `X-Upstream-Server: 172.x.x.x:80`
- `X-Backend-Instance: backend1`
- `X-Worker-PID: 12345`

### Multiple Requests Test

```bash
# Send 10 requests and show distribution
for i in {1..10}; do 
  curl -s -I http://localhost:8000/api/categories | grep X-Backend
done
```

Expected output (rotating backends):
```
X-Backend-Instance: backend1
X-Backend-Instance: backend2
X-Backend-Instance: backend3
X-Backend-Instance: backend1
X-Backend-Instance: backend2
...
```

### Load Test with Apache Bench

```bash
# 100 requests, 10 concurrent
ab -n 100 -c 10 http://localhost:8000/api/categories
```

### Check Laravel Logs

```bash
cat backend/storage/logs/laravel.log | tail -20
```

Shows:
```
[2025-12-27 04:50:00] local.INFO: Request handled by backend1 (worker: 8) {...}
[2025-12-27 04:50:00] local.INFO: Request handled by backend2 (worker: 12) {...}
[2025-12-27 04:50:00] local.INFO: Request handled by backend3 (worker: 9) {...}
```

---

## Scaling Guide

### Adding More Backend Instances

1. **Add to `docker-compose.yml`:**

```yaml
backend4:
  build:
    context: .
    dockerfile: docker/backend/Dockerfile
  container_name: inventory_backend_4
  hostname: backend4
  volumes:
    - ./backend:/var/www/html
  environment:
    DB_CONNECTION: pgsql
    DB_HOST: db
    DB_PORT: 5432
    DB_DATABASE: inventory
    DB_USERNAME: user
    DB_PASSWORD: password
    INSTANCE_ID: backend4
  depends_on:
    - db
  networks:
    - app-network
  restart: unless-stopped
```

2. **Update load balancer nginx dependencies:**

```yaml
nginx:
  depends_on:
    - backend1
    - backend2
    - backend3
    - backend4  # Add new backend
```

3. **Update `docker/nginx/nginx.conf`:**

```nginx
upstream backend_servers {
    server backend1:80;
    server backend2:80;
    server backend3:80;
    server backend4:80;  # Add new backend
}
```

4. **Rebuild:**

```bash
docker-compose up --build
```

### Adjusting Workers Per Container

Edit `docker/backend/php-fpm.conf`:

```ini
pm.max_children = 12      # Increase max workers
pm.start_servers = 6      # Increase initial workers
```

### Resource Limits

Add to each backend in `docker-compose.yml`:

```yaml
backend1:
  deploy:
    resources:
      limits:
        cpus: '1.0'       # Max 1 CPU core
        memory: 512M      # Max 512MB RAM
      reservations:
        cpus: '0.5'       # Guaranteed 0.5 core
        memory: 256M      # Guaranteed 256MB RAM
```

### Scaling Recommendations

| Machine RAM | CPU Cores | Recommended Backends | Workers/Backend | Total Capacity |
|-------------|-----------|---------------------|-----------------|----------------|
| 4GB | 2 | 2-3 | 4 | 8-12 |
| 8GB | 4 | 3-4 | 6 | 18-24 |
| 16GB | 8 | 4-6 | 8 | 32-48 |
| 32GB+ | 16+ | 6-10 | 10 | 60-100 |

---

## Handling High Traffic

### Current Capacity vs 5000 Requests

```
┌─────────────────────────────────────────────────────────────────┐
│                    5000 CONCURRENT REQUESTS                      │
│                           arrive at                              │
│                              ↓                                   │
│                    ┌─────────────────┐                          │
│                    │  Nginx LB Queue │ ← Requests wait here     │
│                    │   (unbounded)   │                          │
│                    └────────┬────────┘                          │
│                             │                                    │
│              Only 24 can be processed at once                   │
│                             ↓                                    │
│     ┌───────────────────────────────────────────────┐           │
│     │           24 Workers Processing               │           │
│     │  [W1][W2][W3]...[W24] ← All busy              │           │
│     └───────────────────────────────────────────────┘           │
│                             │                                    │
│                    4976 requests waiting                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### The Math

```
Given:
- 24 workers total
- Average request time: 100ms (0.1 seconds)
- 5000 concurrent requests

Throughput = 24 workers × (1000ms / 100ms) = 240 requests/second

Time to process 5000 requests:
5000 ÷ 240 = ~21 seconds

First 24 requests:  Complete in 100ms
Last request (#5000): Completes after ~21 seconds
```

### Timeline

```
T=0ms      5000 requests arrive
           ├── 24 start processing immediately
           └── 4976 wait in queue

T=100ms    First 24 complete → Next 24 start
           └── 4952 still waiting

T=200ms    Next 24 complete → Next 24 start
           └── 4928 still waiting

... continues ...

T=21000ms  Last batch completes
           All 5000 requests served
```

### Response Time Distribution

```
Request #    | Wait Time  | Process Time | Total Time
-------------|------------|--------------|------------
1-24         | 0ms        | 100ms        | 100ms
25-48        | 100ms      | 100ms        | 200ms
49-72        | 200ms      | 100ms        | 300ms
...          | ...        | ...          | ...
4977-5000    | 20,800ms   | 100ms        | 20,900ms ❌
```

**Problem:** Later requests wait 20+ seconds! Users will abandon.

### Queue Limits & Failures

```
Level 1: Nginx (Load Balancer)
├── proxy_connect_timeout: 60s
├── If backend busy → waits/queues
└── Too long → 504 Gateway Timeout

Level 2: Backend Nginx  
├── Queues requests for PHP-FPM
└── listen.backlog (default: 511)

Level 3: PHP-FPM
├── listen.backlog = 511 (default)
├── pm.max_children = 8
└── If queue full → 502 Bad Gateway
```

### Realistic Outcome with Current Setup

```
5000 Concurrent Requests
━━━━━━━━━━━━━━━━━━━━━━━━

✅ Processed immediately:     24  (0.5%)
✅ Queued and processed:   ~1500  (30%)
❌ 502/504 Errors:         ~3476  (69.5%)

Average response time for successful: 3-10 seconds
Many users see: "502 Bad Gateway" or timeout
```

### What You Need for 5000 Concurrent Requests

**Option 1: Scale Workers (Quick Fix)**

```
Target: 5000 concurrent with <1s response

If each request takes 100ms:
Workers needed = 5000 × (100ms / 1000ms) = 500 workers

Setup:
- 50 containers × 10 workers each = 500 workers
- Needs: ~25GB RAM (500 × 50MB)
- Needs: 50-100 CPU cores (2-4× ratio)
```

**Option 2: Optimize Request Time (Better)**

```
Current: 100ms per request → 240 req/s with 24 workers
Optimized: 20ms per request → 1200 req/s with 24 workers

How to optimize:
- Add Redis caching (10× faster than DB)
- Optimize SQL queries
- Use database connection pooling
- Add response caching in nginx
```

**Option 3: Realistic Production Setup**

```yaml
# For 5000 concurrent requests

Backend instances: 20
Workers per instance: 12
Total workers: 240

With 50ms average response:
Throughput: 240 × 20 = 4800 req/s
Queue wait: ~1 second for 5000 concurrent

Hardware needed:
- 24-48 CPU cores
- 16-32 GB RAM
- Database with connection pooling
```

### Scaling Reference

| Concurrent Requests | Workers Needed | Containers × Workers | RAM Needed |
|---------------------|----------------|---------------------|------------|
| 100 | 24 | 3 × 8 | 2GB |
| 500 | 60 | 6 × 10 | 4GB |
| 1000 | 120 | 12 × 10 | 8GB |
| 5000 | 500 | 50 × 10 | 32GB |
| 10000 | 1000+ | Use Kubernetes | 64GB+ |

---

## Monitoring & Logging

### Nginx Load Balancer Logs

```bash
docker logs inventory_nginx
```

Output includes upstream server for each request:
```
192.168.1.1 - - [27/Dec/2025:04:50:00 +0000] "GET /api/categories HTTP/1.1" 
200 1234 upstream: 172.18.0.3:80 response_time: 0.015
```

### Backend Container Logs

```bash
docker logs inventory_backend_1
docker logs inventory_backend_2
docker logs inventory_backend_3
```

### Laravel Application Logs

```bash
tail -f backend/storage/logs/laravel.log
```

### Container Status

```bash
docker-compose ps
```

### Resource Usage

```bash
docker stats
```

---

## Troubleshooting

### Common Issues

#### 1. Backend Not Responding

**Symptom:** 502 Bad Gateway

**Solutions:**
```bash
# Check if backends are running
docker-compose ps

# Check backend logs
docker logs inventory_backend_1

# Restart backends
docker-compose restart backend1 backend2 backend3
```

#### 2. Database Connection Failed

**Symptom:** SQLSTATE Connection refused

**Solutions:**
```bash
# Check if database is running
docker-compose ps db

# Check database logs
docker logs inventory_db

# Wait for database to be ready, then restart backends
docker-compose restart backend1 backend2 backend3
```

#### 3. Instance ID Shows "Unknown"

**Symptom:** Logs show `Request handled by unknown`

**Solutions:**
- Verify `hostname` is set in `docker-compose.yml`
- Verify `clear_env = no` in `php-fpm.conf`
- Rebuild containers: `docker-compose up --build`

#### 4. All Requests Go to Same Backend

**Symptom:** Same `X-Backend-Instance` for all requests

**Solutions:**
```bash
# Check upstream configuration
docker exec inventory_nginx cat /etc/nginx/conf.d/nginx.conf

# Check all backends are healthy
docker-compose ps
```

#### 5. Slow Response Times

**Solutions:**
- Increase PHP-FPM workers in `php-fpm.conf`
- Add more backend instances
- Check database query performance
- Monitor with `docker stats`

### Health Checks

```bash
# Check nginx load balancer
curl http://localhost:8000/health

# Check individual backends (from another container)
docker exec inventory_nginx curl http://backend1:80/api/categories
docker exec inventory_nginx curl http://backend2:80/api/categories
docker exec inventory_nginx curl http://backend3:80/api/categories
```

---

## Summary

This setup provides:

- **High Availability:** Multiple backend instances handle traffic
- **Scalability:** Easy to add more instances or workers
- **Fault Tolerance:** If one backend fails, others continue serving
- **Observability:** Detailed logging of request distribution
- **Efficiency:** PHP-FPM workers maximize CPU utilization

**Total Concurrent Capacity:** 3 containers × 8 workers = **24 simultaneous requests**

---

*Documentation generated for CMS Inventory System*
