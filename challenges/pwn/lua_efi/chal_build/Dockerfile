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

COPY kconfig /kernel/.config
RUN make -j$(nproc) -C /kernel

RUN cp /kernel/arch/x86/boot/bzImage /bzImage

FROM alpine AS keygen

RUN apk add openssl efitools

RUN openssl req -new -x509 -newkey rsa:2048 -subj "/CN=UIUCTF 2025 PK CA/" -keyout /PK.key -out /PK.crt -days 365 -nodes -sha256
RUN openssl req -new -x509 -newkey rsa:2048 -subj "/CN=UIUCTF 2025 KEK CA/" -keyout /KEK.key -out /KEK.crt -days 365 -nodes -sha256
RUN openssl req -new -x509 -newkey rsa:2048 -subj "/CN=UIUCTF 2025 UEFI CA/" -keyout /db.key -out /db.crt -days 365 -nodes -sha256

RUN cert-to-efi-sig-list -g e6934263-f337-41bd-886c-d766c307cf3b /PK.crt /PK.esl
RUN cert-to-efi-sig-list -g e6934263-f337-41bd-886c-d766c307cf3b /KEK.crt /KEK.esl
RUN cert-to-efi-sig-list -g e6934263-f337-41bd-886c-d766c307cf3b /db.crt /db.esl

RUN sign-efi-sig-list -k /PK.key -c /PK.crt PK /PK.esl /PK.auth
RUN sign-efi-sig-list -k /PK.key -c /PK.crt KEK /KEK.esl /KEK.auth
RUN sign-efi-sig-list -k /KEK.key -c /KEK.crt db /db.esl /db.auth

RUN openssl x509 -outform DER -in /PK.crt -out /PK.cer
RUN openssl x509 -outform DER -in /KEK.crt -out /KEK.cer
RUN openssl x509 -outform DER -in /db.crt -out /db.cer

FROM busybox AS initrd

COPY init /init

FROM alpine AS initrd-initchal

RUN apk add efitools

COPY init-initchal /init

COPY --from=keygen /PK.auth /PK.auth
COPY --from=keygen /KEK.auth /KEK.auth
COPY --from=keygen /db.auth /db.auth

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
        build -p OvmfPkg/OvmfPkgX64.dsc -a X64 -t GCC5 -D SMM_REQUIRE -D SECURE_BOOT_ENABLE -D BUILD_SHELL=FALSE && \
        build -p AppPkg/AppPkg.dsc -a X64 -t GCC5'

RUN mkdir -p /edk2_artifacts
RUN cp /edk2/Build/OvmfX64/DEBUG_GCC5/X64/*.debug /edk2_artifacts
RUN cp /edk2/Build/OvmfX64/DEBUG_GCC5/X64/*.efi /edk2_artifacts
RUN cp /edk2/Build/AppPkg/DEBUG_GCC5/X64/Lua.debug /edk2_artifacts
RUN cp /edk2/Build/AppPkg/DEBUG_GCC5/X64/Lua.efi /edk2_artifacts

FROM alpine:edge AS uki-build

RUN apk add ukify systemd-efistub

COPY --from=kernel-build /bzImage /bzImage
COPY --from=initrd / /initrd
RUN cd /initrd && find . -print0 | cpio -0ov -H newc | gzip -9 > /initrd.cpio.gz

RUN ukify build --linux=/bzImage --initrd=/initrd.cpio.gz --output=/bzImage.uki.efi

FROM alpine:edge AS signer

RUN apk add sbsigntool systemd-boot

COPY --from=keygen /db.key /db.key
COPY --from=keygen /db.crt /db.crt

COPY --from=edk2-build /edk2_artifacts/Lua.efi /Lua.efi

RUN sbsign --key /db.key --cert /db.crt /usr/lib/systemd/boot/efi/systemd-bootx64.efi --output /systemd-bootx64.efi
RUN sbsign --key /db.key --cert /db.crt /Lua.efi

FROM alpine AS handout-build

RUN apk add tar zstd qemu-system-x86_64

COPY --from=initrd-initchal / /initrd-initchal

RUN mkdir -p /handout/edk2_artifacts
COPY --from=edk2-build /edk2_artifacts /handout/edk2_artifacts

RUN mkdir -p /initchal
COPY --from=edk2-build /edk2/Build/OvmfX64/DEBUG_GCC5/FV/OVMF_CODE.fd /initchal/OVMF_CODE.fd
COPY --from=edk2-build /edk2/Build/OvmfX64/DEBUG_GCC5/FV/OVMF_VARS.fd /initchal/OVMF_VARS.fd
COPY --from=kernel-build /bzImage /initchal/bzImage
RUN cd /initrd-initchal && find . -print0 | cpio -0ov -H newc > /initchal/initrd

COPY initchal.sh /initchal/
RUN cd /initchal && ./initchal.sh

RUN mkdir -p /handout/run/secret
COPY --from=edk2-build /edk2/Build/OvmfX64/DEBUG_GCC5/FV/OVMF_CODE.fd /handout/run/OVMF_CODE.fd
RUN cp /initchal/OVMF_VARS.fd /handout/run/OVMF_VARS.fd
COPY --from=signer /systemd-bootx64.efi /handout/run/rootfs/EFI/BOOT/BOOTX64.EFI
COPY --from=uki-build /bzImage.uki.efi /handout/run/rootfs/EFI/LINUX/bzImage.uki.efi
COPY --from=signer Lua.efi.signed /handout/run/rootfs/Lua.efi
COPY lua.conf /handout/run/rootfs/loader/entries/lua.conf
COPY loader.conf /handout/run/rootfs/loader/loader.conf

COPY handout_run.sh /handout/run/run.sh
RUN echo 'uiuctf{TestFlag}' > /handout/run/secret/flag
COPY . /handout/chal_build

COPY handout-readme /handout/README

RUN tar -C handout --mtime="@0" --sort=name -cf - chal_build | zstd -19 -T0 > /chal_build.tar.zst
RUN tar -C handout --mtime="@0" --sort=name -cf - edk2_artifacts | zstd -19 -T0 > /edk2_artifacts.tar.zst
RUN tar -C handout --mtime="@0" --sort=name -cf - run | zstd -19 -T0 > /run.tar.zst

FROM scratch AS release
COPY --from=handout-build /chal_build.tar.zst /
COPY --from=handout-build /edk2_artifacts.tar.zst /
COPY --from=handout-build /run.tar.zst /

COPY handout-readme README
