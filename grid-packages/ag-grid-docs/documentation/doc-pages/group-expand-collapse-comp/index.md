---
title: "Group Expand & Collapse Component"
enterprise: true
---

When grouping is enabled in the grid, the grid will use a Group Cell Component in
the first column to **************** todo - intro to Group Cell Component configuration.

- `defaultColGroupDef`: contains properties that all column groups will inherit.

<snippet spaceBetweenProperties="true">
const gridOptions = {
    // a default column group definition with properties that get applied to every column group 
    autoGroupColumnDef=MyCustomComp
}
</snippet>


## Conditionally Show Group Component

It is possible to conditionally show the Group Component. This is useful in cases where the Expand / Collapse
chevron should not be displayed for certain rows.

This can be achieved via the `cellRendererSelector` callback function as shown in below:

<snippet>
const gridOptions = { 
    autoGroupColumnDef: {
        cellRendererSelector: (params) => {
          if (['Australia', 'Norway'].includes(params.node.key)) {
            return; // use Default Cell Renderer
          }
          return { component: 'agGroupCellRenderer' };      
        },
    },
};
</snippet>

In the snippet above group cells that contain 'Australia' or 'Norway' group keys will use the Default Cell Renderer instead
of the Group Cell Renderer. Note that a [Custom Component Cell Renderer](/component-cell-renderer/) could also be returned.

This is demonstrated in the example below. Note the following:

- The `autoGroupColumnDef` contains a `cellRendererSelector` to conditionally select the Cell Renderer.
- The **Australia** and **Norway** group cells are using the Default Cell Renderer.

<grid-example title='Conditionally Show Group Cell Renderer' name='custom-expand-collapse-cell' type='mixed' options='{"enterprise": true, "modules": ["clientside", "rowgrouping"]}'></grid-example>

