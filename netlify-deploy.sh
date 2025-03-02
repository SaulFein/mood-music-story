#!/bin/bash

# Build the project
npm run build
npm run build.netlify

# Deploy to Netlify
echo "To deploy to Netlify, run the following command:"
echo "netlify deploy --prod"
echo ""
echo "Before deploying, make sure to set up your environment variables in the Netlify dashboard:"
echo "- OPENAI_API_KEY"
echo "- SPOTIFY_CLIENT_ID"
echo "- SPOTIFY_CLIENT_SECRET"
echo "- SPOTIFY_REDIRECT_URI"
