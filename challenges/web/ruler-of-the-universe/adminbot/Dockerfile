FROM oven/bun:1

RUN apt-get update

COPY bun.lock package.json /
RUN cd / && bunx @puppeteer/browsers install chrome --install-deps
RUN bun install --frozen-lockfile

COPY ./ /

WORKDIR /
CMD [ "bun", "index.ts" ]
