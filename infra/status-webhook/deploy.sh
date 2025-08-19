#!/bin/bash

PROJECT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
CONTAINERS=(bot)

function hook_start {
  yq eval "(select(.kind == \"Deployment\") | select(.metadata.name == \"status-webhook\") | .spec.template.spec.containers.[] | select(.name == \"bot\").image) = \"${IMAGES_REMOTE[bot]}\"" --inplace "${PROJECT_DIR}/kube.yaml" || return
  kubectl apply -f "${PROJECT_DIR}/kube.secret.yaml" || exit 1
}

source "${PROJECT_DIR}/../deploy.sh"
