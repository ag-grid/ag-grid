---
title: "Column Filters - Configuration"
---

This section explains the basic configuration shared by all column filters (both filters provided by the grid and [Custom Filters](/component-filter/)).

## Configuring Filters on Columns

Enable filtering on a column using the column definition property `filter`. The property can have one of the following values:

- `boolean`: Set to `true` to enable the default filter. The default is [Text Filter](/filter-text/) for AG Grid Community and [Set Filter](/filter-set/) for AG Grid Enterprise.
- `string` / `Component`: Provide a specific filter to use instead of the default filter.

The code below shows some column definitions with filters set:

<snippet>
|const gridOptions = {
|    columnDefs: [
|        // sets the text filter
|        { field: 'athlete', filter: 'agTextColumnFilter' },
|
|        // sets the number filter
|        { field: 'age', filter: 'agNumberColumnFilter' },
|
|        // use the default filter
|        { field: 'gold', filter: true },
|
|        // use no filter (leaving unspecified means use no filter)
|        { field: 'sport' },
|    ]
|}
</snippet>

If you want to enable filters on all columns, you should set a filter on the [Default Column Definition](/column-definitions/#default-column-definitions). The following code snippet shows setting `filter=true` for all columns via the `defaultColDef` and then setting `filter=false` for the Sport column, so all columns have a filter except Sport.

<snippet spaceBetweenProperties="true">
|const gridOptions = {
|    // anything specified in defaultColDef gets applied to all columns
|    defaultColDef: {
|        // set filtering on for all columns
|        filter: true,
|    },
|    columnDefs: [
|        // filter not specified, defaultColDef setting is used
|        { field: 'athlete' },
|        { field: 'age' },
|
|        // filter specifically set to 'false', i.e. use no filter
|        { field: 'sport', filter: false },
|    ],
|}
</snippet>

The following example demonstrates configuring different filters on columns.

<grid-example title='Configuring Filters on Columns' name='configuring-filters' type='generated' options='{ "exampleHeight": 560 }'></grid-example>

## Filter Parameters

Each filter can take additional filter parameters by setting `colDef.filterParams`. The parameters each filter type accepts are specific to each filter; parameters for the Provided Filters are explained in their relevant sections.

The code below shows configuring a Text Filter on the Athlete column and providing extra filter parameters (what the `buttons` do is explained in [Apply, Clear, Reset and Cancel Buttons](/filter-applying/#apply-clear-reset-and-cancel-buttons)).

<snippet spaceBetweenProperties="true">
const gridOptions = {
    columnDefs: [
        // column configured to use Text Filter
        {
            field: 'athlete',
            filter: 'agTextColumnFilter',
            // pass in additional parameters to the Text Filter
            filterParams: {
                buttons: ['reset', 'apply'],
                debounceMs: 200
            }
        }
    ]
}
</snippet>

## Filter Values

By default, the values supplied to the filter are retrieved from the data based on the `field` attribute. This can be overridden by providing a `filterValueGetter` in the Column Definition as shown below. This is similar to using a [Value Getter](/value-getters), but is specific to the filter.

<api-documentation source='column-properties/properties.json' section='filtering' names='["filterValueGetter"]'></api-documentation>

<snippet>
const gridOptions = {  
    columnDefs: [
        { field: 'country', rowGroup: true, hide: true },
        { field: 'year', rowGroup: true, hide: true },
        { field: 'gold' },
    ], 
    autoGroupColumnDef: { 
        // enables filtering on the group column
        filter: true,
        // supplies 'country' values to the filter 
        filterValueGetter: params => params.data.country,                          
    }, 
    groupDisplayType: 'singleColumn',
}
</snippet>

## Filter Events

Filtering causes the following events to be emitted:

<api-documentation source='grid-events/events.json' section='filter'></api-documentation>

## Filter Model

When saving or restoring state on a filter, the Filter Model is used. The Filter Model represents the state of the filter. For example, the code below first gets and then sets the Filter Model for the Athlete column, which is using a [Text Filter](/filter-text/):

<snippet>
|// get filter instance
|const filterInstance = gridOptions.api.getFilterInstance('athlete');
|
|// get filter model
|const model = filterInstance.getModel();
|
|// set filter model and update
|filterInstance.setModel({
|    type: 'endsWith',
|    filter: 'thing'
|});
|
|// refresh rows based on the filter (not automatic to allow for batching multiple filters)
|gridOptions.api.onFilterChanged();
</snippet>

[[note]]
| The best way to understand what the Filter Models look like is to set a filter via the
| UI and call `api.getFilterModel()` in your console. You can then see what the model looks like for different variations of the filters.

## Filtering Animation

To enable animation of the rows when filtering, set the grid property `animateRows=true`.

## Style Header on Filter

Each time a filter is applied to a column the CSS class `ag-header-cell-filtered` is added to the header. This can be used for adding style to headers that are filtered.

In the example below, we've added some styling to `ag-header-cell-filtered`, so when you filter a column you will notice the column header change.

<grid-example title='Style Header' name='style-header-on-filter' type='generated' options='{ "exampleHeight": 520 }'></grid-example>

## Next Up

Continue to the next section to learn about the [Text Filter](/filter-text/).
