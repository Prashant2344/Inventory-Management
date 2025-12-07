FROM php:8.2-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    libpq-dev

# Clear cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo_pgsql mbstring exif pcntl bcmath gd

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Expose port (if we were using `artisan serve` or similar, but FPM uses 9000 by default. 
# We'll use artisan serve for dev simplicity or setup a proper nginx.
# User asked for "Backend in Laravel", running on single network.
# For dev, `php artisan serve` is easiest to expose on 8000.
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
