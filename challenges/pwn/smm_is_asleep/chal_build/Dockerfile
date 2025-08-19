# Copyright 2021-2025 Google LLC
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

# DOCKER_BUILDKIT=1 docker build . --target release --output type=local,dest=../handouts

FROM alpine AS disk-base

RUN apk add build-base bash coreutils util-linux procps strace gdb gawk

FROM disk-base AS kernel-build

RUN apk add linux-headers ncurses-dev flex bison diffutils elfutils-dev openssl-dev perl rsync

RUN wget https://cdn.kernel.org/pub/linux/kernel/v6.x/linux-6.15.4.tar.xz -O /linux.tar.xz
RUN tar -C / -xf /linux.tar.xz && mv /linux-6.15.4 /kernel

COPY kconfig /kernel/.config
RUN make -j$(nproc) -C /kernel
RUN make -j$(nproc) -C /kernel headers_install INSTALL_HDR_PATH=/headers
RUN make -j$(nproc) -C /kernel modules_install
RUN cd /kernel && \
    HOSTCC=x86_64-alpine-linux-musl-gcc \
      CC=x86_64-alpine-linux-musl-gcc \
      SRCARCH=x86 srctree=/kernel \
      /kernel/scripts/package/install-extmod-build /usr/src/linux-headers

RUN cp /kernel/arch/x86/boot/bzImage /bzImage

FROM disk-base AS disk

RUN rm -rf /usr/share/apk /var/cache/apk/*

COPY --from=kernel-build /lib/modules /lib/modules
COPY --from=kernel-build /usr/src/linux-headers /usr/src/linux-headers
COPY --from=kernel-build /headers/include /usr/include

RUN ln -sf /usr/src/linux-headers /lib/modules/6.15.4-uiuctf-2025/build

FROM alpine AS disk-build

RUN apk add btrfs-progs qemu-img

COPY --from=disk / /disk

RUN rm /disk/sbin/init
COPY init /disk/sbin/init

RUN mkfs.btrfs -r /disk --shrink /disk.img
RUN qemu-img convert -f raw -O qcow2 -c -o compression_type=zstd /disk.img /disk.qcow2

FROM alpine AS edk2-build

RUN apk update && apk add git
RUN git config --global user.email "${USER}@${HOSTNAME}"
RUN git clone https://github.com/tianocore/edk2.git /edk2 -b edk2-stable202505 \
    --recursive --depth=1 --shallow-submodules

RUN apk add patch
COPY patches/edk2 /patches
RUN for file in /patches/*; do patch -p1 -l -d /edk2 < $file; done

RUN apk add build-base linux-headers bash curl nasm iasl util-linux-dev python3
RUN dos2unix /edk2/BaseTools/Source/C/VfrCompile/VfrUtilityLib.cpp
RUN curl https://git.alpinelinux.org/aports/plain/community/edk2/build-hack.patch | patch -p1 -l -d /edk2
RUN cd /edk2 && \
    bash -c 'source edksetup.sh && \
        make -C BaseTools/Source/C -j $(nproc) && \
        build -p OvmfPkg/OvmfPkgX64.dsc -a X64 -t GCC5 -D SMM_REQUIRE'

RUN mkdir /edk2_artifacts
RUN cp /edk2/Build/OvmfX64/DEBUG_GCC5/X64/*.debug /edk2_artifacts
RUN cp /edk2/Build/OvmfX64/DEBUG_GCC5/X64/*.efi /edk2_artifacts

FROM alpine AS qemu-build

RUN wget https://download.qemu.org/qemu-10.0.2.tar.xz -O /qemu.tar.xz
RUN tar -C / -xf /qemu.tar.xz && mv /qemu-10.0.2 /qemu

RUN apk add patch
COPY patches/qemu /patches
RUN for file in /patches/*; do patch -p1 -l -d /qemu < $file; done

RUN apk add build-base linux-headers python3 ninja pkgconfig \
        glib-dev glib-static pixman-dev pixman-static bash perl zlib-static \
        ncurses-static bzip2-static zstd-dev zstd-static git

RUN mkdir /qemu/build
RUN cd /qemu/build && \
    ../configure --target-list=x86_64-softmmu --disable-tools --disable-kvm \
      --disable-debug-info --disable-slirp --disable-install-blobs --disable-gio \
      --enable-zstd --disable-download --static && \
    make -j $(nproc)

RUN strip -g /qemu/build/qemu-system-x86_64 -o /qemu-system-x86_64

FROM alpine AS handout-build

RUN apk add tar zstd expect

RUN mkdir -p /handout/edk2_artifacts
COPY --from=edk2-build /edk2_artifacts /handout/edk2_artifacts

RUN mkdir -p /handout/run/
COPY --from=edk2-build /edk2/Build/OvmfX64/DEBUG_GCC5/FV/OVMF_CODE.fd /handout/run/OVMF_CODE.fd
COPY --from=edk2-build /edk2/Build/OvmfX64/DEBUG_GCC5/FV/OVMF_VARS.fd /handout/run/OVMF_VARS.fd
COPY --from=qemu-build /qemu-system-x86_64 /handout/run/qemu-system-x86_64
COPY --from=qemu-build /qemu/pc-bios/kvmvapic.bin /handout/run/kvmvapic.bin
COPY --from=qemu-build /qemu/pc-bios/linuxboot_dma.bin /handout/run/linuxboot_dma.bin
COPY --from=kernel-build /bzImage /handout/run/bzImage
COPY --from=disk-build /disk.qcow2 /handout/run/disk.qcow2

RUN mkdir -p /initchal
COPY --from=edk2-build /edk2/Build/OvmfX64/DEBUG_GCC5/FV/OVMF_CODE.fd /initchal/OVMF_CODE.fd
COPY --from=edk2-build /edk2/Build/OvmfX64/DEBUG_GCC5/FV/OVMF_VARS.fd /initchal/OVMF_VARS.fd
COPY --from=qemu-build /qemu-system-x86_64 /initchal/qemu-system-x86_64
COPY --from=qemu-build /qemu/pc-bios/kvmvapic.bin /initchal/kvmvapic.bin
COPY --from=qemu-build /qemu/pc-bios/linuxboot_dma.bin /initchal/linuxboot_dma.bin
COPY --from=kernel-build /bzImage /initchal/bzImage
COPY --from=disk-build /disk.qcow2 /initchal/disk.qcow2

COPY initchal.exp initchal.sh /initchal/

RUN cd /initchal && ./initchal.exp

RUN echo 'uiuctf{TestFlag}' > /handout/run/region4
COPY handout_run.sh /handout/run/run.sh

COPY . /handout/chal_build

RUN tar -C handout --mtime="@0" --sort=name -cf - chal_build | zstd -19 -T0 > /chal_build.tar.zst
RUN tar -C handout --mtime="@0" --sort=name -cf - edk2_artifacts | zstd -19 -T0 > /edk2_artifacts.tar.zst
RUN tar -C handout --mtime="@0" --sort=name -cf - run | zstd -19 -T0 > /run.tar.zst

FROM scratch AS release
COPY --from=handout-build /chal_build.tar.zst /
COPY --from=handout-build /handout/edk2debug.log /
COPY --from=handout-build /edk2_artifacts.tar.zst /
COPY --from=handout-build /run.tar.zst /

COPY handout-readme README
