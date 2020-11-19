---
title: "Components"
---

You can create your own custom components to customise the behaviour of the grid. For example you can customise how cells are rendered, how values are edited and also create your own filters.

The full list of component types you can provide in ag-Grid are as follows:

- [Cell Renderer](../component-cell-renderer/): To customises the contents of a cell.
- [Cell Editor](../component-cell-editor/): To customises editing of a cell.
- [Date Component](../component-date/): To customise the date selection component in the date filter.
- [Filter Component](../component-filter/): For custom column filter that appears inside the column menu.
- [Floating Filter](../component-floating-filter/): For custom column filter that appears inside the column menu.
- [Header Component](../component-header/): To customise the header of a column and column groups.
- [Loading Cell Renderer](../component-loading-cell-renderer/): To customise the loading cell row when using Server Side row model.
- [Overlay Component](../component-overlay/): To customise loading and no rows overlay components.
- [Status Bar Component](../component-status-bar/): For custom status bar components.
- [Tool Panel Component](../component-tool-panel/): For custom tool panel components.
- [Tooltip Component](../component-tooltip/): For custom cell tooltip components.

The remainder of this page gives information that is common across all the component types.


## Registering Custom Components

The pages for each component type (cell renderer, cell editor etc) contain examples on how to register and use each component type. However it is useful here to step back and focus on the component registration process which is common across all component types and all frameworks (React, Angular etc).

There are two ways to register custom components:

- By name.
- Direct reference.

Both options are fully supported by the grid, however the preferred options is by name as it's more flexible. All of the examples in the documentation use this approach. The direct reference approach is kept for backwards compatibility reasons as this was the original way to do it in ag-Grid.

### 1. By Name

A component is registered with the grid by providing it through the `components` grid property. The `components` grid property contains a map of 'component names' to 'component classes'. Components of all types (editors, renderers, filters etc) are all stored together and must have unique names.

```js
gridOptions = {

    // register the components using 'components' grid property
    components: {
        // 'countryCellRenderer' is mapped to class CountryCellRenderer
        countryCellRenderer: CountryCellRenderer,
        // 'countryFilter' is mapped to class CountryFilter
        countryFilter: CountryFilter
    },

    // then refer to the component by name
    columnDefs: [
        {
            field: 'country',
            cellRenderer: 'countryCellRenderer',
            filter: 'countryFilter'
        },
    ],

    ...
}
```

### 2. Direct Reference

A shorter approach is to refer to the component class directly.

```js
gridOptions = {

    // then refer to the component by name
    columnDefs: [
        {
            field: 'country',
            cellRenderer: CountryCellRenderer,
            filter: CountryFilter
        },
    ],

    ...
}
```

### Advantages of By Name

Registering components by name has the following advantages:

- Implementations can change without having to change all the column definitions. For example, you may have 20 columns using a currency cell renderer. If you want to update the cell renderer to another currency cell renderer, you only need to do it in only place (where the cell renderer is registered) and all columns will pick up the new implementation.
- The part of the grid specifying column definitions is plain JSON. This is helpful for applications that read column definitions from static data. If you referred to the class name directly inside the column definition, it would not be possible to convert the column definition to JSON.

## Registering Framework Components

Most of the frameworks ag-Grid works with use components. It is possible to use the framework components inside of ag-Grid. Configuring the components is same and explained in this section. The frameworks that follow this conventions are:

- **Angular** (version 2 and later)
- **React**
- **VueJS**
- **Polymer**

The following frameworks are not configured in this way:

- **AngularJS 1**: This framework does not follow the same pattern as other frameworks. See [AngularJS](../best-angularjs-grid/#angular-compiling) on how you can turn on AngularJS 1 compiling to use AngularJS bindings inside ag-Grid.

If you are using one of the supported frameworks registration is done using the `frameworkComponents` property rather than the `components` property. Then the component is registered by name as normal.

```js
gridOptions = {
    // use frameworkComponents instead of components. most frameworks will allow you
    // to specify this as a bound property.
    frameworkComponents: {
        countryCellRenderer: AngularCountryCellRenderer,
        countryFilter: AngularCountryFilter
    },

    // then refer to the component by name as before
    columnDefs: [
        {
            field: 'country',
            cellRenderer: 'countryCellRenderer',
            filter: 'countryFilter'
        },
    ],

    ...
}
```

You can also refer to the component classes directly using the `framework` variant of the property. For example instead of using `cellRenderer` you use `cellRendererFramework`.

```js
gridOptions = {

    // then refer to the component by name
    columnDefs: [
        {
            field: 'country',
            cellRendererFramework: CountryCellRenderer,
            filterFramework: CountryFilter
        },
    ],

    ...
}
```

## Summary of Component Registration

Here we give an overview, as there is a lot of similar sounding information above.

The grid options has the following properties for registering components:

### Component Registration

<?php createDocumentationFromFile('../javascript-grid-properties/properties.json', 'components') ?>

### Component Usage

The below table gives an overview of where components can be used. The table shows both options for usage:

- **Name / Direct JavaScript:** This can be: 1) A component name referring to a registered component (either plain JavaScript or framework component); 2) A direct reference to a JavaScript component.
- **Direct Framework:** A direct reference to a framework (React, Angular etc) component.

| Component                     | Where                     | Name / Direct JavaScript | Direct Framework                     |
| ----------------------------- | ------------------------- | ------------------------ | ------------------------------------ |
| Detail Cell Renderer          | Grid Option               | detailCellRenderer       | detailCellRenderer**Framework**      |
| Full Width Cell Renderer      | Grid Option               | fullWidthCellRenderer    | fullWidthCellRenderer**Framework**   |
| Group Row Cell Renderer       | Grid Option               | groupRowRenderer         | groupRowRenderer**Framework**        |
| Group Row Inner Cell Renderer | Grid Option               | groupRowInnerRenderer    | groupRowInnerRenderer**Framework**   |
| Loading Cell Renderer         | Grid Option               | loadingCellRenderer      | loadingCellRenderer**Framework**     |
| Loading Overlay               | Grid Option               | loadingOverlayRenderer   | loadingOverlayRenderer**Framework**  |
| No Rows Overlay               | Grid Option               | noRowsOverlayRenderer    | noRowsOverlayRenderer**Framework**   |
| Date Component                | Grid Option               | dateComponent            | dateComponent**Framework**           |
| Status Bar Component          | Grid Option -> Status Bar | statusPanel              | statusPanel**Framework**             |
| Cell Renderer                 | Column Definition         | cellRenderer             | cellRenderer**Framework**            |
| Pinned Row Cell Renderer      | Column Definition         | pinnedRowCellRenderer    | pinnedRowCellRenderer**Framework**   |
| Cell Editor                   | Column Definition         | cellEditor               | cellEditor**Framework**              |
| Filter                        | Column Definition         | filter                   | filter**Framework**                  |
| Floating Filter               | Column Definition         | floatingFilterComponent  | floatingFilterComponent**Framework** |
| Header Component              | Column Definition         | headerComponent          | headerComponent**Framework**         |
| Header Group Component        | Column Definition         | headerGroupComponent     | headerGroupComponent**Framework**    |

## JavaScript or Framework

If you are using a framework, then you have a choice of the following:

1. Provide an ag-Grid component in JavaScript.
1. Provide an ag-Grid component as a framework component (eg React or Angular).

For example if you want to build a cell renderer and you are using React, you have the choice to build the cell renderer using React or using plain JavaScript.

If using a framework, you should first read how to build the component using plain JavaScript. This is because the framework specific component builds on what you learn from the JavaScript component.

## Mixing JavaScript and Framework

It is possible to mix JavaScript and framework components in the same application. The following code snippet shows how such can be configured:

```js
gridOptions = {
    // JavaScript components registered here
    components: {
        countryFilter: CustomCountryFilter
    },

    // Framework components registered here
    frameworkComponents: {
        countryCellRenderer: CountryCellRenderer
    },

    columnDefs: [ {
        field: 'country',

        // filter is a registered plain JavaScript component
        filter: 'countryFilter',

        // cell renderer is a registered framework (React, Angular etc) component
        cellRenderer: 'countryCellRenderer'
    } ]
};
```

## Grid Provided Components

The grid comes with pre-registered components that can be used. Each component provided by the grid starts with the namespaces 'ag' to minimise naming conflicts with user provided components. The full list of grid provided components are in the table below.

<table>
    <thead>
        <tr>
            <th colspan="2"><h3>Date Inputs</h3></td>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>agDateInput</td>
            <td>Default date input used by filters.</td>
        </tr>
        <tr>
            <td colspan="2"><h3>Column Headers</h3></td>
        </tr>
        <tr>
            <td>agColumnHeader</td>
            <td>Default column header.</td>
        </tr>
        <tr>
            <td>agColumnHeaderGroup</td>
            <td>Default column group header.</td>
        </tr>
        <tr>
            <td colspan="2"><h3>Column Filters</h3></td>
        </tr>
        <tr>
            <td>agSetColumnFilter</td>
            <td>Set filter (default when using ag-Grid Enterprise).</td>
        </tr>
        <tr>
            <td>agTextColumnFilter</td>
            <td>Simple text filter (default when using ag-Grid Free).</td>
        </tr>
        <tr>
            <td>agNumberColumnFilter</td>
            <td>Number filter.</td>
        </tr>
        <tr>
            <td>agDateColumnFilter</td>
            <td>Date filter.</td>
        </tr>
        <tr>
            <td colspan="2"><h3>Floating Filters</h3></td>
        </tr>
        <tr>
            <td>agSetColumnFloatingFilter</td>
            <td>Floating set filter.</td>
        </tr>
        <tr>
            <td>agTextColumnFloatingFilter</td>
            <td>Floating text filter.</td>
        </tr>
        <tr>
            <td>agNumberColumnFloatingFilter</td>
            <td>Floating number filter.</td>
        </tr>
        <tr>
            <td>agDateColumnFloatingFilter</td>
            <td>Floating date filter.</td>
        </tr>
        <tr>
            <td colspan="2"><h3>Cell Renderers</h3></td>
        </tr>
        <tr>
            <td>agAnimateShowChangeCellRenderer</td>
            <td>Cell renderer that animates value changes.</td>
        </tr>
        <tr>
            <td>agAnimateSlideCellRenderer</td>
            <td>Cell renderer that animates value changes.</td>
        </tr>
        <tr>
            <td>agGroupCellRenderer</td>
            <td>Cell renderer for displaying group information.</td>
        </tr>
        <tr>
            <td>agLoadingCellRenderer</td>
            <td>Cell editor for loading row when using Enterprise row model.</td>
        </tr>
        <tr>
            <td colspan="2"><h3>Overlays</h2></td>
        </tr>
        <tr>
            <td>agLoadingOverlay</td>
            <td>Loading overlay.</td>
        </tr>
        <tr>
            <td>agNoRowsOverlay</td>
            <td>No rows overlay.</td>
        </tr>
        <tr>
            <td colspan="2"><h3>Cell Editors</h3></td>
        </tr>
        <tr>
            <td>agTextCellEditor</td>
            <td>Text cell editor.</td>
        </tr>
        <tr>
            <td>agSelectCellEditor</td>
            <td>Select cell editor.</td>
        </tr>
        <tr>
            <td>agRichSelectCellEditor<enterprise-icon></enterprise-icon></td>
            <td>Rich select editor.</td>
        </tr>
        <tr>
            <td>agPopupTextCellEditor</td>
            <td>Popup text cell editor.</td>
        </tr>
        <tr>
            <td>agPopupSelectCellEditor</td>
            <td>Popup select cell editor.</td>
        </tr>
        <tr>
            <td>agLargeTextCellEditor</td>
            <td>Large text cell editor.</td>
        </tr>
        <tr>
            <td colspan="2"><h3>Master Detail</h3></td>
        </tr>
        <tr>
            <td>agDetailCellRenderer<enterprise-icon></enterprise-icon></td>
            <td>Detail panel for master / detail grid.</td>
        </tr>
    </tbody>
</table>

### Overriding Grid Components

It is also possible to override components. Where the grid uses a default value, this means the override component will be used instead. The default components, where overriding makes sense, are as follows:

- **agDateInput**: To change the default date selection across all filters.
- **agColumnHeader**: To change the default column header across all columns.
- **agColumnGroupHeader**: To change the default column group header across all columns.
- **agLoadingCellRenderer**: To change the default loading cell renderer for Enterprise Row Model.
- **agLoadingOverlay**: To change the default 'loading' overlay.
- **agNoRowsOverlay**: To change the default loading 'no rows' overlay.
- **agTextCellEditor**: To change the default text cell editor.
- **agDetailCellRenderer**: To change the default detail panel for master / detail grids.

