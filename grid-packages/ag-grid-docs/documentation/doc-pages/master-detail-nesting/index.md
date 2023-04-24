---
title: "Master / Detail - Nesting"
enterprise: true
---

It is possible to nest Master / Detail grids. There is no special configuration required to do this, you just configure another Detail Grid to also act as a Master Grid.

The following snippet illustrates how to achieve nesting by configuring Detail Grids to also act as Master Grids.

```js
// Level 3 (bottom level), Detail Grid only, no Master / Detail configuration
const gridOptionsLevel3 = {
    ...
}

// Level 2, configured to be a Master Grid and use Level 3 grid as Detail Grid,
const gridOptionsLevel2 = {
    masterDetail: true,
    detailCellRendererParams: {
        detailGridOptions: gridOptionsLevel3,
        getDetailRowData: function (params) {
            ...
        }
    }
    ...
}

// Level 1, configured to be a Master Grid and use Level 2 grid as Detail Grid,
const gridOptionsLevel1 = {
    masterDetail: true,
    detailCellRendererParams: {
        detailGridOptions: gridOptionsLevel2,
        getDetailRowData: function (params) {
            ...
        }
    }
    ...
}
```

Below shows a simple Master Detail setup with two levels of Master Detail. The example is kept short (few rows and columns) so as to focus on the nesting.

## Example

<grid-example title='Nesting Master / Detail' name='nesting' type='generated' options='{ "enterprise": true, "exampleHeight": 425, "modules": ["clientside", "masterdetail", "menu", "columnpanel"] }'></grid-example>

## Example: Auto Height

The next example is identical to the previous except all the Detail Grid's have property `detailRowAutoHeight=true`. Notice that this removes all vertical scrolls from all the Detail Grids, leaving just the main Master Grid with a vertical scroll.

<grid-example title='Nesting Auto-Height' name='nesting-autoheight' type='generated' options='{ "enterprise": true, "exampleHeight": 425, "modules":["clientside", "masterdetail", "menu", "columnpanel"] }'></grid-example>

