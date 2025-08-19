FROM alpine AS chroot

RUN mkdir /home/user
WORKDIR /home/user

COPY flag.txt .
COPY handout.tar.gz .
RUN tar -xf handout.tar.gz && mv handout/chal . && rm -r handout

FROM gcr.io/kctf-docker/challenge@sha256:9f15314c26bd681a043557c9f136e7823414e9e662c08dde54d14a6bfd0b619f

COPY --from=chroot / /chroot

COPY nsjail.cfg /home/user/

CMD kctf_setup && \
    kctf_drop_privs \
    socat TCP-LISTEN:1337,reuseaddr,fork \
        EXEC:'kctf_pow nsjail --config /home/user/nsjail.cfg --cwd /home/user -- /home/user/chal'
