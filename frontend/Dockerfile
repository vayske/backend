FROM rust:1.72

WORKDIR /usr/src/backend
COPY . .

RUN mkdir -p /images

RUN cargo install --path .

CMD ["backend"]
