#!/bin/bash
set -e

CHAL_DIR="challenge"
TARGET_FILE="$CHAL_DIR/index_provided.ts"
ORIG_FILE="$CHAL_DIR/index.ts"
TAR_FILE="handouts/handout.tar.gz"

rm -f "$TARGET_FILE"

cp "$ORIG_FILE" "$TARGET_FILE"

sed -i 's/uiuctf{[^}]*}/uiuctf{fake_flag_xxxxxxxxxxxxxxxx}/g' "$TARGET_FILE"

tar --exclude="index.ts" -czf "$TAR_FILE" $CHAL_DIR