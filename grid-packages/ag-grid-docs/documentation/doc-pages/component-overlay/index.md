---
title: "Overlay Component"
---

Overlay components allow you to add your own overlays to AG Grid. Use these when the provided overlays do not meet your requirements.

## Loading Rows Overlay Interface

Implement this interface to provide a custom overlay when loading rows.

```ts
interface ILoadingOverlayComp {
    // mandatory methods

    // The init(params) method is called on the overlay once. See below for details on the parameters.
    init(params: ILoadingOverlayParams): void;

    // Returns the DOM element for this overlay
    getGui(): HTMLElement;
}
```

```ts
interface ILoadingOverlayParams {
    // an optional template for the loading rows overlay
    loadingRowsTemplate?: string

    // The grid API
    api: any;
}
```

## No Rows Overlay Interface

Implement this interface to provide a custom overlay when no rows loaded.

```ts
interface INoRowsOverlayComp {
    // mandatory methods

    // The init(params) method is called on the overlay once. See below for details on the parameters.
    init(params: INoRowsOverlayParams): void;

    // Returns the DOM element for this overlay
    getGui(): HTMLElement;
}
```

```ts
interface INoRowsOverlayParams {
    // an optional template for the no rows overlay
    noRowsTemplate?: string

    // The grid API
    api: any;
}
```

## Registering Overlay Components

See the section [registering custom components](../components/#registering-custom-components) for details on registering and using custom overlays.

## Example: Custom Overlay Components

The example below demonstrates how to provide custom overlay components to the grid. Notice the following:

- **Custom Loading Overlay Renderer** is supplied by name via `gridOptions.loadingOverlayComponent`.
- **Custom Loading Overlay Renderer Parameters** are supplied using `gridOptions loadingOverlayComponentParams`.
- **Custom No Rows Overlay Renderer** is supplied by name via `gridOptions.noRowsOverlayComponent`.
- **Custom No Rows Overlay Renderer Parameters** are supplied using `gridOptions.noRowsOverlayComponentParams`.

<grid-example title='Custom Overlay Components' name='custom-overlay-components' type='generated' options='{ "extras": ["fontawesome"] }'></grid-example>

