---
title: "Client-Side Data"
---

Client-Side Data means all of the data you want to show is loaded inside the data grid in one go. The data is provided to the grid using the `rowData` attribute in a list.

<snippet>
const gridOptions = {
    // assumes each data item provided by the application has the key stored in an attribute called id
    rowData: getListOfRowData()
}
</snippet>

There are four Row Models in the grid, of which the Client-side Row Model is one. The Client-side Row Model is the one that uses the `rowData` attribute.

The remaining three Row Models are [Server-Side Row Models](/row-models/) that can be used where data is mostly kept on the server and loaded into the grid in parts.

This section of the documentation describes how to work with data when using the Client-side Row Model.
