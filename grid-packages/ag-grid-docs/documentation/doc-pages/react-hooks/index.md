---
title: "React Hooks"
frameworks: ["react"]
---

AG Grid fits perfectly into the React rendering ecosystem. This page explains best practices for using React Hooks with AG Grid.

## Functional Components

When customising AG Grid, you can use both React Functional Components or React Class Components.

>> Code - simple Classes with React


## Use State, Use Memo

All examples in the documentation use best practices with regards `useState` and `useMemo`, e.g. `rowData` and `columnDefs` are always set using `useState`. However all code snippets in the documentation leave these hooks out for simpler reading of the documentation.

## Use Callback

>> Beware, stale references

