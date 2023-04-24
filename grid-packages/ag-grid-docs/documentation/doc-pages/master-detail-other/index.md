---
title: "Master / Detail - Other"
enterprise: true
---

Here we discuss areas of Master / Detail that didn't quite fit with the other sections within the documentation.

## Syncing Detail Scrolling with Master

By default, the Detail Grid takes up the width of the Master Grid and does not move when the Master Grid's columns are horizontally scrolled. This is because the Detail Grid is not sitting with the other Master Grid's cells, rather it is in a separate container that overlays the Master Grid's cells and takes up the full width of the grid ignoring all the Master Grid's columns.

The underlying feature of the grid that allows the Detail Grid to span the width of the Master Grid is called [Full Width Row](/full-width-rows/).

It is possible to have the Detail Grid sit within the same container as the Master Grid's cells and hence move with the Master Grid's horizontal scrolling. This is achieved by 'Embedding the Full Width Row' and is set via the grid property `embedFullWidthRows=true` for the Master Grid. This tells the grid to layout (embed) the Detail Panel with the other rows.

In the example below, notice that horizontal scrolling is combined for both Master Grid and Detail Grid using the Embed Full Width Rows feature.

<grid-example title='Detail scrolls with Master' name='detail-scrolls-with-master' type='generated' options='{ "enterprise": true, "exampleHeight": 525, "modules": ["clientside", "masterdetail", "menu", "columnpanel"] }'></grid-example>

If you are mixing Embed Full Width Rows and [Custom Detail](/master-detail-custom-detail/), then be aware the Detail Panel will get rendered three times as follows:

- Pinned Left Columns
- Pinned Right Columns
- Pinned Centre Columns

This is because the Columns, and thus the Detail Panel, are appearing in three separate scrollable sections. The example below demonstrates this. Note the custom Detail Panel appears in all three sections.

<grid-example title='Embed Custom Detail' name='embed-custom-detail' type='generated' options='{ "enterprise": true, "modules": ["clientside",  "masterdetail"] }'></grid-example>

If you want your custom Detail Panel to only show content in one section, have logic that inspects the components `params.pinned` property and renders content relevant for the section.

## Filtering and Sorting

There are no specific configurations for filtering and sorting with Master / Detail but as there are multiple grids each grid will filter and sort independently.

Below shows a simple Master / Detail setup which has filtering and sorting enabled in both master and detail grids.

<grid-example title='Filtering with Sort' name='filtering-with-sort' type='generated' options='{ "enterprise": true, "exampleHeight": 550, "modules": ["clientside", "masterdetail", "menu", "setfilter", "columnpanel", "filterpanel"] }'></grid-example>

## Supported Modes

The Master / Detail feature organises the grid in a way which overlaps with other features. For this reason, Master / Detail does not work with certain grid configurations. These configurations are as follows:

### Tree Data

Master / Detail is not supported with [Tree Data](/tree-data/). This is because the concept of tree data conflicts with Master / Detail, in that in tree data, any row can expand to show child rows, which would result in a clash when a row has child rows in addition to having Master / Detail at the same row.

### Layouts

It is not possible to mix [DOM layout](/grid-size/#dom-layout) for master detail. This is because the layout is a CSS setting that would be inherited by all grids contained with the master grid. So if your master grid was 'for-print', then all child grids would pick up the 'for-print' layout.

When using Master / Detail and [for-print](/printing/), then all detail grids need to use for-print.

When using Master / Detail and [auto-height](/grid-size/#auto-height), then all detail grids need to use auto-height.

### Range Selection

When [Range Selection](/range-selection/) is enabled on the Master Grid, the Detail Grid will not participate in the Range Selection of the Master Grid.

