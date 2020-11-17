---
title: "SSRM Tree Data"
enterprise: true
---

This section shows how Tree Data can be used with the Server-Side Row Model.

## Tree Data

Tree Data is defined as data that has parent / child relationships where the parent / child relationships are provided as part of the data.

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

However it is expected that the data will be too large to send over the network, so it will be lazy-loaded as more children are requested when group nodes are expanded.

## Tree Data Mode

In order to set the grid to work with Tree Data, simply enable Tree Data mode via the Grid Options using: `gridOptions.treeData = true`.

## Supplying Tree Data

Tree Data is supplied via the [Server-Side Datasource](../server-side-model-datasource/) just like flat data, however there are two additional gridOptions callbacks: `isServerSideGroup(dataItem)` and `getServerSideGroupKey(dataItem)`.

The following code snippet shows the relevant `gridOptions` entries for configuring tree data with the server-side row model:


```js
var gridOptions = {
    // choose Server-Side Row Model
    rowModelType: 'serverSide',

    // enable Tree Data
    treeData: true,

    // indicate if row is a group node
    isServerSideGroup: function(dataItem) {
        return dataItem.group;
    },

    // specify which group key to use
    getServerSideGroupKey: function(dataItem) {
        return dataItem.employeeId;
    }
    ...
}
```

[[note]]
| Be careful not to get mixed up with the [Client-Side Tree Data](../tree-data/) configurations by mistake.

The example below shows this in action where the following can be noted:

- Tree Data is enabled with the Server-Side Row Model using `gridOptions.treeData = true`.
- Group nodes are determined using the callback `gridOptions.isServerSideGroup()`.
- Group keys are returned from the callback `gridOptions.getServerSideGroupKey()`.

<grid-example title='Tree Data' name='tree-data' type='generated' options='{ "enterprise": true, "exampleHeight": 590, "extras": ["lodash"], "modules": ["serverside", "rowgrouping", "menu", "columnpanel"] }'></grid-example>

[[note]]
| The examples on this page use a simple method for expanding group nodes, however a 
| better approach is covered in the section [Preserving Group State](../server-side-model-grouping/#preserving-group-state).

## Purging Tree Data

Tree Data can be automatically purged by setting the [Cache Configuration](../infinite-scrolling/#more-control-via-properties-and-api) appropriately. However sometimes it may be necessary to perform a manual purge.


This is achieved using the same approach covered in the previous [Purging Groups](../server-side-model-grouping/#purging-groups) section.


The example below shows this in action where the following can be noted:

- Click **Purge Everything** to clear all caches by calling `gridOptions.api.purgeServerSideCache([])`.
- Click **Purge ['Kathryn Powers','Mabel Ward']** to clear a single cache by calling `gridOptions.api.purgeServerSideCache(['Kathryn Powers','Mabel Ward'])`.

<grid-example title='Purging Tree Data' name='purging-tree-data' type='generated' options='{ "enterprise": true, "exampleHeight": 615, "extras": ["lodash"], "modules": ["serverside", "rowgrouping", "menu", "columnpanel"] }'></grid-example>

## Sorting

Sorting works in the same way when using Tree Data as when not using Tree Data with one exception. If using the Partial Store, a change in sort will refresh (reload) the data. If using the Full Store, a change in sort will result in the grid sorting the data without requiring a reload.

## Filtering

Changing the filter applied to a column will always refresh (reload) the data. This is true for both the Partial Store and Full Store.

