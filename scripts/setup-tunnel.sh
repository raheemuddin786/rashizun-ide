#!/usr/bin/env bash

# Protocol 5.1: Secure Tunneling Setup Utility
# This script facilitates the creation of secure tunnels (Cloudflare/Tailscale) 
# for global access to the Rashizun IDE without port forwarding.

echo "🌐 Rashizun Global Access - Tunneling Setup"
echo "------------------------------------------"

read -p "Select tunneling provider (1: Cloudflare, 2: Tailscale): " PROVIDER

if [[ "${PROVIDER}" == "1" ]]; then
    echo "☁️ Setting up Cloudflare Tunnel..."
    if ! command -v cloudflared &> /dev/null; then
        echo "⚠️ cloudflared not found. Please install it first."
        echo "Instructions: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/install-run/install-threads/"
        exit 1
    fi
    echo "Run the following to start the tunnel:"
    echo "  cloudflared tunnel --url http://localhost:8080"
elif [[ "${PROVIDER}" == "2" ]]; then
    echo "🐿️ Setting up Tailscale Funnel..."
    if ! command -v tailscale &> /dev/null; then
        echo "⚠️ tailscale not found. Please install it first."
        exit 1
    fi
    echo "Run the following to start the funnel:"
    echo "  tailscale funnel 8080"
else
    echo "❌ Invalid selection."
fi
