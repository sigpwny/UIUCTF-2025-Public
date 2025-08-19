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
COPY linux-headers.tar.zst /home/user/
RUN tar -C /home/user/ -xf /home/user/linux-headers.tar.zst

FROM alpine AS build-base

RUN apk add build-base

FROM build-base AS module-build

RUN apk add elfutils-dev

COPY exploit.c /
COPY Makefile /
COPY --from=tar-extract /home/user/linux-headers /linux-headers

RUN make

FROM build-base AS simple-build

COPY lua_payload.S flashtool.c /

RUN gcc -static -nostartfiles lua_payload.S -o lua_payload.o
RUN objcopy -j .text -O binary lua_payload.o lua_payload

RUN gcc -static flashtool.c -o flashtool
RUN strip flashtool

FROM alpine AS edk2-build

RUN apk update && apk add git
RUN git config --global user.email "${USER}@${HOSTNAME}"
RUN git clone https://github.com/tianocore/edk2.git /edk2 -b edk2-stable202505 \
    --recursive --depth=1 --shallow-submodules

RUN apk add build-base linux-headers bash curl nasm iasl util-linux-dev python3

RUN dos2unix /edk2/BaseTools/Source/C/VfrCompile/VfrUtilityLib.cpp
RUN curl https://git.alpinelinux.org/aports/plain/community/edk2/build-hack.patch | patch -p1 -l -d /edk2

RUN dos2unix /edk2/MdeModulePkg/Universal/Variable/RuntimeDxe/VariableSmmRuntimeDxe.c
COPY ovmf-payload.patch /ovmf-payload.patch
RUN patch -p1 -l -d /edk2 < /ovmf-payload.patch

RUN cd /edk2 && \
    bash -c 'source edksetup.sh && \
        make -C BaseTools/Source/C -j $(nproc) && \
        build -p OvmfPkg/OvmfPkgX64.dsc -a X64 -t GCC5 -D SMM_REQUIRE -D SECURE_BOOT_ENABLE -D BUILD_SHELL=FALSE -D TPM2_ENABLE'

FROM gcr.io/kctf-docker/healthcheck@sha256:66b34a47e7bbb832012905e229da0bbed80c5c3cddd4703127ca4026ba528cfc

COPY healthcheck_loop.sh healthcheck.py healthz_webserver.py /home/user/

COPY exploit.min.lua /home/user/
COPY --from=module-build exploit.ko /home/user/
COPY --from=simple-build lua_payload flashtool /home/user/
COPY --from=edk2-build /edk2/Build/OvmfX64/DEBUG_GCC5/FV/Ffs/9F7DCADE-11EA-448a-A46F-76E003657DD1VariableSmmRuntimeDxe/9F7DCADE-11EA-448a-A46F-76E003657DD1.ffs /home/user/VariableSmmRuntimeDxe.ffs

CMD kctf_drop_privs /home/user/healthcheck_loop.sh & /home/user/healthz_webserver.py
