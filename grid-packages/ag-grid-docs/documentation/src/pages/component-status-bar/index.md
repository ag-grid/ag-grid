---
title: "Status Bar Panels (Components)"
enterprise: true
---

Status Bar Panels allow you to add your own components to the grid's Status Bar. Use this when the provided status bar components do not meet your requirements.

## Status Bar Panel Interface

```ts
interface IStatusPanel {
    /** The init(params) method is called on the status bar component once.
        See below for details on the parameters. */
    init?(params: T): void;

    /** A hook to perform any necessary operation just after the gui for this component has been
        renderered in the screen. */
    afterGuiAttached?(params?: IAfterGuiAttachedParams): void;

    /** Gets called when the grid is destroyed - if your status bar components needs to do any
        cleanup, do it here */
    destroy?(): void;
}
```

## Status Panel Parameters

The method init(params) takes a params object with the items listed below. If the user provides params via the `componentParams` attribute ([see](#configure-components) Configuring Status Bar Components below), these will be additionally added to the params object, overriding items of the same name if a name clash exists.

```ts
interface IStatusPanelParams {
    // The grid API
    api: GridApi,

    // The colum API
    columnApi: ColumnApi,

    // The context for this grid. See section on Context
    context: any;
}
```

## Configuring Status Bar Panels

In order to add new components to the Status Bar (or to configure the provided `agAggregationComponent` component) you need to provide the components and any associated information to `statusBar`:


```js
var gridOptions = {
    statusBar: {
        statusPanels: [
            {
                statusPanel: 'statusBarComponent'
            },
            {
                statusPanel: 'agAggregationComponent',
                statusPanelParams : {
                    // only show count and sum ('min', 'max', 'avg' won't be shown)
                    aggFuncs: ['count', 'sum']
                }
            }
        ]
    },
    ...other properties
}
```

In the configuration above we've specified a custom component (`statusBarComponent`) as well as the provided `agAggregationComponent` component.

Order is important here - the order of the components provided will determine the order in which they're rendered, from left to right.

<grid-example title='Status Bar Panel' name='custom-component' type='generated' options='{ "enterprise": true }'></grid-example>

## Initialisation of Status Bar Components

Please refer to the documentation [here.](../status-bar/#initialisation-of-status-bar-components)

## Accessing Status Bar Panel Instances

After the grid has created an instance of a status bar component it is possible to access that instance. This is useful if you want to call a method that you provide on the status bar component that has nothing to do with the operation of the grid. Accessing a status bar component is done using the grid API `getStatusPanel(key)`.

If your are using a framework component then the returned object is a wrapper and you can get the underlying status bar component using `getFrameworkComponentInstance()`

```js
// example - get status bar component
let statusBarComponent = gridOptions.api.getStatusPanel('statusBarCompKey');
if (statusBarComponent) {
    componentInstance = statusBarComponent.getFrameworkComponentInstance();
}
```

The example below shows using `getStatusPanel`:

<grid-example title='Get Status Bar Panel Instance' name='component-instance' type='generated' options='{ "enterprise": true }'></grid-example>
