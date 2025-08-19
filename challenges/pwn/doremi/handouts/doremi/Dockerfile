FROM alpine AS build

RUN apk add build-base cmake git

RUN git clone https://github.com/microsoft/mimalloc.git /mimalloc -b v2.2.4 --depth=1

RUN mkdir -p /mimalloc/build
RUN cd /mimalloc/build && cmake .. && make

COPY chal.c /chal.c
RUN gcc /chal.c -o /chal

FROM alpine AS chroot

RUN apk add bash

FROM gcr.io/kctf-docker/challenge@sha256:9f15314c26bd681a043557c9f136e7823414e9e662c08dde54d14a6bfd0b619f

COPY --from=chroot / /chroot
COPY --from=build /mimalloc/build/libmimalloc.so.2.2 /chal /chroot/home/user/
COPY flag /chroot/home/user/
COPY nsjail.cfg /home/user/

CMD kctf_setup && \
    kctf_drop_privs \
    socat TCP-LISTEN:1337,reuseaddr,fork \
        EXEC:'kctf_pow nsjail --config /home/user/nsjail.cfg --cwd /home/user -- /usr/bin/env LD_PRELOAD=/home/user/libmimalloc.so.2.2 /home/user/chal'
