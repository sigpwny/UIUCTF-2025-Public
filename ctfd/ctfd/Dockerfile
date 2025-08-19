# Copyright 2023 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

FROM alpine AS git-clone

RUN apk add git openssh-client

RUN git clone https://github.com/sigpwny/ctfd-dynamic-challenges-mod /ctfd-dynamic-challenges-mod && \
    git -C /ctfd-dynamic-challenges-mod checkout 6c7ded3bd8078454f509d6958c98c8ab6f0ebcc0 && \
    rm -rf /ctfd-dynamic-challenges-mod/.git

RUN git clone https://github.com/sigpwny/ctfd-discord-webhook-plugin /ctfd-discord-webhook-plugin && \
    git -C /ctfd-discord-webhook-plugin checkout b07630cdb7829a326ce70342ddf359b4130115d0 && \
    rm -rf /ctfd-discord-webhook-plugin/.git

RUN git clone https://github.com/sigpwny/ctfd-discord-auth.git /ctfd-discord-auth && \
    git -C /ctfd-discord-auth checkout 4469ad8277deefc5d2f3351dd4820cabbdac8645 && \
    rm -rf /ctfd-discord-auth/.git

RUN git clone https://github.com/sigpwny/CTFd-scores-ctftime /ctfd-scores-ctftime && \
    git -C /ctfd-scores-ctftime checkout 8b07eaf1d17aed88c3b8f2ca82751cbe72a7ec4b && \
    rm -rf /ctfd-scores-ctftime/.git

RUN git clone https://github.com/sigpwny/ctfd-csrf-plugin /ctfd-csrf-plugin && \
    git -C /ctfd-csrf-plugin checkout 37bc10c4329d8f4ed7b93f7a1ba515cd8c3ee332 && \
    rm -rf /ctfd-csrf-plugin/.git

FROM ctfd/ctfd:3.7.7

USER root

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && \
    apt-get install -y patch && \
    rm -rf /var/lib/apt/lists/*

COPY patches /patches

RUN for file in /patches/*.patch; do \
        patch -p1 -d /opt/CTFd/ < "$file"; \
    done;

COPY --from=git-clone /ctfd-dynamic-challenges-mod /opt/CTFd/CTFd/plugins/dynamic_challenges_mod
COPY --from=git-clone /ctfd-discord-webhook-plugin /opt/CTFd/CTFd/plugins/discord_webhooks_plugin
COPY --from=git-clone /ctfd-discord-auth /opt/CTFd/CTFd/plugins/discord_auth
COPY --from=git-clone /ctfd-scores-ctftime /opt/CTFd/CTFd/plugins/ctfd-scores-ctftime
COPY --from=git-clone /ctfd-csrf-plugin /opt/CTFd/CTFd/plugins/csrf_plugin

RUN python3 -m pip install -r /opt/CTFd/CTFd/plugins/discord_webhooks_plugin/requirements.txt

USER ctfd
