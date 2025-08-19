#!/bin/bash

OUTPUT_TAR="handouts/handout.tar.gz"

ORIGINAL_FLAG="challenge/app/built-in-mcp-server/files/flag.txt"
FAKE_CONTENT="uiuctf{fakeflag}"

# Save the original flag content
ORIGINAL_CONTENT=$(cat "$ORIGINAL_FLAG")

# Overwrite the flag with the fake content
echo "$FAKE_CONTENT" > "$ORIGINAL_FLAG"

# Create the tarball
tar --exclude='challenge/app/.env.local' --exclude='challenge/app/node_modules' --exclude='challenge/app/.next' --exclude='challenge/app/*/node_modules' --exclude='challenge/app/*/.next' -czf "$OUTPUT_TAR" challenge/

# Restore the original flag content
echo "$ORIGINAL_CONTENT" > "$ORIGINAL_FLAG"
