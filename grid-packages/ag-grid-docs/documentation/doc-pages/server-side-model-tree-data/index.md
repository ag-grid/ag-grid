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

The example below shows this in action where the following can be noted: 333

- Tree Data is enabled with the Server-Side Row Model using `gridOptions.treeData = true`.
- Group nodes are determined using the callback `gridOptions.isServerSideGroup(dataItem)`.
- Group keys are returned from the callback `gridOptions.getServerSideGroupKey(dataItem)`.

<grid-example title='Tree Data' name='tree-data' type='generated' options='{ "enterprise": true, "exampleHeight": 590, "modules": ["serverside", "rowgrouping", "menu", "columnpanel"] }'></grid-example>

[[note]]
| The examples on this page use a simple method for expanding group nodes, however a
| better approach is covered in the section [Preserving Group State](/server-side-model-grouping/#preserving-group-state).

## Refreshing Tree Data

Tree Data can be refreshed in the same way as groups are refreshed when not using Tree Data. This is
explained in the [SSRM Refresh](/server-side-model-refresh/).

The example below shows this in action where the following can be noted:

- Click **Purge Everything** to clear all caches by calling `gridOptions.api.refreshServerSide({ route: [], purge: true })`.
- Click **Purge ['Kathryn Powers','Mabel Ward']** to clear a single cache by calling `gridOptions.api.refreshServerSide({ route: ['Kathryn Powers','Mabel Ward'], purge: true })`.

<grid-example title='Purging Tree Data' name='purging-tree-data' type='generated' options='{ "enterprise": true, "exampleHeight": 615, "modules": ["serverside", "rowgrouping", "menu", "columnpanel"] }'></grid-example>

## Sorting and Filtering

Sorting and Filtering work the same while using Tree Data as it does without with a few exceptions.

- Sorting with Infinite Scroll will always behave as if [serverSideSortAllLevels](/grid-options/#reference-serverSideRowModel-serverSideSortAllLevels) is enabled.
- Filtering with Infinite Scroll will always behave as if [serverSideFilterAllLevels](/grid-options/#reference-serverSideRowModel-serverSideFilterAllLevels) is enabled.
- It is not possible to enable [serverSideSortOnServer](/grid-options/#reference-serverSideRowModel-serverSideSortOnServer) or [serverSideFilterOnServer](/grid-options/#reference-serverSideRowModel-serverSideFilterOnServer) while using Tree Data without Infinite Scrolling enabled.
