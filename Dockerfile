# Use a base image with Apache installed
FROM httpd:2.4

# Install Node.js and npm for SCSS compilation
RUN apt-get update && apt-get install -y \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# Install Sass globally
RUN npm install -g sass

# Copy custom Apache configuration
COPY ./my-httpd.conf /usr/local/apache2/conf/httpd.conf

# Copy your static files to the Apache document root
COPY ./src /usr/local/apache2/htdocs/

# COPY ./src /var/www/html

# Set working directory for SCSS compilation
WORKDIR /usr/local/apache2/htdocs/

# Compile SCSS files into CSS (can be automated with a script)
# Example command to compile: sass input.scss output.css