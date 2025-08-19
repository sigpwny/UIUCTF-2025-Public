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

FROM alpine AS kernel-build

RUN apk add build-base bash coreutils util-linux \
    linux-headers ncurses-dev flex bison diffutils elfutils-dev openssl-dev perl rsync

RUN wget https://cdn.kernel.org/pub/linux/kernel/v6.x/linux-6.15.4.tar.xz -O /linux.tar.xz
RUN tar -C / -xf /linux.tar.xz && mv /linux-6.15.4 /kernel

RUN apk add patch
COPY patches /patches
RUN for file in /patches/linux/*; do patch -p1 -l -d /kernel < $file; done

COPY kconfig /kernel/.config
RUN make -j$(nproc) -C /kernel
RUN cd /kernel && \
    HOSTCC=x86_64-alpine-linux-musl-gcc \
      CC=x86_64-alpine-linux-musl-gcc \
      SRCARCH=x86 srctree=/kernel \
      /kernel/scripts/package/install-extmod-build /usr/src/linux-headers

RUN cp /kernel/arch/x86/boot/bzImage /bzImage

FROM alpine AS keygen

RUN apk add openssl efitools

RUN openssl req -new -x509 -newkey rsa:2048 -subj "/CN=UIUCTF 2025 PK TEST CA/" -keyout /PK.TEST.key -out /PK.TEST.crt -days 365 -nodes -sha256
RUN openssl req -new -x509 -newkey rsa:2048 -subj "/CN=UIUCTF 2025 KEK TEST CA/" -keyout /KEK.TEST.key -out /KEK.TEST.crt -days 365 -nodes -sha256
RUN openssl req -new -x509 -newkey rsa:2048 -subj "/CN=UIUCTF 2025 UEFI TEST CA/" -keyout /db.TEST.key -out /db.TEST.crt -days 365 -nodes -sha256

RUN cert-to-efi-sig-list -g e6934263-f337-41bd-886c-d766c307cf3b /PK.TEST.crt /PK.TEST.esl
RUN cert-to-efi-sig-list -g e6934263-f337-41bd-886c-d766c307cf3b /KEK.TEST.crt /KEK.TEST.esl
RUN cert-to-efi-sig-list -g e6934263-f337-41bd-886c-d766c307cf3b /db.TEST.crt /db.TEST.esl

RUN sign-efi-sig-list -k /PK.TEST.key -c /PK.TEST.crt PK /PK.TEST.esl /PK.TEST.auth
RUN sign-efi-sig-list -k /PK.TEST.key -c /PK.TEST.crt KEK /KEK.TEST.esl /KEK.TEST.auth
RUN sign-efi-sig-list -k /KEK.TEST.key -c /KEK.TEST.crt db /db.TEST.esl /db.TEST.auth

RUN openssl req -new -x509 -newkey rsa:2048 -subj "/CN=UIUCTF 2025 PK PROD CA/" -keyout /PK.PROD.key -out /PK.PROD.crt -days 365 -nodes -sha256
RUN openssl req -new -x509 -newkey rsa:2048 -subj "/CN=UIUCTF 2025 KEK PROD CA/" -keyout /KEK.PROD.key -out /KEK.PROD.crt -days 365 -nodes -sha256
RUN openssl req -new -x509 -newkey rsa:2048 -subj "/CN=UIUCTF 2025 UEFI PROD CA/" -keyout /db.PROD.key -out /db.PROD.crt -days 365 -nodes -sha256

RUN cert-to-efi-sig-list -g e6934263-f337-41bd-886c-d766c307cf3b /PK.PROD.crt /PK.PROD.esl
RUN cert-to-efi-sig-list -g e6934263-f337-41bd-886c-d766c307cf3b /KEK.PROD.crt /KEK.PROD.esl
RUN cert-to-efi-sig-list -g e6934263-f337-41bd-886c-d766c307cf3b /db.PROD.crt /db.PROD.esl

RUN sign-efi-sig-list -k /PK.PROD.key -c /PK.PROD.crt PK /PK.PROD.esl /PK.PROD.auth
RUN sign-efi-sig-list -k /PK.PROD.key -c /PK.PROD.crt KEK /KEK.PROD.esl /KEK.PROD.auth
RUN sign-efi-sig-list -k /KEK.PROD.key -c /KEK.PROD.crt db /db.PROD.esl /db.PROD.auth

FROM alpine AS initrd-initchal-test

RUN apk add efitools

COPY init-initchal /init

COPY --from=keygen /PK.TEST.auth /PK.auth
COPY --from=keygen /KEK.TEST.auth /KEK.auth
COPY --from=keygen /db.TEST.auth /db.auth

FROM alpine AS initrd-initchal-prod

RUN apk add efitools

COPY init-initchal /init

COPY --from=keygen /PK.PROD.auth /PK.auth
COPY --from=keygen /KEK.PROD.auth /KEK.auth
COPY --from=keygen /db.PROD.auth /db.auth

FROM alpine AS uefitool-build

RUN apk update && apk add git build-base qt5-qtbase-dev bash zip

RUN git clone https://github.com/LongSoft/UEFITool /UEFITool -b old_engine --depth=1
RUN cd /UEFITool && ./unixbuild.sh

RUN strip /UEFITool/UEFIReplace/UEFIReplace

FROM alpine:edge AS initrd

COPY --from=uefitool-build /UEFITool/UEFIReplace/UEFIReplace /root/UEFIReplace

RUN apk add bash coreutils util-linux
RUN apk add efitools efibootmgr cryptsetup tpm2-tools tpm2-tss tpm2-tss-tcti-device
RUN apk add clevis --repository=http://dl-cdn.alpinelinux.org/alpine/edge/testing/

# For UEFITool
RUN apk add qt5-qtbase

RUN rm -rf /usr/share/apk /var/cache/apk/*

COPY init /init

FROM alpine AS edk2-build

RUN apk update && apk add git
RUN git config --global user.email "${USER}@${HOSTNAME}"
RUN git clone https://github.com/tianocore/edk2.git /edk2 -b edk2-stable202505 \
    --recursive --depth=1 --shallow-submodules
RUN git clone https://github.com/tianocore/edk2-libc.git /edk2-libc && \
    git -C /edk2-libc checkout 27545cb7cf32077331bcac0e008115467f5e4c53

RUN ln -s /edk2-libc/AppPkg /edk2
RUN ln -s /edk2-libc/StdLib /edk2
RUN ln -s /edk2-libc/StdLibPrivateInternalFiles /edk2

RUN apk add patch
COPY patches /patches
RUN for file in /patches/edk2/*; do patch -p1 -l -d /edk2 < $file; done
RUN for file in /patches/edk2-libc/*; do patch -p1 -l -d /edk2-libc < $file; done

RUN apk add build-base linux-headers bash curl nasm iasl util-linux-dev python3

RUN sed -i '/Lua.inf/ s/#//' /edk2-libc/AppPkg/AppPkg.dsc
COPY LuaLib.inf.inc /LuaLib.inf.inc
RUN cat /LuaLib.inf.inc >> /edk2-libc/AppPkg/Applications/Lua/LuaLib.inf

RUN dos2unix /edk2/BaseTools/Source/C/VfrCompile/VfrUtilityLib.cpp
RUN curl https://git.alpinelinux.org/aports/plain/community/edk2/build-hack.patch | patch -p1 -l -d /edk2
RUN cd /edk2 && \
    bash -c 'source edksetup.sh && \
        make -C BaseTools/Source/C -j $(nproc) && \
        build -p OvmfPkg/OvmfPkgX64.dsc -a X64 -t GCC5 -D SMM_REQUIRE -D SECURE_BOOT_ENABLE -D BUILD_SHELL=FALSE -D TPM2_ENABLE && \
        build -p AppPkg/AppPkg.dsc -a X64 -t GCC5'

RUN mkdir -p /edk2_artifacts
RUN cp /edk2/Build/OvmfX64/DEBUG_GCC5/X64/*.debug /edk2_artifacts
RUN cp /edk2/Build/OvmfX64/DEBUG_GCC5/X64/*.efi /edk2_artifacts
RUN cp /edk2/Build/AppPkg/DEBUG_GCC5/X64/Lua.debug /edk2_artifacts
RUN cp /edk2/Build/AppPkg/DEBUG_GCC5/X64/Lua.efi /edk2_artifacts

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

FROM alpine:edge AS uki-build

RUN apk add ukify systemd-efistub

COPY --from=kernel-build /bzImage /bzImage
COPY --from=initrd / /initrd
RUN cd /initrd && find . -print0 | cpio -0ov -H newc | gzip -9 > /initrd.cpio.gz

RUN ukify build --linux=/bzImage --initrd=/initrd.cpio.gz --output=/bzImage.uki.efi

FROM alpine:edge AS signer

RUN apk add sbsigntool systemd-boot

COPY --from=keygen /db.TEST.key /db.TEST.crt /db.PROD.key /db.PROD.crt /

COPY --from=edk2-build /edk2_artifacts/Lua.efi /Lua.efi
COPY --from=uki-build /bzImage.uki.efi /bzImage.uki.efi

RUN sbsign --key /db.TEST.key --cert /db.TEST.crt /usr/lib/systemd/boot/efi/systemd-bootx64.efi --output /systemd-bootx64.TEST.efi
RUN sbsign --key /db.TEST.key --cert /db.TEST.crt /Lua.efi --output /Lua.TEST.efi
RUN sbsign --key /db.TEST.key --cert /db.TEST.crt /bzImage.uki.efi --output /bzImage.uki.TEST.efi
RUN sbsign --key /db.PROD.key --cert /db.PROD.crt /usr/lib/systemd/boot/efi/systemd-bootx64.efi --output /systemd-bootx64.PROD.efi
RUN sbsign --key /db.PROD.key --cert /db.PROD.crt /Lua.efi --output /Lua.PROD.efi
RUN sbsign --key /db.PROD.key --cert /db.PROD.crt /bzImage.uki.efi --output /bzImage.uki.PROD.efi

FROM alpine AS disk-build

RUN apk add btrfs-progs coreutils

RUN mkdir -p /disk.TEST
RUN echo 'uiuctf{TestFlag}' > /disk.TEST/flag
RUN mkfs.btrfs -r /disk.TEST --shrink /disk.TEST.img
RUN truncate -s +32M /disk.TEST.img

# RUN mkdir -p /disk.PROD
# COPY flag /disk.PROD/flag
# RUN mkfs.btrfs -r /disk.PROD --shrink /disk.PROD.img
# RUN truncate -s +32M /disk.PROD.img

FROM alpine AS initchal-base

RUN apk add swtpm qemu-img gnutls-utils

FROM initchal-base AS initchal-test

COPY --from=initrd-initchal-test / /initrd-initchal.TEST

RUN mkdir -p /initchal-enroll.TEST/tpm0
COPY --from=edk2-build /edk2/Build/OvmfX64/DEBUG_GCC5/FV/OVMF_CODE.fd /initchal-enroll.TEST/OVMF_CODE.fd
COPY --from=edk2-build /edk2/Build/OvmfX64/DEBUG_GCC5/FV/OVMF_VARS.fd /initchal-enroll.TEST/OVMF_VARS.fd
COPY --from=qemu-build /qemu-system-x86_64 /initchal-enroll.TEST/qemu-system-x86_64
COPY --from=qemu-build /qemu/pc-bios/kvmvapic.bin /initchal-enroll.TEST/kvmvapic.bin
COPY --from=qemu-build /qemu/pc-bios/linuxboot_dma.bin /initchal-enroll.TEST/linuxboot_dma.bin
COPY --from=disk-build /disk.TEST.img /initchal-enroll.TEST/disk.img
COPY --from=kernel-build /bzImage /initchal-enroll.TEST/bzImage
RUN cd /initrd-initchal.TEST && find . -print0 | cpio -0ov -H newc > /initchal-enroll.TEST/initrd
COPY --from=signer /systemd-bootx64.TEST.efi /initchal-enroll.TEST/rootfs/EFI/BOOT/BOOTX64.EFI
COPY --from=signer /bzImage.uki.TEST.efi /initchal-enroll.TEST/rootfs/EFI/LINUX/bzImage.uki.efi
COPY --from=signer Lua.TEST.efi /initchal-enroll.TEST/rootfs/Lua.efi
COPY lua.conf /initchal-enroll.TEST/rootfs/loader/entries/lua.conf
COPY loader.conf /initchal-enroll.TEST/rootfs/loader/loader.conf

COPY initchal.sh /initchal-enroll.TEST/
RUN cd /initchal-enroll.TEST && ./initchal.sh
RUN qemu-img convert -f raw -O qcow2 -c -o compression_type=zstd /initchal-enroll.TEST/disk.img /initchal-enroll.TEST/disk.qcow2

FROM initchal-base AS initchal-prod

COPY --from=initrd-initchal-prod / /initrd-initchal.PROD

RUN mkdir -p /initchal-enroll.PROD/tpm0
COPY --from=edk2-build /edk2/Build/OvmfX64/DEBUG_GCC5/FV/OVMF_CODE.fd /initchal-enroll.PROD/OVMF_CODE.fd
COPY --from=edk2-build /edk2/Build/OvmfX64/DEBUG_GCC5/FV/OVMF_VARS.fd /initchal-enroll.PROD/OVMF_VARS.fd
COPY --from=qemu-build /qemu-system-x86_64 /initchal-enroll.PROD/qemu-system-x86_64
COPY --from=qemu-build /qemu/pc-bios/kvmvapic.bin /initchal-enroll.PROD/kvmvapic.bin
COPY --from=qemu-build /qemu/pc-bios/linuxboot_dma.bin /initchal-enroll.PROD/linuxboot_dma.bin
# COPY --from=disk-build /disk.PROD.img /initchal-enroll.PROD/disk.img
COPY --from=kernel-build /bzImage /initchal-enroll.PROD/bzImage
RUN cd /initrd-initchal.PROD && find . -print0 | cpio -0ov -H newc > /initchal-enroll.PROD/initrd
COPY --from=signer /systemd-bootx64.PROD.efi /initchal-enroll.PROD/rootfs/EFI/BOOT/BOOTX64.EFI
COPY --from=signer /bzImage.uki.PROD.efi /initchal-enroll.PROD/rootfs/EFI/LINUX/bzImage.uki.efi
COPY --from=signer Lua.PROD.efi /initchal-enroll.PROD/rootfs/Lua.efi
COPY lua.conf /initchal-enroll.PROD/rootfs/loader/entries/lua.conf
COPY loader.conf /initchal-enroll.PROD/rootfs/loader/loader.conf

COPY initchal.sh /initchal-enroll.PROD/
# RUN cd /initchal-enroll.PROD && ./initchal.sh
# RUN qemu-img convert -f raw -O qcow2 -c -o compression_type=zstd /initchal-enroll.PROD/disk.img /initchal-enroll.PROD/disk.qcow2

FROM alpine AS handout-build

RUN apk add tar zstd

RUN mkdir -p /handout/edk2_artifacts
COPY --from=edk2-build /edk2_artifacts /handout/edk2_artifacts

COPY --from=initchal-test /initchal-enroll.TEST /handout/run
RUN rm /handout/run/bzImage /handout/run/initrd /handout/run/initchal.sh /handout/run/disk.img
COPY handout_run.sh /handout/run/run.sh

COPY --from=kernel-build /kernel/vmlinux /handout/vmlinux
COPY --from=kernel-build /usr/src/linux-headers /handout/linux-headers

COPY . /handout/chal_build

COPY handout-readme /handout/README

RUN tar -C handout --mtime="@0" --sort=name -cf - chal_build | zstd -19 -T0 > /chal_build.tar.zst
RUN tar -C handout --mtime="@0" --sort=name -cf - edk2_artifacts | zstd -19 -T0 > /edk2_artifacts.tar.zst
RUN tar -C handout --mtime="@0" --sort=name -cf - linux-headers | zstd -19 -T0 > /linux-headers.tar.zst
RUN tar -C handout --mtime="@0" --sort=name -cf - run | zstd -19 -T0 > /run.tar.zst
RUN cat handout/vmlinux | zstd -19 -T0 > /vmlinux.zst

COPY --from=initchal-prod /initchal-enroll.PROD /deploy
RUN tar --mtime="@0" --sort=name -cf - deploy | zstd -19 -T0 > /deploy.tar.zst

FROM scratch AS release
COPY --from=handout-build /chal_build.tar.zst /
COPY --from=handout-build /edk2_artifacts.tar.zst /
COPY --from=handout-build /linux-headers.tar.zst /
COPY --from=handout-build /run.tar.zst /
COPY --from=handout-build /vmlinux.zst /

COPY handout-readme README

COPY --from=handout-build /deploy.tar.zst /
