---
title: "Columns Tool Panel"
enterprise: true
---

The columns tool panel provides functions for managing the grid's columns.

## Simple Example

Below shows a simple example of the columns tool panel. The following can be noted:

- Grid property `toolPanel='columns'` which shows only the columns tool panel.
- Grid property `defaultColDef` has `enableValue`, `enableRowGroup` and `enablePivot` set. This means all columns can be dragged to any of the Row Groups, Values and Column sections. Although each column can be dragged to these sections, it does not make sense to do so. For example, it does not make sense to aggregate the country column, but it does make sense to group rows by country.

Things to try:

- Checking / unchecking columns will show / hide the columns.
- Drag and Drop a column inside the columns sections to reorder columns in the grid. 
- Drag a column (e.g. Country) to Row Groups to group rows.
- Drag a column (e.g. Gold) to Values to aggregate.
- Reset (refresh) the demo and do the following:
    - Click 'Pivot Mode'.
    - Drag 'Country' to 'Row Groups'.
    - Drag 'Year' to 'Column Labels'.
    - Drag 'Gold' to 'Values'.

    You will now have a pivot grid showing total gold medals for each country (rows showing countries) by year (columns showing years).

<grid-example title='Tool Panel Simple' name='simple' type='generated' options='{ "enterprise": true, "exampleHeight": 630, "modules": ["clientside", "rowgrouping", "menu", "setfilter", "columnpanel"] }'></grid-example>

[[note]]
| Remember to mark the column definitions with `enableRowGroup` for grouping, `enablePivot`
| for pivoting and `enableValue` for aggregation, otherwise you won't be able to drag and drop the
| columns to the desired sections.

## Selection Action

Selecting columns means different things depending on whether the grid is in pivot mode or not as follows:

- **Pivot Mode Off**: When pivot mode is off, selecting a column toggles the visibility of the column. A selected column is visible and an unselected column is hidden. With `allowDragFromColumnsToolPanel=true` you can drag a column from the tool panel onto the grid it will become visible.
- **Pivot Mode On**: When pivot mode is on, selecting a column will trigger the column to be either aggregated, grouped or pivoted depending on what is allowed for that column.

## Column Tool Panel Sections

The column tool panel is split into different sections as follows:

- **Pivot Mode Section**: Check the 'Pivot Mode' checkbox to turn the grid into [Pivot Mode](/pivoting/). Uncheck to take the grid out of pivot mode.
- **Expand / Collapse All**: Toggle to expand or collapse all column groups.
- **Columns Section**: Display all columns, grouped by column groups, that are available to be displayed in the grid. By default the order of the columns is kept in sync with the order they are shown in the grid, but this behaviour can be disabled.
- **Select / Un-select All**: Toggle to select or un-select all columns in the columns section.
- **Select / Un-Select Column (or Group)**: Each column can be individually selected. What selection means depends on pivot mode and is explained below*.
- **Drag Handle**: Each column can be dragged either with the mouse or via touch on touch devices. The column can then be dragged to one of the following:
    1. Row Groups Section
    2. Values (Pivot) Section
    3. Column Labels Section
    4. Onto the grid (when `gridOptions.allowDragFromColumnsToolPanel=true`)
    5. Inside Columns Section to reorder columns (see [Suppress Column Reordering](/tool-panel-columns/#suppress-column-reordering))
- **Row Groups Section**: Columns here will form the grid's [Row Grouping](/grouping/).
- **Values Section**: Columns here will form the grid's [Aggregations](/aggregation/). The grid calls this function 'Aggregations', however for the UI we follow the Excel naming convention and call it 'Values'.
- **Column Labels (Pivot) Section**: Columns here will form the grid's [Pivot](/pivoting/). The grid calls this function 'Pivot', however for the UI we follow the Excel naming convention and call it 'Column Labels'.

<image-caption src="tool-panel-columns/resources/screenshot.png" alt="AG Grid Tool Panel Section" width="50rem" centered="true" constrained="true"></image-caption>

## Section Visibility

It is possible to remove items from the tool panel. Items are suppressed by setting one or more of the following `toolPanelParams` to `true` whenever you are using the `agColumnsToolPanel` component properties:

<interface-documentation interfaceName='ToolPanelColumnCompParams' exclude='["api", "columnApi"]' config='{"overrideBottomMargin":"1rem"}' ></interface-documentation>

To remove a particular column from the tool panel, set the column property `suppressColumnsToolPanel` to `true`. This is useful when you have a column working in the background, e.g. a column you want to group by, but not visible to the user.

<api-documentation source='column-properties/properties.json' section='columns' names='["suppressColumnsToolPanel"]'></api-documentation>

It is also possible to show and hide the sections of the Column Tool Panel using the following methods provided in the `IColumnToolPanel` interface:

```ts
interface IColumnToolPanel {
    setPivotModeSectionVisible(visible: boolean): void;
    setRowGroupsSectionVisible(visible: boolean): void;
    setValuesSectionVisible(visible: boolean): void;
    setPivotSectionVisible(visible: boolean): void;
    ... // other methods
}
```

The example below demonstrates the suppress options / methods described above. Note the following:

- The following sections are not present in the tool panel: Row Groups, Values, Column Labels, Pivot Mode, Side Buttons, Column Filter, Select / Un-select All, Expand / Collapse All.
- The date column is hidden from the tool panel using: `colDef.suppressColumnsToolPanel=true`.
- Clicking **Show Pivot Mode Section** invokes `setPivotModeSectionVisible(true)` on the column tool panel instance.
- Clicking **Show Row Groups Section** invokes `showRowGroupsSection(true)` on the column tool panel instance.
- Clicking **Show Values Section** invokes `showValuesSection(true)` on the column tool panel instance.
- Clicking **Show Pivot Section** invokes `showPivotSection(true)` on the column tool panel instance.

<grid-example title='Section Visibility' name='section-visibility' type='generated' options='{ "enterprise": true, "exampleHeight": 630, "modules": ["clientside", "menu", "columnpanel"] }'></grid-example>

## Suppress Column Reordering

By default, reordering columns in the grid will also reorder the columns shown in the Columns Section of the Columns Tool Panel. This default behaviour can be disabled via `toolPanelParams.suppressSyncLayoutWithGrid`. 

Similarly, the reordering of columns from inside the Columns Section of the Columns Tool Panel is also enabled by default, and can be disabled via 
`toolPanelParams.suppressColumnMove`. 

The configuration of these properties are shown below:

<snippet>
const gridOptions = {
    sideBar: {
          toolPanels: [
              {
                id: 'columns',
                labelDefault: 'Columns',
                labelKey: 'columns',
                iconKey: 'columns',
                toolPanel: 'agColumnsToolPanel',
                toolPanelParams: {
                  // tool panel columns won't move when columns are reordered in the grid
                  suppressSyncLayoutWithGrid: true, 
                  // prevents columns being reordered from the columns tool panel
                  suppressColumnMove: true,
                },
              },
            ],
            defaultToolPanel: 'columns',
        },
}
</snippet>

Note that it usually makes sense to enable both of these properties together but flexibility is provided through
separate properties.

The following example demonstrates the results of enabling both of these properties. Note the following:

- Moving columns in the grid won't reorder columns in the columns tool panel as `suppressSyncLayoutWithGrid=true`.
- It is not possible to reorder columns from the columns tool panel as `suppressColumnMove=true`.

<grid-example title='Suppress Column Reordering' name='suppress-column-reordering' type='generated' options='{ "enterprise": true, "exampleHeight": 670, "modules": ["clientside", "menu", "columnpanel"] }'></grid-example>

## Styling Columns

You can add a CSS class to the columns in the tool panel by specifying `toolPanelClass` in the column definition as follows:

<snippet spaceBetweenProperties="true">
|const gridOptions = {
|    columnDefs: [
|        // set as string
|        { field: 'gold', toolPanelClass: 'tp-gold' },
|
|        // set as array of strings
|        { field: 'silver', toolPanelClass: ['tp-silver'] },
|
|        // set as function returning string or array of strings
|        {
|            field: 'bronze',
|            toolPanelClass: params => {
|                return 'tp-bronze';
|            },
|        }
|    ]
|}
</snippet>

## Column Tool Panel Example

The example below demonstrates the column tool panel using a mixture of items explained above. Note the following:

- The `country`, `year`, `date` and `sport` columns all have `enableRowGroup=true` and `enablePivot=true`. This means you can drag the columns to the group and pivot sections, but you cannot drag them to the values sections.
- The `gold`, `silver` and `bronze` columns all have `enableValue=true`. This means you can drag the columns to the values section, but you cannot drag them to the group or pivot sections.
- The `gold`, `silver` and `bronze` columns have style applied using `toolPanelClass`.
- The country column uses a `headerValueGetter` to give the column a slightly different name dependent on where it appears using the `location` parameter.

<grid-example title='Tool Panel Styling' name='styling' type='generated' options='{ "enterprise": true, "exampleHeight": 610, "modules": ["clientside", "menu", "setfilter", "columnpanel"] }'></grid-example>

## Read Only Functions

By setting the property `functionsReadOnly=true`, the grid will prevent changes to group, pivot or values through the GUI. This is useful if you want to show the user the group, pivot and values panel, so they can see which columns are used, but prevent them from making changes to the selection.

<grid-example title='Read Only Example' name='read-only' type='generated' options='{ "enterprise": true, "exampleHeight": 670, "modules": ["clientside", "menu", "columnpanel"] }'></grid-example>

## Expand / Collapse Column Groups

It is possible to expand and collapse the column groups in the Columns Tool Panel by invoking methods on the Columns Tool Panel Instance. These methods are shown below:

```ts
interface IColumnToolPanel {
    expandColumnGroups(groupIds?: string[]): void;
    collapseColumnGroups(groupIds?: string[]): void;
    ... // other methods
}
```

The code snippet below shows how to expand and collapse column groups using the Columns Tool Panel instance:

<snippet>
|// lookup Columns Tool Panel instance by id, in this case using the default columns instance id
|const columnsToolPanel = gridOptions.api.getToolPanelInstance('columns');
|
|// expands all column groups in the Columns Tool Panel
|columnsToolPanel.expandColumnGroups();
|
|// collapses all column groups in the Columns Tool Panel
|columnsToolPanel.collapseColumnGroups();
|
|// expands the 'Athlete' and 'Competition' column groups in the Columns Tool Panel
|columnsToolPanel.expandColumnGroups(['athleteGroupId', 'competitionGroupId']);
|
|// collapses the 'Competition' column group in the Columns Tool Panel
|columnsToolPanel.collapseFilters(['age', 'sport']);
</snippet>

Notice in the snippet above that it's possible to target individual column groups by supplying `groupId`s.

The example below demonstrates these methods in action. Note the following:

- When the grid is initialised, `collapseColumnGroups()` is invoked using the `onGridReady` callback to collapse all column groups in the tool panel.
- Clicking **Expand All** expands all column groups using `expandColumnGroups()`.
- Clicking **Collapse All** collapses all column groups using `collapseColumnGroups()`.
- Clicking **Expand Athlete & Competition** expands only the 'Athlete' and 'Competition' column groups using `expandColumnGroups(['athleteGroupId', 'competitionGroupId'])`.
- Clicking **Collapse Competition** collapses only the 'Competition' column group using `collapseColumnGroups(['competitionGroupId'])`.

<grid-example title='Expand / Collapse Column Groups' name='expand-collapse' type='generated' options='{ "enterprise": true, "exampleHeight": 640, "modules": ["clientside", "menu", "setfilter", "columnpanel"] }'></grid-example>

## Custom Column Layout

The order of columns in the Columns Tool Panel is derived from the `columnDefs` supplied in the grid options, and is kept in sync with the grid when columns are moved by default. However custom column layouts can also be defined by invoking the following method on the Columns Tool Panel Instance:

```ts
interface IColumnToolPanel {
    setColumnLayout(colDefs: ColDef[]): void;
    ... // other methods
}
```

Notice that the same [Column Definitions](/column-definitions/) that are supplied in the grid options are also passed to `setColumnLayout(colDefs)`.

The code snippets below show how to set custom column layouts using the Columns Tool Panel instance:

<snippet>
const gridOptions = {
    // original column definitions supplied to the grid
    columnDefs: [
        { field: 'a' },
        { field: 'b' },
        { field: 'c' }
    ]
}
</snippet>

<snippet>
|// lookup Columns Tool Panel instance by id, in this case using the default columns instance id
|const columnsToolPanel = gridOptions.api.getToolPanelInstance('columns');
|
|// set custom Columns Tool Panel layout
|columnsToolPanel.setColumnLayout([
|    {
|        headerName: 'Group 1', // group doesn't appear in grid
|        children: [
|            { field: 'c' }, // custom column order with column "b" omitted
|            { field: 'a' }
|        ]
|    }
|]);
</snippet>

Notice from the snippet above that it's possible to define column groups in the tool panel that don't exist in the grid. Also note that columns can be omitted or positioned in a different order but all referenced columns must already exist in the grid.

[[note]]
| When providing a custom layout it is recommended to enable both `suppressSyncLayoutWithGrid` and `suppressColumnMove` (see [Suppress Column Reordering](/tool-panel-columns/#suppress-column-reordering) for more details).

The example below shows two custom layouts for the Columns Tool Panel. Note the following:

- When the grid is initialised the column layout in the Columns Tool Panel matches what is supplied to the grid in `gridOptions.columnDefs`.
- Clicking **Custom Sort Layout** invokes `setColumnLayout(colDefs)` with a list of column definitions arranged in ascending order.
- Clicking **Custom Group Layout** invokes `setColumnLayout(colDefs)` with a list of column definitions containing groups that don't appear in the grid.
- Moving columns in the grid won't affect the custom layouts as `suppressSyncLayoutWithGrid` is enabled.
- Moving columns from within the Columns Tool Panel has been disabled as `suppressColumnMove` is enabled.

<grid-example title='Custom Column Layout' name='custom-layout' type='generated' options='{ "enterprise": true, "modules": ["clientside", "menu", "setfilter", "columnpanel"],"exampleHeight": 640 }'></grid-example>

## Next Up

Now that we covered the Columns Tool Panel, continue to the next section to learn about the [Filters Tool Panel](/tool-panel-filters/).

