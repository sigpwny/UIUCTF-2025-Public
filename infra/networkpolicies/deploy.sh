#!/bin/bash

PROJECT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
CONTAINERS=()

function hook_start {
  :
}

source "${PROJECT_DIR}/../deploy.sh"
