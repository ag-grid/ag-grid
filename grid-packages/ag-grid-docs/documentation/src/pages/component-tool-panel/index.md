---
title: "Tool Panel Component"
enterprise: true
---

Custom Tool Panel Components can be included into the grid's Side Bar. Implement these when you require more Tool Panels to meet your application requirements.

In this section we show the interfaces required to implement a custom Tool Panel Component along with details on how to register it with the grid. An example of a custom Tool Panel Component is also provided.

## Tool Panel Interface

Implement this interface to provide a custom Tool Panel Components to the grid's Side Bar.

```ts
interface IToolPanel {
    // The init(params) method is called on the tool panel once upon component initialisation.
    init(params: IToolPanelParams): void;

    // Returns the DOM element for this Tool Panel
    getGui(): HTMLElement;

    // Can be left blank if no custom refresh logic is required.
    refresh(): void;
}
```

```ts
interface IToolPanelParams {
    // Grid API
    api: any;

    // Column API
    columnApi: any;
}
```

## Registering Tool Panel Components

Registering a Tool Panel component follows the same approach as any other custom components in the grid. For more details see: [Registering Custom Components](../components/#registering-custom-components).

Once the Tool Panel Component is registered with the grid it needs to be included into the Side Bar. The following snippet illustrates this:

```js
gridOptions: {
    sideBar: {
        toolPanels: [
            {
                id: 'customStats',
                labelDefault: 'Custom Stats',
                labelKey: 'customStats',
                iconKey: 'custom-stats',
                component: 'customStatsToolPanel',
            }
        ]
    },
    components: {
        customStatsToolPanel: CustomStatsComponent
    }

    // other grid properties
}
```

For more details on the configuration properties above, refer to the [Side Bar Configuration](../side-bar/#sidebardef-configuration) section.

## Example: 'Custom Stats' Tool Panel Component

The example below provides a 'Custom Stats' Tool Panel to demonstrates how to create and register a Custom Tool Panel Component with the grid and include it the Side Bar:

<grid-example title='Custom Stats' name='custom-stats' type='generated' options='{ "enterprise": true, "extras": ["fontawesome"] }'></grid-example>

