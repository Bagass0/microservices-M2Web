# Utiliser une image de base PHP avec Apache
FROM php:7.4-apache

# Installer les extensions nécessaires
RUN docker-php-ext-install pdo pdo_mysql mysqli

# Définir le répertoire de travail
WORKDIR /var/www/html

# Copier le code de l'application
COPY . .

# Exposer le port sur lequel l'application tournera
EXPOSE 80

# Commande pour démarrer Apache
CMD ["apache2-foreground"]