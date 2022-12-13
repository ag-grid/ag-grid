---
title: "Set Filter - Filter List"
enterprise: true
---

This section describes how Filter List values can be managed through custom sorting and formatting. Supplying filter values directly to the Set Filter is also discussed.

## Sorting Filter Lists

Values inside a Set Filter will be sorted by default, where the values are converted to a string value and sorted in ascending order according to their UTF-16 codes.

When a different sort order is required, a Comparator can be supplied to the set filter as shown below:

<snippet>
const gridOptions = {
    columnDefs: [
        {
            field: 'age',
            filter: 'agSetColumnFilter',
            filterParams: {
                comparator: (a, b) => {
                    const valA = parseInt(a);
                    const valB = parseInt(b);
                    if (valA === valB) return 0;
                    return valA > valB ? 1 : -1;
                }
            }
        }
    ]
}
</snippet>

The Comparator used by the Set Filter is only provided the values in the first two parameters, whereas the Comparator for the Column Definition (`colDef`) is also provided the row data as additional parameters. This is because when sorting rows, row data exists. For example, take 100 rows split across the colour values `[white, black]`. The column will be sorting 100 rows, however the filter will be only sorting two values.

If you are providing a Comparator that depends on the row data and you are using the Set Filter, be sure to provide the Set Filter with an alternative Comparator that doesn't depend on the row data.

The following example demonstrates sorting Set Filter values using a comparator. Note the following:

- The **Age (no Comparator)** filter values are sorted using the default string order: `1, 10, 100...`
- The **Age (with Comparator)** filter has a custom Comparator supplied in the `filterParams` that sorts the ages by numeric value: `1, 2, 3...`

<grid-example title='Sorting Filter Lists' name='sorting-set-filter-values' type='generated' options='{ "enterprise": true, "exampleHeight": 720, "modules": ["clientside", "setfilter", "menu", "columnpanel", "filterpanel"] }'></grid-example>

## Formatting Values

This section covers different ways to format the displayed Filter List values in the Set Filter.

[[note]]
| Formatting Filter List values will not change the underlying value or Filter Model.

### Value Formatter

A [Value Formatter](/value-formatters/) is a good choice when the string value displayed in the Filter List needs to
be modified, for example adding country codes in parentheses after a country name, as shown below:

<snippet>
const countryValueFormatter = params => {
    const country = params.value;
    return country + ' (' + COUNTRY_CODES[country].toUpperCase() + ')';
}
</snippet>

The following snippet shows how to provide the `countryValueFormatter` to the Set Filter:

<snippet>
const gridOptions = {
    columnDefs: [
        // column definition using the same value formatter to format cell and filter values
        {
            field: 'country',
            valueFormatter: countryValueFormatter,
            filter: 'agSetColumnFilter',
            filterParams: {
                valueFormatter: countryValueFormatter,
            },
        }
    ]
}
</snippet>

In the code above, the same value formatter is supplied to the Column and Filter params, however separate Value Formatters can be used.

The following example shows how Set Filter values are formatted using a Value Formatter. Note the following:

- **No Value Formatter** does not have a Value Formatter supplied to the Set Filter. The column is supplied a Value Formatter through `colDef.valueFormatter = countryValueFormatter`.
- **With Value Formatter** has the same Value Formatter supplied to the Column and Set Filter. The Set Filter is supplied the value formatter through `filterParams.valueFormatter = countryValueFormatter`.
- Click **Print Filter Model** with a filter applied and note the logged Filter Model (dev console) has not been modified.

<grid-example title='Filter List Value Formatters' name='filter-list-value-formatter' type='generated' options='{ "enterprise": true, "exampleHeight": 745, "modules": ["clientside", "setfilter", "menu", "columnpanel", "filterpanel"] }'></grid-example> 

### Cell Renderer

A [Cell Renderer](/cell-rendering/) is a good choice when the value displayed requires markup. For instance if a
country flag image is to be shown alongside country names.

The same Cell Renderer can used to format the grid cells and filter values, or different renderers can be supplied to
each. Note that the Cell Renderer will be supplied additional info when used to format cells inside the grid (as grid
cells have row details that are not present for values inside a Filter List).

Assuming you have a customer Country Cell Renderer, the following snippet shows how to provide the `countryCellRenderer` to the Set Filter:

<snippet>
const gridOptions = {
    columnDefs: [
        // column definition using the same cell renderer to format cell and filter values
        {
            field: 'country',
            cellRenderer: countryCellRenderer,
            filter: 'agSetColumnFilter',
            filterParams: {
                cellRenderer: countryCellRenderer
            }
        }
    ]
}
</snippet>

[[note]]
| A custom [Cell Renderer Component](/component-cell-renderer/#cell-renderer-component) can also be supplied to `filterParams.cellRenderer`.


The following example shows how Set Filter values are rendered using a Cell Renderer. Note the following:

- **No Cell Renderer** does not have a Cell Renderer supplied to the Set Filter. The Column has a Cell Renderer supplied to the Column using `colDef.cellRenderer = countryCellRenderer`.
- **With Cell Renderer** uses the same Cell Renderer to format the cells and filter values. The Set Filter is supplied the Value Formatter using `filterParams.cellRenderer = countryCellRenderer`.
- Click **Print Filter Model** with a filter applied and note the logged filter model (dev console) has not been modified.

<grid-example title='Filter List Cell Renderers' name='filter-list-cell-renderer' type='generated' options='{ "enterprise": true, "exampleHeight": 745, "modules": ["clientside", "setfilter", "menu", "columnpanel", "filterpanel"] }'></grid-example>

## Supplying Filter Values

The Set Filter will obtain the filter values from the row data by default. However it is also possible to provide values, either synchronously or asynchronously, for the Filter List.

### Synchronous Values

The simplest approach is to supply a list of values to `filterParams.values` as shown below:

<snippet>
const gridOptions = {
    columnDefs: [
        {
            field: 'days',
            filter: 'agSetColumnFilter',
            filterParams: {
                // provide all days, even if days are missing in data!
                values: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
            }
        }
    ],
}
</snippet>

Note that if there are missing values in the row data, the filter list will display all provided values. This could give users the impression that filtering is broken.

[[note]]
| When providing filter values which are already sorted it is often useful to disable the default filter list sorting using `filterParams.suppressSorting=true`.

The following example demonstrates providing filter values using `filterParams.values`. Note the following:

- The **Days (Values Not Provided)** set filter obtains values from the row data to populate the filter list and as `'Saturday'` and `'Sunday'` are not present in the data they do not appear in the filter list.
- As the **Days (Values Not Provided)** filter values come from the row data they are sorted using a [Custom Sort Comparator](/filter-set-filter-list/#sorting-filter-lists) to ensure the days are ordered according to the week day.
- The **Days (Values Provided)** set filter is given values using `filterParams.values`. As all days are supplied the filter list also contains `'Saturday'` and `'Sunday'`.
- As the **Days (Values Provided)** filter values are provided in the correct order, the default filter list sorting is turned off using: `filterParams.suppressSorting=true`.

<grid-example title='Providing Filter Values' name='providing-filter-values' type='generated' options='{ "enterprise": true, "exampleHeight": 720, "modules": ["clientside", "setfilter", "menu", "columnpanel", "filterpanel"] }'></grid-example>

### Asynchronous Values

It is also possible to supply values asynchronously to the set filter. This is done by providing a callback function instead of a list of values as shown below:

<snippet>
const gridOptions = {
    columnDefs: [
        {
            filter: 'agSetColumnFilter',
            filterParams: {
                values: params => {
                    // async update simulated using setTimeout()
                    setTimeout(() => {
                        // fetch values from server
                        const values = getValuesFromServer();
                        // supply values to the set filter
                        params.success(values);
                    }, 3000);
                }
            }
        }
    ],
}
</snippet>

Note in the snippet above the values callback receives a parameter object which contains `params.success()`which allows values obtained asynchronously to be supplied to the set filter.

The interface for this parameter object is `SetFilterValuesFuncParams`:

<interface-documentation interfaceName='SetFilterValuesFuncParams' ></interface-documentation>

[[note]]
| If you are providing values to the Set Filter asynchronously, when setting the model using `setModel` you need to wait for changes to be applied before performing any further actions by waiting on the returned grid promise, e.g.:
|
| ```js
| filter.setModel({ values: ['a', 'b'] })
|   .then(() => gridApi.onFilterChanged(); );
| ```

The following example demonstrates loading set filter values asynchronously. Note the following:

- `filterParams.values` is assigned a callback function that loads the filter values after a 3 second delay using the callback supplied in the params: `params.success(['value1', 'value2'])`.
- Opening the set filter shows a loading message before the values are set. See the [Localisation](/localisation/) section for details on how to change this message.
- The callback is only invoked the first time the filter is opened. The next time the filter is opened the values are not loaded again.

<grid-example title='Callback/Async' name='callback-async' type='generated' options='{ "enterprise": true, "exampleHeight": 510, "modules": ["clientside", "setfilter", "menu", "columnpanel", "filterpanel"] }'></grid-example>

### Refreshing Values

By default, when values are passed to the set filter they are only loaded once when the set filter is initially created. It may be desirable to refresh the values at a later point, for example to reflect other filtering that has occurred in the grid. To achieve this, you can call `refreshFilterValues` on the relevant filter that you would like to refresh. This will cause the values used in the filter to be refreshed from the original source, whether that is by looking at the provided `values` array again, or by re-executing the `values` callback. For example, you might use something like the following:

<snippet>
const gridOptions = {
    onFilterChanged: params => {
        const setFilter = params.api.getFilterInstance('columnName');
        setFilter.refreshFilterValues();
    }
}
</snippet>

If you are using the grid as a source of values (i.e. you are not providing values yourself), calling this method will also refresh the filter values using values taken from the grid, but this should not be necessary as the values are automatically refreshed for you whenever any data changes in the grid.

If instead you want to refresh the values every time the Set Filter is opened, you can configure that using `refreshValuesOnOpen`:

<snippet>
const gridOptions = {
    columnDefs: [
        {
            filter: 'agSetColumnFilter',
            filterParams: {
                values: params => params.success(getValuesFromServer()),
                refreshValuesOnOpen: true,
            }
        }
    ],
}
</snippet>

When you refresh the values, any values that were selected in the filter that still exist in the new values will stay selected, but any other selected values will be discarded.

The following example demonstrates refreshing values. Note the following:

- The Values Array column has values provided as an array. Clicking the buttons to change the values will update the values in the array provided to the filter and call `refreshFilterValues()` to immediately refresh the filter for the column.
- The Values Callback column has values provided as a callback and is configured with `'refreshValuesOnOpen = true'`. Clicking the buttons to change the values will update the values that will be returned the next time the callback is called. Note that the values are not updated until the next time the filter is opened.
- If you select `'Elephant'` and change the values, it will stay selected as it is present in both lists.
- If you select any of the other options, that selection will be lost when you change to different values.
- A filter is re-applied after values have been refreshed.

<grid-example title='Refreshing Values' name='refreshing-values' type='generated' options='{ "enterprise": true, "exampleHeight": 755, "modules": ["clientside", "setfilter", "menu", "columnpanel", "filterpanel"] }'></grid-example>

## Enabling Value Case-Sensitivity

By default the Set Filter treats values as case-insensitive. Practically this means that cell values of `Black`, `black` and `BLACK` are all treated as identical for matching purposes, and the first encountered value is used as the value displayed in the Filter List.

Case-sensitivity can be enabled by using the `caseSensitive` filter parameter:

<snippet>
const gridOptions = {
    columnDefs: [
        {
            field: 'colour',
            filter: 'agSetColumnFilter',
            filterParams: {
                caseSensitive: true
            }
        }
    ]
}
</snippet>

[[note]]
| The `caseSensitive` option also affects [Mini-Filter](/filter-set-mini-filter/#enabling-case-sensitive-searches) searches and [API](/filter-set-api/#enabling-case-sensitivity) behaviours.

The following example demonstrates the difference in behaviour between `caseSensitive: false` (the default) and `caseSensitive: true`:
- The case insensitive column's Filter List has seven distinct values with unique colours.
  - Typing `black` into the Mini Filter will match `Black`.
- The case sensitive column's Filter List has 21 distinct values, although there are only seven distinct colours ignoring case.
  - Typing `black` into the Mini Filter will match only `black`, but not `Black` or `BLACK`.

<grid-example title='Enabling SetFilter Case-Sensitivity' name='case-sensitive-set-filter-list' type='mixed' options='{ "enterprise": true, "exampleHeight": 720, "modules": ["clientside", "setfilter", "menu", "columnpanel", "filterpanel"] }'></grid-example>

If case differences need to be normalised to remove redundant values from the data-source for filtering, a [Value Formatter](#value-formatter) should be used.

## Missing Values

If there are missing / empty values in the row data of the grid, or missing values in the list of [Supplied Values](#supplying-filter-values), the Filter List will contain an entry called `(Blanks)` which can be used to select / deselect all of these values. If this not the desired behaviour, provide a [Formatter](#value-formatter) to present blank values in a different way.

`undefined`, `null` and `''` are all treated as missing values. These will appear within the [Set Filter model](/filter-set-api/#set-filter-model) as a single entry of `null`. This also applies to supplied Filter List values (e.g. if you supply `''` it will appear in the filter model as `null`).

## Filter Value Types

The Set Filter internally maintains the original type of the cell values, but always uses strings for the keys. E.g. if the cell contains a number, the Filter Model will contain those numbers converted to strings, but if you specified a value formatter, that would use the values with type number. Note that in AG Grid versions prior to 29.0, the Filter Model values were converted to strings for everything. This behaviour can be replicated by setting `filterParams.convertValuesToStrings = true`, but the setting is deprecated.

### Complex Objects

If you are providing complex objects as values, then you need to provide both a Key Creator function and a Value Formatter function when using the Set Filter.

The Key Creator generates a unique string key from the complex object. This key is used within the Filter Model, and to compare objects. You can either provide a Key Creator within the filter params, which will be specific to the Set Filter, or you can provide one in the Column Definition that is shared with other features such as grouping.

The Value Formatter is used to generate the label that is displayed to the user within the Filter List. You can provide the Value Formatter in the filter params.

<snippet spaceBetweenProperties="true">
const gridOptions = {
    columnDefs: [
        {
            field: 'country',
            filter: 'agSetColumnFilter',
            filterParams: {
                keyCreator: params => params.value.code,
                valueFormatter: params => params.value.name,
            },
        }
    ],
}
</snippet>

The snippet above shows a Key Creator function that returns the country code from the complex object, and a Value Formatter that returns the name. If the Key Creator or Value Formatter were not provided at all, the Set Filter would not work.

If [Supplied Values](#supplying-filter-values) are used for the Filter List, these must be the full complex objects.

In AG Grid versions prior to 29.0, the value generated by the Key Creator was used as both the key and display value. This behaviour can still be replicated by setting `filterParams.convertValuesToStrings = true`. This will use the Key Creator to generate a string value that is used for both. Values provided to the Filter List should be the string values when this setting is on. Note that this behaviour is deprecated.

The following example shows the Key Creator handling complex objects for the Set Filter. Note the following:

- **Country (Complex Object as Value)** column is supplied a complex object through `colDef.field`.
    - A Key Creator is supplied to the filter using `colDef.filterParams.keyCreator = countryCodeKeyCreator` which extracts the `code` property for the Set Filter.
    - A value formatter is supplied to the filter using `colDef.filterParams.valueFormatter = countryValueFormatter` which extracts the `name` property for the Filter List.
    - A value formatter is supplied to the column using `colDef.valueFormatter = countryValueFormatter` which extracts the `name` property for the cell values.
- **Country (Complex Object as String)** column is supplied the same complex object through `colDef.field`.
    - `colDef.filterParams.convertValuesToStrings = true` is set, which means the complex object will be converted to a string, and the same value used for both key and display purposes.
    - A Key Creator is supplied to the filter using `colDef.filterParams.keyCreator = countryNameKeyCreator` which extracts the `name` property for the Set Filter.
- Click **Print Filter Model** with a filter active on **Country (Complex Object as Value)** and note the logged Filter Model (dev console) uses the `code` property from the complex object.
- Click **Print Filter Model** with a filter active on **Country (Complex Object as String)** and note the logged Filter Model (dev console) uses the `name` property from the complex object.

<grid-example title='Complex Objects' name='complex-objects' type='generated' options='{ "enterprise": true, "exampleHeight": 505, "modules": ["clientside", "setfilter", "menu", "columnpanel", "filterpanel"] }'></grid-example>

## Multiple Values Per Cell

Sometimes you might wish to support multiple values in a single cell, for example when using tags. In this case, the Set Filter can extract each of the individual values from the cells, creating an entry in the Filter List for each individual value. Selecting a value will then show rows where any of the values in the cell match the selected value.

The example below demonstrates this in action. Note the following:

- The **Animals (array)** column uses an array in the data containing multiple values.
- The **Animals (string)** column uses a single string in the data to represent multiple values, with a [Value Getter](/value-getters/) used to extract an array of values from the data.
- The **Animals (objects)** column retrieves values from an array of objects, using a [Key Creator](#complex-objects). The Key Creator is applied to the elements within the array (as is the Value Formatter). Note that if `convertValuesToStrings` is set in the filter params, the Key Creator will be applied to the raw value in the cell, and is expected to return an array of strings.
- For all scenarios, the Set Filter displays a list of all the individual, unique values present from the data.
- Selecting values in the Set Filter will show rows where the data for that row contains **any** of the selected values.

<grid-example title='Multiple Values' name='multiple-values' type='generated' options='{ "enterprise": true, "modules": ["clientside", "setfilter", "menu", "columnpanel", "filterpanel"] }'></grid-example>

## Default State

By default, when the Set Filter is created all values are selected. If you would prefer to invert this behaviour and have everything de-selected by default, you can use the following:

<snippet>
const gridOptions = {
    columnDefs: [
        {
            field: 'country',
            filter: 'agSetColumnFilter',
            filterParams: {
                defaultToNothingSelected: true,
            }
        }
    ],
}
</snippet>

In this case, no filtering will occur until at least one value is selected.

The following example demonstrates different default states. Note the following:

- The Athlete column has everything selected when the Set Filter is first opened, which is the default
- The Country column has nothing selected by default, as `defaultToNothingSelected = true`.
- When the Set Filter for the Country column is opened, the grid is not filtered until at least one value has been selected.

<grid-example title='Default State' name='default-state' type='generated' options='{ "enterprise": true, "modules": ["clientside", "setfilter", "menu", "columnpanel", "filterpanel"] }'></grid-example>

## Filter Value Tooltips

Set filter values that are too long to be displayed are truncated by default with ellipses. To allow users to see the full filter value, tooltips can be enabled as shown below:

<snippet>
const gridOptions = {
    columnDefs: [
        {
            field: 'country',
            filter: 'agSetColumnFilter',
            filterParams: {
                showTooltips: true,
            }
        }
    ],
}
</snippet>

The default tooltip component will be used unless a [Custom Tooltip Component](/component-tooltip/) is provided.

The following example demonstrates tooltips in the Set Filter. Note the following:

- Filter values are automatically truncated with ellipses when the values are too long.
- **Col A** does not have Set Filter Tooltips enabled.
- **Col B** has Set Filter Tooltips enabled via `filterParams.showTooltips=true`.
- **Col C** has Set Filter Tooltips enabled and is supplied a Custom Tooltip Component.

<grid-example title='Filter Value Tooltips' name='filter-value-tooltips' type='generated' options='{ "enterprise": true, "exampleHeight": 500, "modules": ["clientside", "setfilter", "menu", "columnpanel", "filterpanel"] }'></grid-example>

## Tree Structure

The Filter List supports displaying the values grouped in a tree structure. This is enabled by setting `filterParams.treeList = true`. There are four different ways the tree structure can be created:
- The column values are of type `Date`, in which case the tree will be year -> month -> day.
- Tree Data mode is enabled and the column is a group column. The Filter List will match the tree structure. A Key Creator must be supplied to convert the array of keys.
- Grouping is enabled and the column is the group column. The Filter List will match the group structure. A Key Creator must be supplied to convert the array of keys.
- A `filterParams.treeListPathGetter` is provided to get a custom tree path for the column values.
- When searching in the Mini Filter, all children will be included when a parent matches the search value. A parent will be included if it has any children that match the search value, or it matches itself.

The values can be formatted in the Filter List via `filterParams.treeListFormatter`. This allows a different format to be used for each level of the tree (compared to the Value Formatter which is applied equally to every value).

<snippet>
const gridOptions = {
    columnDefs: [
        {
            field: 'date',
            filter: 'agSetColumnFilter',
            filterParams: {
                treeList: true,
            }
        }
    ],
    autoGroupColumnDef: {
        field: 'athlete',
        filter: 'agSetColumnFilter',
        filterParams: {
            treeList: true,
            keyCreator: params => params.value.join('#')
        },
    },
}
</snippet>

The following example demonstrates tree structures in the Set Filter. Note the following:

1. The **Group**, **Date** and **Gold** columns all have `filterParams.treeList = true`
2. The **Group** column Filter List matches the format of the Row Grouping. A Key Creator is specified to convert the path into a string.
3. The **Date** column is grouped by year -> month -> date. `filterParams.treeListFormatter` is provided which formats the numerical month value to display as the name of the month.
4. The **Gold** column has `filterParams.treeListPathGetter` provided which groups the values into a tree of >2 and <=2.

<grid-example title='Tree Structure Filter List' name='tree-structure-filter-list' type='generated' options='{ "enterprise": true, "modules": ["clientside", "setfilter", "menu", "columnpanel", "filterpanel"] }'></grid-example>

## Next Up

Continue to the next section: [Data Updates](/filter-set-data-updates/).

