#!/bin/bash

# Script to fix Jekyll generator meta tag in built HTML files with version validation
echo "🔧 Fixing Jekyll generator meta tag..."

if [ ! -d "_site" ]; then
    echo "❌ _site directory not found. Run Jekyll build first."
    exit 1
fi

# Verify Jekyll version before fixing
EXPECTED_VERSION="4.4.1"
echo "🔍 Verifying Jekyll version consistency..."

# Check for incorrect version references
INCORRECT_VERSIONS=$(find _site -name "*.html" -type f -exec grep -l "Jekyll v" {} \; | xargs grep -v "Jekyll v4.4.1" | wc -l)
if [ "$INCORRECT_VERSIONS" -gt 0 ]; then
    echo "⚠️  Found $INCORRECT_VERSIONS files with incorrect Jekyll version references"
else
    echo "✅ No incorrect version references found"
fi

# Find all HTML files and replace generator meta tag
find _site -name "*.html" -type f -exec sed -i '' 's/<meta name="generator" content="Jekyll v[0-9]*\.[0-9]*\.[0-9]*" \/>/<meta name="generator" content="Jekyll v4.4.1" \/>/g' {} \;

echo "✅ Generator meta tag updated to Jekyll v4.4.1 in all HTML files"

# Count updated files
UPDATED_FILES=$(find _site -name "*.html" -type f -exec grep -l "Jekyll v4.4.1" {} \; | wc -l)
echo "📊 Updated $UPDATED_FILES HTML files"

# Final validation
echo "🔍 Final validation..."
if find _site -name "*.html" -type f -exec grep -q "Jekyll v4.4.1" {} \;; then
    echo "✅ All HTML files have correct Jekyll version"
else
    echo "❌ Some HTML files missing correct Jekyll version"
    exit 1
fi