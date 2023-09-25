FROM rust:1.72 as build

WORKDIR /usr/src/backend
COPY . .

RUN mkdir -p /images

RUN cargo install --path .

FROM gcr.io/distroless/cc-debian12

COPY --from=build /usr/local/cargo/bin/backend /usr/local/bin/backend

EXPOSE 5000

CMD ["backend"]
