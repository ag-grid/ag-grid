---
title: "Row Grouping - Other"
enterprise: true
---

## Expanding Rows via API

To expand or contract a group via the API, you first must get a reference to the rowNode and then call `rowNode.setExpanded(boolean)`. This will result in the grid getting updated and displaying the correct rows. For example, to expand a group with the name 'Zimbabwe' would be done as follows:

<snippet>
gridOptions.api.forEachNode(node => {
    if (node.key === 'Zimbabwe') {
        node.setExpanded(true);
    }
});
</snippet>

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
