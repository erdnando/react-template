#!/bin/bash

# Simple script to test API endpoints
API_BASE_URL="http://localhost:5098/api"

echo "🔧 Testing API Endpoints at $API_BASE_URL"
echo "=========================================="

# Test if API is running
echo "1. Testing API Health..."
curl -s -o /dev/null -w "Status: %{http_code}\n" "$API_BASE_URL/health" || echo "❌ Health endpoint failed"

# Test Users endpoint
echo "2. Testing Users endpoint..."
curl -s -o /dev/null -w "Status: %{http_code}\n" "$API_BASE_URL/Users" || echo "❌ Users endpoint failed"

# Test Tasks endpoint
echo "3. Testing Tasks endpoint..."
curl -s -o /dev/null -w "Status: %{http_code}\n" "$API_BASE_URL/Tasks" || echo "❌ Tasks endpoint failed"

# Test Catalogs endpoint
echo "4. Testing Catalogs endpoint..."
curl -s -o /dev/null -w "Status: %{http_code}\n" "$API_BASE_URL/Catalog" || echo "❌ Catalogs endpoint failed"

# Test Auth endpoint (should return 400/405 for GET)
echo "5. Testing Auth endpoint..."
curl -s -o /dev/null -w "Status: %{http_code}\n" "$API_BASE_URL/Auth/login" || echo "❌ Auth endpoint failed"

echo ""
echo "✅ Basic connectivity test completed!"
echo "Note: 404 errors are expected if endpoints are not implemented yet."
echo "200 status codes indicate successful connection."
