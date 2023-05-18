---
title: "Context Menu"
enterprise: true
---

The context menu can be used to take less common and context-aware actions with the chart and nodes.

To enable these features, set `contextMenu.enabled` to `true`.

```ts
contextMenu: {
    enabled: true,
}
```

A user will now be able to use the context menu by right clicking anywhere on the chart, as in the following example.

<chart-example title='Context Menu' name='context-menu' type='generated'></chart-example>

## Custom Actions

You can add extra actions to the context menu which can run any arbitrary function.

In the example below, there is one extra action called "Say hello" that will output the value at the datum if one was clicked, otherwise falling back to a default.

```ts
contextMenu: {
  extraActions: [
    {
      label: "Say hello",
      action: ({ datum, event }: AgContextMenuActionParams) => {
        console.log(`Hello ${datum?.value ?? "world"}`)
      },
    },
  ]
}
```

<chart-example title='Context Menu Custom Actions' name='context-menu-actions' type='generated'></chart-example>

## API Reference

<!-- TODO: replace with usual api reference component -->

```ts
interface AgContextMenuOptions {
  enabled?: boolean
  extraActions?: Array<AgContextMenuAction>
}

type AgContextMenuAction = {
  label: string
  action: (params: AgContextMenuActionParams) => void
}

type AgContextMenuActionParams = {
  datum?: any
  event: MouseEvent
}
```

<!-- <interface-documentation interfaceName='AgContextMenuOptions' config='{ "showSnippets": false, "lookupRoot": "charts-api" }'></interface-documentation> -->
