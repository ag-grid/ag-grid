---
title: "Row Grouping - Other"
enterprise: true
---

## Unbalanced Groups

<video-link src="https://www.youtube.com/watch?v=gzqjP_kF4NI&t=691s" time="11:31"></video-link>

If there are rows containing `null` or `undefined` values for the column that is being grouped then these rows will not be grouped. We refer to this scenario as **Unbalanced Groups** in that there is a mix of groups and rows as siblings. The following example demonstrates:

- Data is grouped by column 'State'. Rows are either grouped by state 'New York', 'California' or not grouped.
- Removing the grouping shows that the non grouped rows have no 'State' value.

<grid-example title='Unbalanced Groups' name='unbalanced-groups' type='generated' options='{ "enterprise": true, "exampleHeight": 570, "modules": ["clientside", "rowgrouping"] }'></grid-example>

If you do not want rows with null or undefined to be left out of groups, but wanta group created to contain these empty values, then change your data and replace the null and undefined values with something (eg the string 'Empty' or a string with a blank space character i.e. ' ').

## Keeping Columns Visible

<video-link src="https://www.youtube.com/watch?v=gzqjP_kF4NI&t=417s" time="06:57"></video-link>

By default dragging a column out of the grid will make it hidden and un-grouping a column will make it visible again. This default behaviour can be changed with the following properties:

- `suppressDragLeaveHidesColumns`: When dragging a column out of the grid, eg when dragging a column from the grid to the group drop zone, the column will remain visible.
- `suppressMakeColumnVisibleAfterUnGroup`: When un-grouping, eg when clicking the 'x' on a column in the drop zone, the column will not be made visible.

The default behaviour is more natural for most scenarios as it stops data appearing twice. E.g. if country is displayed in group column, there is no need to display country again in the country column.

The example below demonstrates these two properties. Note the following:

- Columns country and year can be grouped by dragging the column to the group drop zone.
- Grouped columns can be un-grouped by clicking the 'x' on the column in the drop zone.
- The column visibility is not changed while the columns are grouped and un-grouped.
- While dragging the column header over the drop zone, before it is dropped, the column appears translucent to indicate that the grouping has not yet been applied.

<grid-example title='Keep Columns Visible' name='keep-columns-visible' type='generated' options='{ "enterprise": true, "exampleHeight": 515, "modules": ["clientside", "rowgrouping"] }'></grid-example>


## Expanding Rows via API

<video-link src="https://www.youtube.com/watch?v=gzqjP_kF4NI&t=750s" time="12:30"></video-link>

To expand or contract a group via the API, you first must get a reference to the rowNode and then call `rowNode.setExpanded(boolean)`. This will result in the grid getting updated and displaying the correct rows. For example, to expand a group with the name 'Zimbabwe' would be done as follows:

<snippet>
gridOptions.api.forEachNode(node => {
    if (node.key === 'Zimbabwe') {
        node.setExpanded(true);
    }
});
</snippet>

## Grouping Complex Objects with Keys

<video-link src="https://www.youtube.com/watch?v=gzqjP_kF4NI&t=817s" time="13:37"></video-link>

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

## Open Groups by Default

To have groups open by default, implement the grid callback `isGroupOpenByDefault`. This callback is invoked
each time a group is created.

<snippet>
const gridOptions = {
    // expand when year is '2004' or when country is 'United States'
    isGroupOpenByDefault: params => {
        return (params.field == 'year' && params.key == '2004') ||
            (params.field == 'country' && params.key == 'United States');
    }
}
</snippet>

The params passed to the callback are as follows:

```js
interface IsGroupOpenByDefaultParams {
  rowNode: RowNode; // the Row Node being considered
  rowGroupColumn: Column; // the Column for which this row is grouping
  level: number; // same as rowNode.level - what level the group is at, e.g. 0 for top level, 1 for second etc
  field: string; // same as rowNode.field - the field we are grouping on, e.g. 'country'
  key: any; // same as rowNode.key, the value of this group, e.g. 'Ireland'
}
```

In the example below, the country 'United States' and year '2004' are expanded by default. Note that year '2004' is expanded for all
countries, not just 'United States'.

<grid-example title='Open by Default' name='open-by-default' type='generated' options='{ "enterprise": true, "exampleHeight": 515, "modules": ["clientside", "rowgrouping"] }'></grid-example>
