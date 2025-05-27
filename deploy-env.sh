#!/bin/bash

echo "🚀 Deploying environment variables to Railway..."

# Set NODE_ENV to production if not already set
railway variables --set "NODE_ENV=production"

# Add any additional environment variables you need here
# Uncomment and set these as needed:

# For SendGrid email service
# railway variables --set "SENDGRID_API_KEY=your_sendgrid_api_key_here"

# For payment processing (Stripe)
# railway variables --set "STRIPE_SECRET_KEY=your_stripe_secret_key_here"
# railway variables --set "STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here"

# For JWT secrets
# railway variables --set "JWT_SECRET=your_jwt_secret_here"

# For session secrets (if you want to override the default)
# railway variables --set "SESSION_SECRET=your_session_secret_here"

# For Google Analytics
# railway variables --set "GA_TRACKING_ID=your_ga_id_here"

# For S3 file storage (if using AWS S3)
# railway variables --set "AWS_ACCESS_KEY_ID=your_aws_access_key"
# railway variables --set "AWS_SECRET_ACCESS_KEY=your_aws_secret_key"
# railway variables --set "AWS_BUCKET_NAME=your_bucket_name"

echo "✅ Environment variables deployed!"
echo "📋 Current variables:"
railway variables 