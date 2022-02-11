# VSCode DevContainer for the ag-grid monorepo.

## Intent

Provides an out-of-the-box build environment for the ag-grid monorepo, including all tooling
dependencies, which is similar to the CI environment we use to allow local debugging of CI/build
issues.

## Setup

- Install [Docker Desktop](https://www.docker.com/products/docker-desktop).
- Install [VSCode](https://code.visualstudio.com/).
  - Install the [Remote-Containers extension](vscode:extension/ms-vscode-remote.remote-containers).
- (Optional) Setup [GitHub SSH authentication](https://docs.github.com/en/authentication/connecting-to-github-with-ssh).
- Launch the container:
  - Open VSCode.
  - Open the command-palette (`CMD`+`SHIFT`+`P`).
  - Choose `Remote-Containers: Clone Repository in Container Volume...`.
  - Choose `Clone a repository from GitHub in a Container Volume`.
  - Enter `ag-grid/ag-grid`.
  - Choose `latest` branch.
- Open a terminal in VSCode (`CTRL+SHIFT+~`).
- Follow the normal [`ag-grid` bootstraping instructions](https://ag-grid.atlassian.net/wiki/spaces/AG/pages/303628290/Lerna+Mono+Repo).
