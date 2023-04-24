---
title: "Column Properties"
---

Properties are available for columns `ColDef` and column groups `ColGroupDef`. For [column groups](#reference-columnGroups), the property `children` is mandatory. When the grid sees `children` it knows it's a column group.

Typescript supports a generic row data type via `ColDef<TData>` and `ColDefGroup<TData>`. If not set `TData` defaults to `any`.  See [Typescript Generics](/typescript-generics) for more details.

<api-documentation source='properties.json'></api-documentation>
