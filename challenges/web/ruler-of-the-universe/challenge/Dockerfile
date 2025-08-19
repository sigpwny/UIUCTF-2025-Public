FROM oven/bun:alpine

COPY src/bun.lock src/package.json /src/
RUN cd /src/ && bun install --frozen-lockfile

COPY ./src/ /src/

USER bun
WORKDIR /src/
CMD [ "bun", "index.tsx" ]
