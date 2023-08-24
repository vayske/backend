FROM ubuntu:22.04

ARG DEBIAN_FRONTEND=noninteractive
ARG PYTHON_VERSION
ARG USERNAME

ENV LANG=C.UTF-8
ENV TERM=xterm-256color

RUN apt-get update && apt-get install -y \
    software-properties-common \
    sudo \
    git \
    tmux \
    curl \
    vim

RUN add-apt-repository ppa:deadsnakes/ppa

RUN apt-get update && apt-get install -y \
    build-essential \
    python${PYTHON_VERSION} \
    python${PYTHON_VERSION}-dev \
    python${PYTHON_VERSION}-distutils

RUN apt-get clean \
    && rm -rf /var/lib/apt/lists/*

RUN update-alternatives --install /usr/bin/python3 python /usr/bin/python3.11 1

RUN curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py

RUN python3 get-pip.py \
    && rm get-pip.py

COPY requirements.txt requirements.txt

RUN pip install -r requirements.txt

EXPOSE 5000

RUN useradd -ms /bin/bash ${USERNAME} \
    && usermod -aG sudo ${USERNAME}

RUN sed -i 's/#force_color_prompt=yes/force_color_prompt=yes/g' /root/.bashrc
RUN sed -i 's/#force_color_prompt=yes/force_color_prompt=yes/g' /home/${USERNAME}/.bashrc

RUN echo 'root:password' | chpasswd
RUN echo "${USERNAME}:password" | chpasswd

USER ${USERNAME}
