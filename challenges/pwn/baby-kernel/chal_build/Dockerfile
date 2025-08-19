# Copyright 2021-2024 Google LLC
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

# docker buildx build . --target release --output type=local,dest=../challenge

FROM ubuntu:24.04 AS kernel-build

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && \
    apt-get install -y wget build-essential && \
    apt-get install -y gawk flex bison bc zstd && \
    apt-get install -y libncurses-dev libssl-dev libssl-dev libelf-dev libudev-dev libpci-dev libiberty-dev

RUN apt-get install -y gcc-$(gcc --version | grep -oP '([0-9]+)\.([0-9]+).([0-9]+)' | head -n1 | cut -d. -f1)-plugin-dev

RUN mkdir /kernel
RUN wget https://cdn.kernel.org/pub/linux/kernel/v6.x/linux-6.6.16.tar.xz -O /kernel/linux.tar.xz
RUN tar -C /kernel -xf /kernel/linux.tar.xz

COPY kconfig /kernel/linux-6.6.16/.config

RUN make -j$(nproc) -C /kernel/linux-6.6.16

COPY vuln.c Makefile /vuln/
RUN cd /vuln && make

RUN cp /kernel/linux-6.6.16/arch/x86/boot/bzImage /bzImage

FROM busybox AS initrd

COPY init /init
COPY --from=kernel-build /vuln/vuln.ko /vuln.ko

FROM alpine AS handout-build

RUN apk add tar zstd

COPY --from=kernel-build /bzImage /handout/bzImage
COPY --from=initrd / /initrd
RUN cd /initrd && find . -print0 | cpio -0ov -H newc | gzip -9 > /handout/initrd.cpio.gz
COPY --from=kernel-build /vuln/vuln.ko /handout/vuln.ko
COPY run.sh vuln.c /handout/

RUN tar --mtime="@0" --sort=name -cf - handout | zstd -19 -T0 > /handout.tar.zst

FROM scratch AS release
COPY --from=handout-build /handout.tar.zst /
