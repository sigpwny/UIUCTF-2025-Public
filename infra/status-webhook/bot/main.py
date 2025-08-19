from datetime import datetime
import time
import requests
import os
from server_types import StatusesResponse

POLL_INTERVAL = int(os.getenv('POLL_INTERVAL') or 15)
STATUS_SERVER_URL = os.environ["STATUS_SERVER_URL"]
WEBHOOK = os.environ["WEBHOOK_URL"]
MESSAGE_ID = os.environ["MESSAGE_ID"]


def get_challenge_statuses() -> StatusesResponse:
    response = requests.get(f'{STATUS_SERVER_URL}/status')
    return response.json()


def get_embeds(statuses: StatusesResponse):
    MAX_FIELDS_IN_EMBED = 18
    challenges = list(statuses.items())
    embed_groups = [challenges[i:i+MAX_FIELDS_IN_EMBED]
                    for i in range(0, len(challenges), MAX_FIELDS_IN_EMBED)]
    NUM_PER_ROW = 3

    if all(status['is_good'] for status in statuses.values()):
        color = 0x00ff00
    else:
        color = 0xffff00

    embeds = []
    for embed_group in embed_groups:
        embed = {
            'color': color,
            'fields': [],
            'footer': {'text': 'Last Updated'},
            'timestamp': datetime.now().isoformat()+'Z'
        }

        for chalname, status_obj in embed_group:
            status_emoji = {
                "N/A": ':yellow_circle:',
                "Unhealthy": ':red_circle:',
                "Updating": ':blue_circle:',
                "Healthy": ':green_circle:',
                "Healthy (verified)": ':green_circle:',
            }[status_obj['status']]

            status_text = status_obj['status']

            embed['fields'].append({
                'value': status_text,
                'name': f'{status_emoji} {chalname}',
                'inline': True
            })

        # make sure rows get filled
        while len(embed['fields']) % NUM_PER_ROW != 0:
            embed['fields'].append({
                'name': '\u200b',
                'value': '\u200b',
                'inline': True
            })

        embeds.append(embed)

    return embeds


def main_loop():
    statuses = get_challenge_statuses()

    message = {
        'content': '',
        'embeds': get_embeds(statuses)
    }

    r = requests.patch(f'{WEBHOOK}/messages/{MESSAGE_ID}', json=message)
    print(r.status_code)


if __name__ == "__main__":
    while True:
        main_loop()
        time.sleep(POLL_INTERVAL)
