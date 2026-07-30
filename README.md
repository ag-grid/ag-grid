# AG-Grid v23 — LUY Fork

This repository is a fork of the official [AG-Grid repository](https://github.com/ag-grid/ag-grid).

## Why this fork exists

The legacy frontend in LUY depends on AG-Grid **v23**, a release that is no longer maintained upstream. Upgrading to a newer version is not viable because:

- the migration effort is high, and
- features we rely on (e.g. tree view) have moved to the paid version of AG-Grid in newer releases.

This fork lets us keep v23 alive on our own terms.

## Purpose

- **Patching v23** — apply fixes to AG-Grid v23 when needed. The most likely case is **security patches**.
- **Reducing supply chain risk** — we keep a self-hosted copy of the source code. If upstream removes the old library version or takes down the git repository, LUY is not affected.

We are only interested in using this repository to deliver patches for **v23**. There is no intent to track upstream development or newer releases.

## Published packages

The repository hosts NPM artifacts via **GitHub Packages**. Two packages are published:

- `ag-grid-angular`
- `ag-grid-community`

## Consumers

The **legacy frontend in LUY** is the only consumer of these packages.
