FROM alpine AS prune-build

RUN apk add build-base musl-fts-dev

COPY prune_wrongarch.c /prune_wrongarch.c
RUN gcc -static /prune_wrongarch.c -lfts -o /prune_wrongarch

FROM node:20-alpine AS chroot

COPY app/package*.json /app/
COPY app/built-in-mcp-server/package*.json app/built-in-mcp-server/

RUN cd /app && npm install
RUN cd /app/built-in-mcp-server && npm install

COPY app /app
RUN cd /app && npm run build

COPY --from=prune-build /prune_wrongarch /prune_wrongarch
RUN /prune_wrongarch /app && rm /prune_wrongarch

FROM gcr.io/kctf-docker/challenge@sha256:9f15314c26bd681a043557c9f136e7823414e9e662c08dde54d14a6bfd0b619f

COPY --from=chroot / /chroot

COPY nsjail.cfg /home/user/
RUN echo 'nameserver 8.8.8.8' > /chroot/etc/resolv.conf

CMD kctf_setup && \
    kctf_drop_privs \
        nsjail --config /home/user/nsjail.cfg --cwd /app -- /usr/local/bin/npm start
