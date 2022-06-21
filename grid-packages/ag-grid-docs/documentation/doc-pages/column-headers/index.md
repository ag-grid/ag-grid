---
title: "Column Headers"
---

Each column has a header at the top that typically displays the column name and has access to column features, such as sorting, filtering and a column menu. This page explains how you can manage the headers.

## Header Height

These properties can be used to change the different heights used in the headers.

<api-documentation source="grid-options/properties.json" section="headers"></api-documentation>

All these properties also have setter methods that can be called from the API and will change the header heights dynamically.

<api-documentation source="grid-api/api.json" section="headers"></api-documentation>

## Text Orientation

By default, the text label for the header is display horizontally, i.e. as normal readable text. To display the text in another orientation you have to provide your own CSS to change the orientation and also provide the adequate header heights using the appropriate grid property.

### Example: Header Height and Text Orientation

The following example shows how you can provide a unique look and feel to the headers. Note that:

- The header heights have all been changed via grid options:

<snippet spaceBetweenProperties="true">
    const gridOptions = {
        // Group columns
        groupHeaderHeight: 75,
        // Label columns
        headerHeight: 150,
        // Floating filter
        floatingFiltersHeight: 50,
        // Pivoting, requires turning on pivot mode. Label columns
        pivotHeaderHeight: 100,
        // Pivoting, requires turning on pivot mode. Group columns
        pivotGroupHeaderHeight: 50,
    }
</snippet>

- The grouped column header `Athlete Details` has a specific style applied to it to make it bigger. Note that the style is slightly different depending if pivoting or not:

```css
.ag-pivot-off .ag-header-group-cell {
    font-size: 50px;
    color: red;
}

.ag-pivot-on .ag-header-group-cell {
    font-size: 25px;
    color: green;
}
```

- The column labels have CSS applied to them so they are displayed vertically.

```css
.ag-cell-label-container {
    /* Necessary to allow for text to grow vertically */
    height: 100%;
}

.ag-header-cell-label {
    /* Necessary to allow for text to grow vertically */
    height: 100%;
    padding: 0 !important;
}

.ag-header-cell-label .ag-header-cell-text {
    /* Force the width corresponding at how much width
    we need once the text is laid out vertically */
    width: 30px;
    transform: rotate(90deg);
    margin-top: 50px;
    /* Since we are rotating a span */
    display: inline-block;
}
```

- The floating filters are using a much bigger area and the font used is bigger and bolder.

```css
.ag-floating-filter-body input {
    height: 49px;
}

.ag-floating-filter-button {
    margin-top: -49px;
}

.ag-floating-filter-button button {
    height: 49px
}

.ag-floating-filter-body input {
    font-size: 15px;
    font-weight: bold;
}
```

- The styling of the column labels have also been tweaked depending if pivoting or not.

```css
.ag-pivot-off .ag-header-cell-label {
    color: #8a6d3b;
}

.ag-pivot-on .ag-header-cell-label {
    color: #1b6d85;
    font-weight: bold;
}
```

<grid-example title='Header Height and Text Orientation' name='text-orientation' type='generated' options='{ "enterprise": true, "modules": ["clientside", "rowgrouping"]}'></grid-example>

## Dynamic Header Heights

As you can see in the example below, if you change any of the header heights, this change will be reflected automatically. Note how if the value is cleared (set to `undefined`), it might reuse other values. To see all the interactions check the properties descriptions at the top of the page.

<grid-example title='Dynamic Header Height' name='dynamic-height' type='generated' options='{ "enterprise": true, "modules": ["clientside", "rowgrouping"] }'></grid-example>

## Auto Header Height

The column header row can have it's height set automatically based on the content of the header cells, this is most useful when used in conjunction with [Custom Header Components](/component-header/) or when using the `wrapHeaderText` column property.

To enable this, set `autoHeaderHeight=true` on the column definition you want to adjust the header height for. If more than one column has this property enabled, then the header row will be sized to the maximum of these
column's header cells so no content overflows.

The example below demonstrates using the `autoHeaderHeight` property in conjunction with the `wrapHeaderText` property, so that long column names are fully displayed.

- Note that the long column header names wrap onto another line
- Try making a column smaller by dragging the resize handle on the column header, observe that the header will expand so the full header content is still visible.

<grid-example title='Auto Header Height' name='auto-height' type='generated' options='{ "enterprise": true, "modules": ["clientside", "rowgrouping"] }'></grid-example>

## Header Tooltips

You can provide a tooltip to the header using `colDef.headerTooltip`.

The example below shows header tooltips. Note the following:

- All the columns, apart from (**Country** and **Year**), have a header tooltip set.
- We have set the Grid `tooltipShowDelay` property to 500ms to make the tooltips appear quicker.

<grid-example title='Header Tooltip' name='header-tooltip' type='generated'></grid-example>

## Header Templates

You can provide a header template used by the default header component for simple layout changes. If you want to change the behaviour, please look at creating your own [Custom Header Component](/component-header/). The template for the default header is specified in `columnDef.headerComponentParams.template`.

This is the default template used in AG Grid:

```html
<div class="ag-cell-label-container" role="presentation">
    <span ref="eMenu" class="ag-header-icon ag-header-cell-menu-button" aria-hidden="true"></span>
    <div ref="eLabel" class="ag-header-cell-label" role="presentation">
        <span ref="eText" class="ag-header-cell-text"></span>
        <span ref="eFilter" class="ag-header-icon ag-header-label-icon ag-filter-icon" aria-hidden="true"></span>
        <span ref="eSortOrder" class="ag-header-icon ag-header-label-icon ag-sort-order" aria-hidden="true"></span>
        <span ref="eSortAsc" class="ag-header-icon ag-header-label-icon ag-sort-ascending-icon" aria-hidden="true"></span>
        <span ref="eSortDesc" class="ag-header-icon ag-header-label-icon ag-sort-descending-icon" aria-hidden="true"></span>
        <span ref="eSortNone" class="ag-header-icon ag-header-label-icon ag-sort-none-icon" aria-hidden="true"></span>
    </div>
</div>
```

When you provide your own template, everything should work as expected as long as you re-use the same `refs`.

| Ref | Description |
|-|-|
| `eMenu` | The container where the column menu icon will appear to enable opening the column menu. |
| `eLabel` | The container where there is going to be an onClick mouse listener to trigger the sort. |
| `eText` | The text displayed on the column. |
| `eFilter` | The container with the icon that will appear if the user filters this column. |
| `eSortOrder` | In case of sorting my multiple columns, this shows the index that represents the position of this column in the order. |
| `eSortAsc` | In case of sorting ascending the data in the column, this shows the associated icon. |
| `eSortDesc` | In case of sorting descending the data in the column, this shows the descending icon. |
| `eSortNone` | In case of no sort being applied, this shows the associated icon. Note this icon by default is empty. |

The ref parameters are used by the grid to identify elements to add functionality to. If you leave an element out of your template, the functionality will not be added. For example if you do not specify `eLabel` then the column will not react to click events for sorting.

[[note]]
| Templates are not meant to let you configure icons. If you are looking to change the icons, check our [icon docs](/custom-icons/).

### Example: Simple Header Templates

In the following example you can see how we are reusing the default grid template to change the layout of the elements.

<snippet>
const gridOptions = {
    defaultColDef: {
        width: 100,
        headerComponentParams: {
            template:
                '&lt;div class="ag-cell-label-container" role="presentation"&gt;' +
                '  &lt;span ref="eMenu" class="ag-header-icon ag-header-cell-menu-button"&gt;&lt;/span&gt;' +
                '  &lt;div ref="eLabel" class="ag-header-cell-label" role="presentation"&gt;' +
                '    &lt;span ref="eSortOrder" class="ag-header-icon ag-sort-order"&gt;&lt;/span&gt;' +
                '    &lt;span ref="eSortAsc" class="ag-header-icon ag-sort-ascending-icon"&gt;&lt;/span&gt;' +
                '    &lt;span ref="eSortDesc" class="ag-header-icon ag-sort-descending-icon"&gt;&lt;/span&gt;' +
                '    &lt;span ref="eSortNone" class="ag-header-icon ag-sort-none-icon"&gt;&lt;/span&gt;' +
                '    ** &lt;span ref="eText" class="ag-header-cell-text" role="columnheader"&gt;&lt;/span&gt;' +
                '    &lt;span ref="eFilter" class="ag-header-icon ag-filter-icon"&gt;&lt;/span&gt;' +
                '  &lt;/div&gt;' +
                '&lt;/div&gt;'
        }
    }
}
</snippet>

Note that specifying your own templates is compatible with other configurations:

- `suppressMenu` is specified in: **Athlete**, **Country**, **Date** and **Bronze** columns
- `sortable=false` is specified in: **Age**, **Year**, **Sport**, **Silver** and **Total** columns
- **Gold** is the only column that doesn't have `sortable=false` or `suppressMenu`

<grid-example title='Header template' name='header-template' type='typescript' options='{ "extras": ["fontawesome"] }'></grid-example>

## Custom Header

Header templates are meant to be used for simple UI customisation, if you need to have more control over the header check how to create your own [Header Components](/component-header/).