---
title: "Row Grouping - Other"
enterprise: true
---

## Unbalanced Groups

If there are rows containing `null` or `undefined` values for the column that is being grouped then these rows will not be grouped. We refer to this scenario as **Unbalanced Groups** in that there is a mix of groups and rows as siblings. The following example demonstrates:

- Data is grouped by column 'State'. Rows are either grouped by state 'New York', 'California' or not grouped.
- Removing the grouping shows that the non grouped rows have no 'State' value.

<grid-example title='Unbalanced Groups' name='unbalanced-groups' type='generated' options='{ "enterprise": true, "exampleHeight": 570, "modules": ["clientside", "rowgrouping"] }'></grid-example>

If you do not want rows with null or undefined to be left out of groups, but wanta group created to contain these empty values, then change your data and replace the null and undefined values with something (eg the string 'Empty' or a string with a blank space character i.e. ' ').


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