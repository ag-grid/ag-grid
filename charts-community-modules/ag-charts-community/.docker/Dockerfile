# See here for image contents: https://github.com/microsoft/vscode-dev-containers/tree/v0.217.1/containers/ubuntu/.devcontainer/base.Dockerfile

# [Choice] Ubuntu version (use hirsuite or bionic on local arm64/Apple Silicon): hirsute, focal, bionic
ARG VARIANT="jammy"
FROM mcr.microsoft.com/vscode/devcontainers/base:0-${VARIANT}

# [Optional] Uncomment this section to install additional OS packages.
RUN apt-get update && \
    export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
        pkg-config build-essential \
        # node-canvas dependencies. \
        libpixman-1-dev libcairo2-dev libpango1.0-dev libjpeg8-dev libgif-dev

RUN mkdir -p /workspace/ag-charts-community
WORKDIR /workspace/ag-charts-community
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash && \
    chmod +x /root/.bashrc && \
    export NVM_DIR="$HOME/.nvm" && \
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  && \
    nvm i 16
COPY launch.sh /root/launch.sh

ENTRYPOINT ["/root/launch.sh"]
CMD ["bash", "-il"]
