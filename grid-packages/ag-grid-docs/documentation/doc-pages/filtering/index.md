---
title: "Column Filters"
---

[[only-javascript-or-angular-or-vue]]
|Column Filters are filters that are applied to the data at the column level. Many Column Filters can be active at once (e.g. filters set on different columns) and the grid will display rows that pass every column's filter.

[[only-react]]
|<video-section id="pebXUHUdlos" title="React Column Filters" header="true">
|Column Filters are filters that are applied to the data at the column level. Many Column Filters can be active at once (e.g. filters set on different columns) and the grid will display rows that pass every column's filter.
|</video-section>

Column Filters are accessed in the grid UI either through the [Column Menu](/column-menu/) or the [Tool Panel](/tool-panel/).

<div style="display: flex; justify-content: center;">
    <image-caption src="filtering/resources/open-column.gif" alt="Open Column" width="25rem" constrained="true">
        Access via Column Menu
    </image-caption>
    <image-caption src="filtering/resources/open-tool-panel.gif" alt="Open Tool Panel" width="25rem" constrained="true">
        Access via Tool Panel
    </image-caption>
</div>

## Column Filter Types

You can use the Provided Filters that come with the grid, or you can build your own [Filter Components](/component-filter/) if you want to customise the filter experience to your application.

There are four main Provided Filters, plus the Multi Filter. These are as follows:
- [Text Filter](/filter-text/) - A filter for string comparisons.
- [Number Filter](/filter-number/) - A filter for number comparisons.
- [Date Filter](/filter-date/) - A filter for date comparisons.
- [Set Filter](/filter-set/) <enterprise-icon></enterprise-icon> - A filter influenced by how filters work in Microsoft Excel. This is an AG Grid Enterprise feature.
- [Multi Filter](/filter-multi/) <enterprise-icon></enterprise-icon>- Allows for two filters to be used together (either one of the above Provided Filters or a Custom Filter Component). This is an AG Grid Enterprise feature.

## Example: Provided Filters

The example below demonstrates the four Provided Filters and the Multi Filter:

- Column **Athlete** has a Text Filter.
- Column **Age** has a Number Filter.
- Column **Date** has a Date Filter.
- Column **Country** has a Set Filter.
- Column **Sport** has a Multi Filter (consisting of a Text Filter and a Set Filter).

<grid-example title='Provided Filters' name='provided-filters' type='generated' options='{ "enterprise": true, "exampleHeight": 560, "modules": ["clientside", "setfilter", "multifilter"] }'></grid-example>

## Relation to Quick Filter and External Filter

Column Filters work independently of [Quick Filter](/filter-quick/) and [External Filter](/filter-external/). If a quick filter and / or external filter are applied along with a Column Filter, each filter type is considered and the row will only show if it passes all three types.

Column Filters are tied to a specific column. Quick Filter and external filter are not tied to any particular column. This section of the documentation talks about Column Filters only. For Quick Filter and external filter, click the links above to learn more.

## Next Up

Continue to the next section to learn about [Text Filters](/filter-text).
