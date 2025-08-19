FROM alpine AS go-build

RUN apk add go

COPY processing_service /processing_service
RUN cd processing_service && go build -o processing_service main.go

FROM python:3.12-alpine AS chroot

RUN pip install flask waitress && pip cache purge

FROM gcr.io/kctf-docker/challenge@sha256:9f15314c26bd681a043557c9f136e7823414e9e662c08dde54d14a6bfd0b619f

COPY --from=chroot / /chroot

RUN mkdir /chroot/home/user
COPY index.py data templates /chroot/home/user
COPY data /chroot/home/user/data
COPY templates /chroot/home/user/templates

COPY --from=go-build /processing_service/processing_service /chroot/home/user

COPY nsjail.cfg /home/user/

CMD kctf_setup && \
    kctf_drop_privs \
        nsjail --config /home/user/nsjail.cfg --cwd /home/user -E "FLAG=${FLAG}" -- /usr/local/bin/waitress-serve index:app
