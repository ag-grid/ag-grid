---
title: "Filters Tool Panel"
enterprise: true
---

The **Filters Tool Panel** allows accessing the grid's filters without needing to open up the column menu.

The example below shows the Filters Tool Panel. The following can be noted:

- Columns Athlete, Age, Country, Year and Date appear in the Filters Tool Panel as they have filters.
- Columns Gold, Silver, Bronze and Total do not appear in the Filters Tool Panel as they have no filters.
- Clicking on a column in the Filters Tool Panel will show the filter below the column name. Clicking a second time will hide the filter again.
- Columns with filters active will have the filter icon appear beside the filter name in the tool panel.

<grid-example title='Filters Tool Panel' name='simple' type='mixed' options='{ "enterprise": true, "modules": ["clientside", "menu", "setfilter", "filterpanel"]}'></grid-example> 

## Suppress Options

It is possible to remove items from the Filters Tool Panel. Items are suppressed by setting one or more of the following `toolPanelParams` to `true` when you are using the `agFiltersToolPanel` component:

<interface-documentation interfaceName='ToolPanelFiltersCompParams' exclude='["api", "columnApi"]' config='{"overrideBottomMargin":"1rem"}' ></interface-documentation>

To remove a particular column / filter from the tool panel, set the column property `suppressFiltersToolPanel` to `true`.

<api-documentation source='column-properties/properties.json' section='filtering' names='["suppressFiltersToolPanel"]'></api-documentation>

The example below demonstrates the suppress options described above. Note the following:

- **Expand / Collapse All** and **Filter Search** are hidden as `suppressExpandAll` and `suppressFilterSearch` are both set to `true`.
- The date column / filter is hidden from the tool panel using: `colDef.suppressFiltersToolPanel=true`.

<grid-example title='Suppress Options' name='suppress-options' type='generated' options='{ "enterprise": true, "modules": ["clientside", "menu", "setfilter", "filterpanel"], "exampleHeight": 610 }'></grid-example>

## Filter Instances

The filters provided in the tool panel are the same instances as the filter in the column menu. This has the following implications:

- Configuration relating to filters equally applies when the filters appear in the tool panel.
- The filter behaves exactly as when it appears in the column menu. E.g. the Apply button will have the same meaning when used in the tool panel. Also the relationship with the Floating Filter (if active) will be the same.
- If the filter is open on the tool panel and then the user subsequently opens the column menu, the tool panel filter will be closed. Because the filter is the same filter instance, it will only appear at one location at any given time.

## Expand / Collapse Filter Groups

It is possible to expand and collapse filter groups in the Filters Tool Panel by invoking methods on the Filters Tool Panel Instance. These methods are shown below:

```ts
interface IFiltersToolPanel {
    expandFilterGroups(groupIds?: string[]): void;
    collapseFilterGroups(groupIds?: string[]): void;
    ... // other methods
}
```

The code snippet below shows how to expand and collapse filter groups using the Filters Tool Panel instance:

<snippet>
| // lookup Filters Tool Panel instance by id, in this case using the default filter instance id
| const filtersToolPanel = gridOptions.api.getToolPanelInstance('filters');
| 
| // expands all filter groups in the Filters Tool Panel
| filtersToolPanel.expandFilterGroups();
| 
| // collapses all filter groups in the Filters Tool Panel
| filtersToolPanel.collapseFilterGroups();
| 
| // expands the 'athlete' and 'competition' filter groups in the Filters Tool Panel
| filtersToolPanel.expandFilterGroups(['athleteGroupId', 'competitionGroupId']);
| 
| // collapses the 'competition' filter group in the Filters Tool Panel
| filtersToolPanel.collapseFilters(['competitionGroupId']);
</snippet>

Notice in the snippet above that it's possible to target individual filter groups by supplying `groupId`s.

The example below demonstrates these methods in action. Note the following:

- When the grid is initialised, `collapseFilterGroups()` is invoked in the `onGridReady` callback to collapse all filter groups in the tool panel.
- Clicking **Expand Athlete & Competition** just expands the 'Athlete' and 'Competition' filter groups using: `expandFilterGroups(['athleteGroupId', 'competitionGroupId'])`.
- Clicking **Collapse Competition** just collapses the 'Competition' filter group using: `collapseFilterGroups(['competitionGroupId'])`.
- Clicking **Expand All** expands all filter groups using: `expandFilterGroups()`. Note that 'Sport' is not expanded as it is not a filter group.
- Clicking **Collapse All** collapses all filter groups using: `collapseFilterGroups()`.

<grid-example title='Expand / Collapse Groups' name='expand-collapse-groups' type='generated' options='{ "enterprise": true, "modules": ["clientside", "menu", "setfilter", "filterpanel"] }'></grid-example>

## Expand / Collapse Filters

It is possible to expand and collapse the filters in the Filters Tool Panel by invoking methods on the Filters Tool Panel Instance. These methods are shown below:

```ts
interface IFiltersToolPanel {
    expandFilters(colIds?: string[]): void;
    collapseFilters(colIds?: string[]): void;
    ... // other methods
}
```

The code snippet below shows how to expand and collapse filters using the Filters Tool Panel instance:

<snippet>
| // lookup Filters Tool Panel instance by id, in this case using the default filter instance id
| const filtersToolPanel = gridOptions.api.getToolPanelInstance('filters');
| 
| // expands all filters in the Filters Tool Panel
| filtersToolPanel.expandFilters();
| 
| // collapses all filters in the Filters Tool Panel
| filtersToolPanel.collapseFilters();
| 
| // expands 'year' and 'sport' filters in the Filters Tool Panel
| filtersToolPanel.expandFilters(['year', 'sport']);
| 
| // collapses the 'year' filter in the Filters Tool Panel
| filtersToolPanel.expandFilters(['year']);
</snippet>


Notice in the snippet above that it's possible to target individual filters by supplying `colId`s.

The example below demonstrates these methods in action. Note the following:

- When the grid is initialised all filters are collapsed by default
- Clicking **Expand Year &amp; Sport** just expands the 'year' and 'sport' filters by invoking: `expandFilters(['year', 'sport'])`.
- Clicking **Collapse Year** just collapses the 'year' filter using: `collapseFilters(['year'])`.
- Clicking **Expand All** expands all filters using: `expandFilters()`.
- Clicking **Collapse All** collapses all filters using: `collapseFilters()`.

<grid-example title='Expand / Collapse Filters' name='expand-collapse-filters' type='generated' options='{ "enterprise": true, "modules": ["clientside", "menu", "setfilter", "filterpanel"] }'></grid-example>

## Custom Filters Layout

The order of columns in the Filters Tool Panel is derived from the `columnDefs` supplied in the grid options, and is kept in sync with the grid when columns are moved by default. However custom filter layouts can also be defined by invoking the following method on the Filters Tool Panel Instance:

```ts
interface IFiltersToolPanel {
    setFilterLayout(colDefs: ColDef[]): void;
    ... // other methods
}
```

Notice that the same [Column Definitions](/column-definitions/) that are supplied in the grid options are also passed to `setFilterLayout(colDefs)`.

The code snippets below show how to set custom filter layouts using the Filters Tool Panel instance:

<snippet>
const gridOptions = {
    // original column definitions supplied to the grid
    columnDefs: [
        { field: 'a' },
        { field: 'b' },
        { field: 'c' },
    ]
}
</snippet>

<snippet>
| // lookup Filters Tool Panel instance by id, in this case using the default columns instance id
| const filtersToolPanel = gridOptions.api.getToolPanelInstance('filters');
| 
| // set custom Filters Tool Panel layout
| filtersToolPanel.setFilterLayout([
|     {
|         headerName: 'Group 1', // group doesn't appear in grid
|         children: [
|             { field: 'c' }, // custom column order with column "b" omitted
|             { field: 'a' }
|         ]
|     }
| ]);
</snippet>

Notice from the snippet above that it's possible to define groups in the tool panel that don't exist in the grid. Also note that filters can be omitted or positioned in a different order however note that all referenced columns (that contain filters) must already exist in the grid.

[[note]]
| When providing a custom layout it is recommend to enable `suppressSyncLayoutWithGrid` in the
| tool panel params to prevent users changing the layout when moving columns in the grid.

The example below shows two custom layouts for the Filters Tool Panel. Note the following:

- When the grid is initialised the filter layout in the Filters Tool Panel matches what is supplied to the grid in `gridOptions.columnDefs`.
- Clicking **Custom Sort Layout** invokes `setFilterLayout(colDefs)` with a list of column definitions arranged in ascending order.
- Clicking **Custom Group Layout** invokes `setFilterLayout(colDefs)` with a list of column definitions containing groups that don't appear in the grid.
- Moving columns in the grid won't affect the custom layouts as `suppressSyncLayoutWithGrid` is enabled.

<grid-example title='Custom Filters Layout' name='custom-layout' type='generated' options='{ "enterprise": true, "modules": ["clientside", "menu", "setfilter", "filterpanel"] }'></grid-example>
