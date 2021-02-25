---
title: "Loading Cell Renderer"
---

Loading cell renderers allow you to add your own loading renderers to AG Grid. Use these when the provided loading renderers do not meet your requirements.

## Loading Cell Renderer Interface

Implement this interface to provide a custom loading cell renderer when loading rows.

```ts
interface ILoadingCellRenderer {
    // mandatory methods

    // The init(params) method is called on the loading cell renderer once. See below for details on the parameters.
    init(params: ILoadingCellRendererParams): void;

    // Returns the DOM element for this loading cell renderer
    getGui(): HTMLElement;
}
```

```ts
interface ILoadingCellRendererParams {
    // an optional template for the loading cell renderer
    loadingMessage?: string

    // The grid API
    api: any;
}
```

## Registering Loading Cell Renderer Components

See the section [registering custom components](../components/#registering-custom-components) for details on registering and using custom loading cell renderers.

## Example: Custom Loading Cell Renderer

The example below demonstrates how to provide custom loading cell renderer component to the grid. Notice the following:

- **Custom Loading Cell Renderer** is supplied by name via `gridOptions.loadingCellRenderer`.
- **Custom Loading Cell Renderer Parameters** are supplied using `gridOptions.loadingCellRendererParams`.

<grid-example title='Custom Loading Cell Renderer' name='custom-loading-cell-renderer' type='generated' options='{ "enterprise": true, "extras": ["fontawesome"] }'></grid-example>

