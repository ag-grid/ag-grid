---
title: "Row Grouping - Other"
enterprise: true
---

## Grouping Complex Objects with Keys

If your rowData has complex objects that you want to group by, then the default grouping will convert each object to `"[object object]"` which will be useless to you. Instead you need to get the grid to convert each object into a meaningful string to act as the key for the group. You could add a 'toString' method to the objects - but this may not be possible if you are working with JSON data. To get around this, use `colDef.keyCreator`, which gets passed a value and should return the string key for that value.

The example below shows grouping on the county, with country an object within each row.

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

<grid-example title='Grouping Complex Objects with Keys' name='grouping-complex-objects' type='generated' options='{ "enterprise": true, "exampleHeight": 515, "modules": ["clientside", "rowgrouping"] }'></grid-example>