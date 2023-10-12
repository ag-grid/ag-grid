---
title: "Row Node"
---

A Row Node represents one row of data. 

The Row Node will contain a reference to the data item your application provided as well as other runtime information about the row. The Row Node contains attributes, methods and emits events. Additional attributes are used if the Row Node is a group.

If using Typescript, Row Nodes' support a generic data type via `IRowNode<TData>`. If not set `TData` defaults to `any`. See [Typescript Generics](/typescript-generics) for more details.

<api-documentation source='resources/reference.json'></api-documentation>
