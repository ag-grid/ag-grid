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

[Context Menu Default Example](https://plnkr.co/edit/X6S0PRHImP6YIfaN?open=main.js&preview)

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

[Context Menu Extra Actions Example](https://plnkr.co/edit/cDJ3D6Z6N1sCgnBB?open=main.js&preview)

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
