import enum
import os
import threading
import time

from flask import Flask, jsonify

from kube import K8sClient


if os.path.exists("/var/run/secrets/kubernetes.io/serviceaccount"):
    client = K8sClient.from_serviceaccount()
else:
    client = K8sClient.from_file()


# This will be accessed by the API and modified by the update_statuses thread.
# Should be okay since dictionary read/writes are thread-safe.
statuses = {}


class Status(enum.Enum):
    HEALTHY_VERIFIED = enum.auto()
    HEALTHY = enum.auto()
    UPDATING = enum.auto()
    UNHEALTHY = enum.auto()
    N_A = enum.auto()

    @property
    def is_good(self) -> bool:
        return self in (self.HEALTHY_VERIFIED, self.HEALTHY)

    @property
    def verbose_name(self) -> str:
        if self is self.HEALTHY_VERIFIED:
            return "Healthy (verified)"
        if self is self.HEALTHY:
            return "Healthy"
        if self is self.UPDATING:
            return "Updating"
        if self is self.UNHEALTHY:
            return "Unhealthy"
        return "N/A"


def update_statuses():
    challenges = client.get_objects("challenges")

    challenges = [
        chal for chal in challenges
        if chal["spec"]["deployed"]
        and not chal["metadata"].get("annotations", {}).get(
            "uiuc.tf/hidden-from-status")
    ]

    for challenge in challenges:
        name = challenge["metadata"]["name"]

        deployments = client.get_objects("deployments", f"app={name}")
        if len(deployments) != 1:
            # Configured wrong
            statuses[name] = Status.UNHEALTHY
            continue

        deployment = deployments[0]

        num_replicas = deployment["status"].get("replicas", 0)
        if not num_replicas:
            statuses[name] = Status.UNHEALTHY
            continue

        num_updated_replicas = deployment["status"].get("updatedReplicas", 0)
        if num_updated_replicas != num_replicas:
            # Consider chals in the middle of a rolling update unhealthy
            # since the update may have failed and the rolling update stalls
            statuses[name] = Status.UPDATING
            continue

        num_ready_replicas = deployment["status"].get("readyReplicas", 0)
        if num_ready_replicas != num_replicas:
            # Healthcheck failed and pod is being restarted
            statuses[name] = Status.UNHEALTHY
            continue

        # The pod is healthy, so now look at the healthcheck
        if len(deployment["spec"]["template"]["spec"]["containers"]) > 1:
            statuses[name] = Status.HEALTHY_VERIFIED
        else:
            statuses[name] = Status.HEALTHY


def update_statuses_loop():
    while True:
        update_statuses()
        time.sleep(15)


# FIXME: Death of this loop should kill the pod
threading.Thread(target=update_statuses_loop, daemon=True).start()
app = Flask(__name__)


@app.route("/")
def index():
    return "UIUCTF 2025 status API endpoint"


@app.route("/status")
def status():
    return jsonify({c: {"status": s.verbose_name, "is_good": s.is_good}
                    for c, s in statuses.items()})


@app.route("/status/<string:name>")
def status_for(name):
    if name not in statuses:
        return jsonify({"error": "Challenge not found"}), 404

    return jsonify({
        "name": name,
        "status": statuses[name].verbose_name,
        "is_good": statuses[name].is_good
    })


if __name__ == "__main__":
    app.run()
