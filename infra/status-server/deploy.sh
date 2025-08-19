#!/bin/bash

PROJECT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
CONTAINERS=(server)

function hook_start {
  yq eval "(select(.kind == \"Deployment\") | select(.metadata.name == \"status-server\") | .spec.template.spec.containers.[] | select(.name == \"server\").image) = \"${IMAGES_REMOTE[server]}\"" --inplace "${PROJECT_DIR}/kube.yaml" || return
}

source "${PROJECT_DIR}/../deploy.sh"
