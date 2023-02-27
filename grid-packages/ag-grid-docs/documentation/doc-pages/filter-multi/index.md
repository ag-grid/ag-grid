---
title: "Multi Filter"
enterprise: true
---

The Multi Filter allows multiple [Provided Filters](/filtering/#column-filter-types) or [Custom Filters](/component-filter/) to be used on the same column. This provides greater flexibility when filtering data in the grid.

<image-caption src="filter-multi/resources/multi-filter.png" alt="Multi Filter" width="34rem" centered="true"></image-caption>

## Enabling the Multi Filter

To use a Multi Filter, specify the following in your Column Definition:

<snippet>
const gridOptions = {
    columnDefs: [
        // column configured to use the Multi Filter
        { field: 'athlete', filter: 'agMultiColumnFilter' },
    ]
}
</snippet>

By default the Multi Filter will show a [Text Filter](/filter-text/) and [Set Filter](/filter-set/), but you can specify which filters you would like to use in the `filters` array. The filters will be displayed in the same order as they are specified.

The example below shows the Multi Filter in action. Note the following:

- The **Athlete** has a Multi Filter with default behaviour.
- The **Country**, **Gold** and **Date** columns have Multi Filters with the child filters configured explicitly, using the [Text](/filter-text/), [Number](/filter-number/) and [Date](/filter-date/) Simple Filters respectively.
- Different `filterParams` can be supplied to each child filter:<br />
    - The Text Filter in the Country column has a different default option (`'startsWith'`)
    - The Date Filter in the Date column has a custom comparator to compare dates correctly
    - The Set Filter in the Date column has a custom comparator, so the values are displayed in ascending order

<grid-example title='Multi Filter' name='multi-filter' type='generated' options='{ "enterprise": true, "exampleHeight": 602, "modules": ["clientside", "multifilter", "setfilter", "menu", "clipboard", "filterpanel"] }'></grid-example>

## Floating Filters

When [Floating Filters](/floating-filters/) are used, the Floating Filter shown is for the child filter in the Multi Filter that was most recently applied and is still active. If no child filters are active, the Floating Filter for the first child filter in the Multi Filter is shown instead.

The example below shows Floating Filters enabled for all columns. Note how the Floating Filters change when you apply different child filters from the Multi Filter.

<grid-example title='Floating Filters' name='floating-filters' type='generated' options='{ "enterprise": true, "exampleHeight": 635, "modules": ["clientside", "multifilter", "setfilter", "menu", "clipboard"] }'></grid-example>

## Display Style

By default, all filters in the Multi Filter are shown inline in the same view, so that the user has easy, immediate access. However, you can change how filters are presented, by either using sub-menus or accordions to wrap each filter. To do this, you can set `display` to the style of how you would like a particular filter to be displayed:

<snippet>
const gridOptions = {
    columnDefs: [
        {
            field: 'athlete',
            filter: 'agMultiColumnFilter',
            filterParams: {
                filters: [
                    {
                        filter: 'agTextColumnFilter',
                        display: 'subMenu',
                    },
                    {
                        filter: 'agSetColumnFilter',
                    }
                ]
            }
        }
    ]
}
</snippet>

The options for `display` are `'inline'`, `'subMenu'` or `'accordion'`.

Please note that sub-menus will be shown as accordions in the Tool Panel.

You can also provide a title that will be used in the menu item or accordion title by using the `title` property.

The following example demonstrates the different display styles.

- The **Athlete** column demonstrates having the first filter inside a sub-menu.
- The sub-menu for the **Athlete** filter is shown as an accordion inside the Tool Panel.
- The **Country** column demonstrates having both filters as accordions.
- A custom title is used for the first filter in the **Country** column.
- The **Sport** column shows the default behaviour, where all filters are inline.

<grid-example title='Display Style' name='display-style' type='generated' options='{ "enterprise": true, "exampleHeight": 629, "modules": ["clientside", "multifilter", "setfilter", "menu", "clipboard", "filterpanel"] }'></grid-example>

## Custom Filters

You can use your own [Custom Filters](/component-filter/) with the Multi Filter.

The example below shows a Custom Filter in use on the **Year** column, used alongside the grid-provided [Number Filter](/filter-number/).

<grid-example title='Custom Filters' name='custom-filter' type='generated' options='{ "enterprise": true, "modules": ["clientside", "multifilter", "setfilter", "menu", "clipboard", "filterpanel"], "exampleHeight": 635 }'></grid-example>

## Multi Filter Model

The model for the Multi Filter wraps the models for all the child filters inside it. It has the `IMultiFilterModel` interface:

<interface-documentation interfaceName='IMultiFilterModel' config='{"overrideBottomMargin":"1rem"}' ></interface-documentation>


The `filterType` will always be set to `'multi'`. The models array is the same length as the number of child filters, containing the models for the child filters in the same order as the filters were specified in the `filterParams`. Each array entry will either be set to `null` if the corresponding child filter is not active, or to the current model for the child filter if it is active.

For example, if the Multi Filter has the default Text Filter and Set Filter, and the Set Filter is active, the Multi Filter model might look something like this:

<snippet>
const gridOptions = {
    columnDefs: [
        {
            filterType: 'multi',
            filterModels: [
                null,
                { filterType: 'set', values: ['A', 'B', 'C'] }
            ]
        }
    ]
}
</snippet>

The example below allows you to see the Multi Filter Model in use. You can print the current filter state to the console and save/restore it using the buttons at the top of the grid

<grid-example title='Multi Filter Model' name='multi-filter-model' type='generated' options='{ "enterprise": true, "exampleHeight": 639, "modules": ["clientside", "multifilter", "setfilter", "menu", "clipboard"] }'></grid-example>

## Accessing Child Filters

The Multi Filter acts as a wrapper around a list of child filters inside it. The order of the filters is the same order as they are specified in the `filters` array in the `filterParams`. If you want to interact with the individual child filters, you can retrieve a particular child filter instance from the Multi Filter by calling `getChildFilterInstance(index)`,  where `index` is the same as the index in the `filters` array. You can then call any API methods that are available on that particular child filter instance.

The example below shows how you can access child filter instances and call methods on them:

- Clicking the **Print Text Filter model** button will access the Text Filter inside the Multi Filter and print the current model to the console.
- Clicking the **Print Set Filter search text** button will access the Set Filter inside the Multi Filter and print the current search text to the console.

<grid-example title='Accessing Child Filters' name='accessing-child-filters' type='generated' options='{ "enterprise": true, "exampleHeight": 624, "modules": ["clientside", "multifilter", "setfilter", "menu", "clipboard"] }'></grid-example>

## Multi Filter Parameters

<interface-documentation interfaceName='IMultiFilterParams' overrideSrc='filter-multi/resources/multi-filter.json'></interface-documentation>

### IMultiFilterDef

<interface-documentation interfaceName='IMultiFilterDef' overrideSrc='filter-multi/resources/multi-filter.json' ></interface-documentation>

## Multi Filter API

<interface-documentation interfaceName='IMultiFilterComp' overrideSrc='filter-multi/resources/multi-filter.json' ></interface-documentation>

## Next Up

Continue to the next section to learn about [Filter Conditions](/filter-conditions/).