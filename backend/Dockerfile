FROM rust:1.72-alpine

WORKDIR /usr/src/backend
COPY . .

RUN mkdir -p /images

RUN cargo install --path .

FROM alpine:latest

COPY --from=build /usr/local/cargo/bin/backend /usr/local/bin/backend

CMD ["backend"]
