---
title: "SSRM Tree Data"
enterprise: true
---

This section shows how Tree Data can be used with the Server-Side Row Model.

## Tree Data

Tree Data is defined as data that has parent / child relationships where the parent / child relationships are
provided as part of the data. This is in contrast to Row Grouping where the parent / child relationships are
the result of grouping. When working with Tree Data, there are no columns getting grouped.

An example of a Tree Data JSON structure is shown below:

```json
[{
    "employeeId": 101,
    "employeeName": "Erica Rogers",
    "jobTitle": "CEO",
    "employmentType": "Permanent",
    "children": [{
        "employeeId": 102,
        "employeeName": "Malcolm Barrett",
        "jobTitle": "Exec. Vice President",
        "employmentType": "Permanent",
        "children": [
            {
                "employeeId": 103,
                "employeeName": "Leah Flowers",
                "jobTitle": "Parts Technician",
                "employmentType": "Contract"
            },
            {
                "employeeId": 104,
                "employeeName": "Tammy Sutton",
                "jobTitle": "Service Technician",
                "employmentType": "Contract"
            }
        ]
    }]
}]
```

It is expected that the data set will be too large to send over the network, hence the SSRM is used to
lazy-load child row as the parent rows are expanded.

## Tree Data Mode

In order to set the grid to work with Tree Data, simply enable Tree Data mode via the Grid Options
using: `gridOptions.treeData = true`.

## Supplying Tree Data

Tree Data is supplied via the [Server-Side Datasource](/server-side-model-datasource/) just like flat data,
however there are two additional gridOptions callbacks: `isServerSideGroup(dataItem)`
and `getServerSideGroupKey(dataItem)`.

<api-documentation source='grid-options/properties.json' section='serverSideRowModel' names='["isServerSideGroup", "getServerSideGroupKey"]' ></api-documentation>

The following code snippet shows the relevant `gridOptions` entries for configuring tree data with the
server-side row model:

<snippet spaceBetweenProperties="true">
|const gridOptions = {
|    // choose Server-Side Row Model
|    rowModelType: 'serverSide',
|    // enable Tree Data
|    treeData: true,
|    // indicate if row is a group node
|    isServerSideGroup: dataItem => {
|        return dataItem.group;
|    },
|    // specify which group key to use
|    getServerSideGroupKey: dataItem => {
|        return dataItem.employeeId;
|    },
|}
</snippet>

[[note]]
| Be careful not to get mixed up with the [Client-Side Tree Data](/tree-data/) configurations by mistake.

The example below shows this in action where the following can be noted:

- Tree Data is enabled with the Server-Side Row Model using `gridOptions.treeData = true`.
- Group nodes are determined using the callback `gridOptions.isServerSideGroup(dataItem)`.
- Group keys are returned from the callback `gridOptions.getServerSideGroupKey(dataItem)`.

<grid-example title='Tree Data' name='tree-data' type='generated' options='{ "enterprise": true, "exampleHeight": 590, "modules": ["serverside", "rowgrouping", "menu", "columnpanel"] }'></grid-example>

## Refreshing Tree Data

Tree Data can be refreshed in the same way as groups are refreshed when not using Tree Data. This is
explained in the [SSRM Refresh](/server-side-model-refresh/).

The example below shows this in action where the following can be noted:

- Click **Refresh Everything** to clear all caches by calling `gridOptions.api.refreshServerSide({ route: [], purge: true })`.
- Click **Refresh ['Kathryn Powers','Mabel Ward']** to clear a single cache by calling `gridOptions.api.refreshServerSide({ route: ['Kathryn Powers','Mabel Ward'], purge: true })`.

<grid-example title='Purging Tree Data' name='purging-tree-data' type='generated' options='{ "enterprise": true, "exampleHeight": 615, "modules": ["serverside", "rowgrouping", "menu", "columnpanel"] }'></grid-example>

## Filtering Tree Data

Server-Side Tree Data Filtering should behave the same as Client-Side [Tree Data Filtering](/tree-data/#tree-data-filtering). A group will be included if:

<ol style="list-style-type: lower-latin;">
    <li>it has any children that pass the filter, or</li>
    <li>it has a parent that passes the filter, or</li>
    <li>its own data passes the filter</li>
</ol>

The following example demonstrates Server-Side Tree Data Filtering using the [Set Filter Tree List](/filter-set-tree-list/), which replicates the Tree Data structure in the filter.

- The **Group** column has the Set Filter Tree List enabled via `filterParams.treeList = true`. A Key Creator is specified to convert the path into a string.
- The **Group** column has the filter values supplied asynchronously as a nested array of strings that matches the data paths.
- The **Date** column has the Set Filter Tree List enabled via `filterParams.treeList = true`, and is grouped by year -> month -> day.
- The **Date** column has the filter values supplied asynchronously as an array of `Date` objects.
- The **Date** column has a `filterParams.keyCreator` provided to convert the `Date` values into the (string) format the server is expecting in the Filter Model.

<grid-example title='Filtering Tree Data' name='filtering-tree-data' type='generated' options='{ "enterprise": true, "exampleHeight": 590, "extras": ["alasql"], "modules": ["serverside", "rowgrouping", "menu", "columnpanel", "setfilter"] }'></grid-example>
