#!/bin/bash

# MongoDB Performance Optimization Script
# Creates indexes for faster admin panel queries

echo "🔧 Optimizing database for admin panel performance..."

# Get database name from URI
DB_NAME="video-directory-backend"

# Connect to MongoDB and create indexes
mongosh --quiet --eval "
use $DB_NAME;

print('Creating indexes...');

// Users collection indexes
db.users.createIndex({ email: 1 });
db.users.createIndex({ role: 1 });

// Videos collection indexes
db.videos.createIndex({ title: 1 });
db.videos.createIndex({ published: 1 });
db.videos.createIndex({ createdAt: -1 });
db.videos.createIndex({ updatedAt: -1 });
db.videos.createIndex({ skillLevel: 1 });

// Categories collection indexes
db.categories.createIndex({ name: 1 });

// Tags collection indexes
db.tags.createIndex({ name: 1 });

// Creators collection indexes
db.creators.createIndex({ name: 1 });

print('✅ Database optimization complete!');
print('📊 Admin panel queries should be much faster now.');
"

echo "✅ Database optimization script completed!"
