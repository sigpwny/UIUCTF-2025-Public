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
COPY run.tar.zst /home/user/
RUN tar -C /home/user/ -xf /home/user/run.tar.zst

FROM gcr.io/kctf-docker/healthcheck@sha256:66b34a47e7bbb832012905e229da0bbed80c5c3cddd4703127ca4026ba528cfc AS solution-build

COPY --from=tar-extract /home/user/run /home/user/run
COPY Makefile solution.c build.py /home/user/

RUN /home/user/build.py

FROM gcr.io/kctf-docker/healthcheck@sha256:66b34a47e7bbb832012905e229da0bbed80c5c3cddd4703127ca4026ba528cfc

COPY healthcheck_loop.sh healthcheck.py healthz_webserver.py /home/user/
COPY --from=solution-build /home/user/solution /home/user/

CMD kctf_drop_privs /home/user/healthcheck_loop.sh & /home/user/healthz_webserver.py
