---
title: "Row Overview"
---

Every row displayed in the grid is represented by a Row Nodes that exposes a combination of row state and if applicable the underlying data value.

## Row Node

Row Nodes contain a reference to the data item your application provided as well as other runtime information about the row. The Row Node contains attributes, methods and emits events. Additional attributes are used if the Row Node is a group. 

See [Row Node](/row-object/) for a complete list of attributes associated with rows and grouped rows.

## Row Methods

Each Row Node exposes a number of methods that can be used to query the state of a row as well as to update the data / state of a the row.

See [Row Methods](/row-methods) for a complete list of methods.

## Row Events

Row Nodes fire events as they are updated which makes it possible to trigger logic in your application. It is important to note that row events are synchronous and should be used as a last resort. 

See [Row Events](/row-events) for a complete list of row events and best practices on how to use them. 


