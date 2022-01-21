---
title: "RTL - Right To Left"
---

RTL is used for displaying languages that go from Right to Left, eg Hebrew and Arabic. To get AG Grid to display in RTL format, set the property `enableRtl=true`.

## Simple Example

Below shows a simple example of a grid using RTL. To make it look better we should really be using an RTL language, however none of us in AG Grid knows any RTL languages, so we are sticking with English.

<grid-example title='RTL Simple' name='rtl-simple' type='generated'></grid-example>

## Complex Example

Below shows a more complex example. It's the same example as used on the AG Grid main demo page. To demonstrate all the edge cases of RTL, the tool panel and pinned areas are shown. This example is using AG Grid Enterprise - hence the tool panel and context menu's are active.

<grid-example title='RTL Complex' name='rtl-complex' type='typescript' options='{ "enterprise": true, "modules": ["clientside", "menu", "columnpanel", "filterpanel", "setfilter", "csv", "excel", "charts", "clipboard", "range", "rowgrouping", "multifilter", "sidebar", "statusbar"] }'></grid-example>

## How it Works

If you are creating your own theme, knowing how the RTL is implemented will be useful.

### CSS Styling

The following CSS classes are added to the grid when RTL is on and off:

- **ag-rtl**: Added when RTL is ON. It sets the style `'direction=rtl'`.
- **ag-ltr**: Added when RTL is OFF. It sets the style `'direction=ltr'`.

You can see these classes by inspecting the DOM of AG Grid. A lot of the layout of the grid is reversed with this simple CSS class change.

Themes then also use these styles for adding different values based on whether RTL is used or NOT. For example, the following is used inside the provided themes:

```css
// selection checkbox gets 4px padding to the RIGHT when LTR
.ag-ltr .ag-selection-checkbox {
    padding-right 4px;
}

// selection checkbox gets 4px padding to the LEFT when RTL
.ag-rtl .ag-selection-checkbox {
    padding-left 4px;
}
```

## Pinning and Scroll Bars

Under normal operation, when columns are pinned to the right, the vertical scroll will appear alongside the right pinned panel. For RTL the scroll will appear on the left pinned panel when left pinning columns.

##  Layout of Columns 

The grid normally lays the columns out from left to right. When doing RTL the columns go from the right to the left. If the grid was using normal HTML layout, then the columns would all reverse by themselves, however the grid used Column Visualisation, so it needs to know exactly where each column is. Hence there is a lot of math logic inside AG Grid that is tied with the scrolling. Not only is the scrolling inverted, all the maths logic is inverted also. All of this is taken care of for you inside AG Grid. Once `enableRtl=true` is set, the grid will know to use the RTL varient of all the calculations.

