---
title: "Filtering"
---

The grid can display a subset of the provided rows using filtering.

This section outlines the different types of filtering that can be performed in the grid.

## Column Filters

Column Filters appear in the [Column Menu](/column-menu/) and / or in the [Filters Tool Panel](/tool-panel-filters/), and filter data at the column level.

<image-caption src="filtering-overview/resources/column-filters.png" alt="Text Filter" width="50rem" centered="true"></image-caption>

Many Column Filters can be active at once (e.g. filters set on different columns), and the grid will display rows that pass every column's filter. The grid provides the UI and determines which rows pass the filters (unless using the [Server-Side Row Model](/server-side-model/) where the filtering logic is applied on the server).

See the [Column Filters](/filtering/) section for more details.

## Quick Filter

Quick Filter is a piece of text given to the grid that is used to filter rows using data in all columns.

<image-caption src="filtering-overview/resources/quick-filter.png" alt="Text Filter" width="50rem" centered="true"></image-caption>

The grid does not provide any UI for the Quick Filter (typically the user will type the text in somewhere in the application that contains the grid). The grid will determine which rows pass the filter based on the text provided.

See the [Quick Filter](/filter-quick/) section for more details.

[[note]]
| The Quick Filter is only compatible with the Client-Side Row Model, see [Row Models](/row-models/) for more details.

## External Filter

An external filter is a mechanism for the application to filter out rows independently of any filtering done by the grid.

<image-caption src="filtering-overview/resources/external-filter.png" alt="Text Filter" width="50rem" centered="true"></image-caption>

The grid does not provide any UI for external filtering, and the application determines which rows pass the filter.

See the [External Filter](/filter-external/) section for more details.

[[note]]
| External filtering is only compatible with the Client-Side Row Model, see [Row Models](/row-models/) for more details.

