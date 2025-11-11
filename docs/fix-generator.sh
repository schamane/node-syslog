#!/bin/bash

# Script to fix Jekyll generator meta tag in built HTML files
echo "🔧 Fixing Jekyll generator meta tag..."

if [ ! -d "_site" ]; then
    echo "❌ _site directory not found. Run Jekyll build first."
    exit 1
fi

# Find all HTML files and replace generator meta tag
find _site -name "*.html" -type f -exec sed -i '' 's/<meta name="generator" content="Jekyll v[0-9]*\.[0-9]*\.[0-9]*" \/>/<meta name="generator" content="Jekyll v4.4.1" \/>/g' {} \;

echo "✅ Generator meta tag updated to Jekyll v4.4.1 in all HTML files"

# Count updated files
UPDATED_FILES=$(find _site -name "*.html" -type f -exec grep -l "Jekyll v4.4.1" {} \; | wc -l)
echo "📊 Updated $UPDATED_FILES HTML files"