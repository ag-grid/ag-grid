---
title: "Row Grouping - Complex Objects"
enterprise: true
---

This section covers how to group rows when the row data contains complex objects.

## Creating group keys from complex objects

When grouping by columns that contain complex objects in the supplied row data, the values will be converted to 
`"[object object]"` by default. This will not produce the desired grouping results. 

One way to get around this is to add a `toString()` method to the complex objects, however this may not be possible if
you are working with JSON data.

A more flexible solution is to use the `colDef.keyCreator(params)` callback function to return a meaningful key for the 
supplied object, as shown in the following code snippets:

<api-documentation source='column-properties/properties.json' section='columns' names='["keyCreator"]'></api-documentation>

```js
// row item has complex object for country
rowItem = {
    athlete: 'Michael Phelps',
    country: {
      name: 'United States',
      code: 'US'
    },
    ...
}
```

<snippet>
const gridOptions = {
    columnDefs: [
      // the column definition for country uses a keyCreator
      {
          field: "country",
          keyCreator: params => params.value.name
      }
    ]
}
</snippet>

Note in the snippet above that the `colDef.keyCreator(params)` returns the country name to be used as the group key from 
`country` complex object supplied in the row data.

The example below shows grouping on the `country` column that contains complex object values:

<grid-example title='Grouping Complex Objects with Keys' name='grouping-complex-objects' type='generated' options='{ "enterprise": true, "exampleHeight": 515, "modules": ["clientside", "rowgrouping"] }'></grid-example>

<note>
If using [Cell Data Types](../cell-data-types/), the key creator is automatically set to use the value formatter so it does not need to be specified directly.
</note>

## Original Row Data

By default, when row grouping the cell value is selected from the first row in the group at the time of creation. This means the row value may not always be consistently typed depending on your data which can add complexity to your value formatter code. To instead change the behaviour to always use the string key as the value, enable `gridOptions.suppressGroupMaintainValueType`.

In the example below, note the following.
- The 'country' column `valueGetter` returns complex objects.
- The 'country' column `keyCreator` ensures correct complex object grouping on the country code.
- The 'country' column `valueFormatter` executes on the values displayed on the grouping column, displaying both the country name and code.

<grid-example title='Maintain Value Type' name='maintain-value-type' type='generated' options='{ "enterprise": true, "exampleHeight": 515, "modules": ["clientside", "rowgrouping"] }'></grid-example>

## Next Up

Continue to the next section to learn about [Unbalanced Groups](../grouping-unbalanced-groups/).