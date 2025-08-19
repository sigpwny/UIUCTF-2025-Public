# Copyright 2020-2025 Google LLC
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

FROM ubuntu:24.04 AS tar-extract

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y zstd

RUN mkdir /home/user/
COPY deploy.tar.zst /home/user/
RUN tar -C /home/user/ -xf /home/user/deploy.tar.zst

FROM alpine AS disk-build

RUN apk add btrfs-progs coreutils

RUN mkdir -p /disk.PROD
COPY flag /disk.PROD/flag
RUN mkfs.btrfs -r /disk.PROD --shrink /disk.PROD.img
RUN truncate -s +32M /disk.PROD.img

FROM alpine AS initchal

RUN apk add swtpm qemu-img gnutls-utils

COPY --from=tar-extract /home/user/deploy /initchal-enroll.PROD
COPY --from=disk-build /disk.PROD.img /initchal-enroll.PROD/disk.img

RUN cd /initchal-enroll.PROD && ./initchal.sh
RUN qemu-img convert -f raw -O qcow2 -c -o compression_type=zstd /initchal-enroll.PROD/disk.img /initchal-enroll.PROD/disk.qcow2

FROM alpine AS chroot

RUN apk add swtpm

RUN mkdir /home/user/

COPY --from=initchal /initchal-enroll.PROD /home/user/run
RUN rm /home/user/run/bzImage /home/user/run/initrd /home/user/run/initchal.sh /home/user/run/disk.img

FROM gcr.io/kctf-docker/challenge@sha256:9f15314c26bd681a043557c9f136e7823414e9e662c08dde54d14a6bfd0b619f

COPY --from=chroot / /chroot
RUN mkdir -p /chroot/proc /chroot/var/tmp
COPY chal_run.sh /chroot/home/user/run/run.sh
RUN chown -R 1000:1000 /chroot/home/user/run/tpm0

COPY nsjail.cfg /home/user/

CMD kctf_setup && \
    kctf_drop_privs \
    socat TCP-LISTEN:1337,reuseaddr,fork \
        EXEC:'kctf_pow nsjail --config /home/user/nsjail.cfg --cwd /home/user/run -- ./run.sh'
