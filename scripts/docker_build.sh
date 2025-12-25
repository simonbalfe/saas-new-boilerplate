#!/bin/bash

if [ ! -f .env ]; then
    echo "Error: .env file not found in current directory."
    exit 1
fi

set -a
source .env
set +a

IMAGE_NAME="ghcr.io/simonbalfe/saas-boilerplate"
TAG="latest"

docker buildx build \
  --platform linux/amd64 \
  --build-arg UPSTASH_REDIS_REST_TOKEN="${UPSTASH_REDIS_REST_TOKEN}" \
  --build-arg UPSTASH_REDIS_REST_URL="${UPSTASH_REDIS_REST_URL}" \
  --build-arg NEXT_PUBLIC_SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL}" \
  --build-arg NEXT_PUBLIC_SUPABASE_KEY="${NEXT_PUBLIC_SUPABASE_KEY}" \
  --build-arg NEXT_PUBLIC_POSTHOG_KEY="${NEXT_PUBLIC_POSTHOG_KEY}" \
  --build-arg NEXT_PUBLIC_POSTHOG_HOST="${NEXT_PUBLIC_POSTHOG_HOST}" \
  --build-arg STRIPE_SECRET_KEY="${STRIPE_SECRET_KEY}" \
  --build-arg RESEND_API_KEY="${RESEND_API_KEY}" \
  --build-arg NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}" \
  -t "${IMAGE_NAME}:${TAG}" \
  --push \
  .

