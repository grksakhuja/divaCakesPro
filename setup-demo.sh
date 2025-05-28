#!/bin/bash

# Demo Mode Setup Script
echo "🧪 Setting up Touch 'n Go Payment Demo Mode..."

# Check if .env exists, create if not
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file with demo configuration..."
    cp .env.example .env
    echo "✅ Created .env file with demo mode enabled"
else
    echo "📝 .env file already exists"
    
    # Check if DEMO_MODE is set
    if grep -q "DEMO_MODE" .env; then
        echo "✅ DEMO_MODE already configured in .env"
    else
        echo "📝 Adding DEMO_MODE to existing .env file..."
        echo "" >> .env
        echo "# Demo Mode Configuration" >> .env
        echo "DEMO_MODE=true" >> .env
        echo "✅ Added DEMO_MODE=true to .env"
    fi
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi

echo ""
echo "🎉 Demo Mode Setup Complete!"
echo ""
echo "🚀 To start testing:"
echo "   npm run dev"
echo ""
echo "📱 Then visit: http://localhost:5000"
echo ""
echo "🎂 Build a cake and test the Touch 'n Go payment flow!"
echo "   • Choose 'Touch 'n Go eWallet' as payment method"
echo "   • Watch the demo payment process (takes ~20 seconds)"
echo "   • No real money will be charged!"
echo ""
echo "🧪 Look for demo indicators:"
echo "   • Orange 'DEMO MODE' banner"
echo "   • Mock QR codes"
echo "   • Demo badges and messages"
echo ""
echo "📚 For detailed testing guide, see: DEMO-MODE-TESTING.md"
