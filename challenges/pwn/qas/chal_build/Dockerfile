# DOCKER_BUILDKIT=1 docker build . --target release --output type=local,dest=../challenge

FROM ubuntu:24.04 AS build

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && \
    apt-get install -y curl build-essential && \
    apt-get clean

RUN mkdir -p /handout
COPY . /handout
RUN make -C handout

RUN tar --mtime="@0" --sort=name -czf /handout.tar.gz handout

FROM scratch AS release

COPY --from=build /handout.tar.gz /
