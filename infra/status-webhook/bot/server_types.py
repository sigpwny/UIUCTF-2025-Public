from typing import TypedDict, Dict
from typing import Literal

Status = Literal[
    "Healthy (verified)",
    "Healthy",
    "Updating",
    "Unhealthy",
    "N/A"
]


class StatusInfo(TypedDict):
    status: Status
    is_good: bool


StatusesResponse = Dict[str, StatusInfo]
