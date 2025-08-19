#!/bin/bash

OUTPUT_TAR="handouts/handout.tar.gz"

tar -czf "$OUTPUT_TAR" --exclude="adminbot/flag.txt" challenge adminbot
