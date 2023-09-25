FROM rust:1.72 as build

ENV PKG_CONFIG_ALLOW_CROSS=1

WORKDIR /usr/src/backend
COPY . .

RUN mkdir -p /images

RUN cargo install --path .

FROM gcr.io/distroless/cc-debian10

COPY --from=build /usr/local/cargo/bin/backend /usr/local/bin/backend

CMD ["backend"]
