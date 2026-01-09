#!/bin/bash

# KARTEJI Setup Script
# Skrip ini akan menginstall semua dependensi dan menjalankan aplikasi

echo "🚀 KARTEJI v2.5 Setup"
echo "===================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js tidak ditemukan. Silakan install Node.js terlebih dahulu."
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo ""

# Install Firebase Functions dependencies
echo "📦 Installing Firebase Functions dependencies..."
cd functions
npm install
if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi
cd ..

echo ""
echo "✨ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "  1. Run development server: npm run dev"
echo "  2. Open browser: http://localhost:3000"
echo "  3. Read SETUP.md for detailed documentation"
echo ""
echo "🔥 Optional Firebase setup:"
echo "  1. Install Firebase CLI: npm install -g firebase-tools"
echo "  2. Login: firebase login"
echo "  3. Deploy: firebase deploy"
echo ""
