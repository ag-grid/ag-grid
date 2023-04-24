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

## Next Up

Continue to the next section to learn about [Unbalanced Groups](../grouping-unbalanced-groups/).