---
title: "Customising Colours & Fonts"
---

CHange the overall colour scheme and appearance of data.

- `--ag-foreground-color` and `--ag-background-color` set the text colour and background colour for the grid - there are more colour variables available for more fine-grained control over the colour scheme.



## Theme Colour Variables

The [Provided Themes](/themes/) define additional variables for key theme colours. The Sass API uses these in colour blending, but due to the limitations described above you need to set a few additional variables yourself if using pure CSS.

- Alpine defines `--ag-alpine-active-color` which sets the colour of checked checkboxes, range selections, row hover, row selections, selected tab underlines, and input focus outlines. To reproduce the Sass colour blends, set the following variables:
    - Set `--ag-selected-row-background-color` to a **10%** opaque version of `--ag-alpine-active-color`
    - Set `--ag-range-selection-background-color` to a **20%** opaque version of `--ag-alpine-active-color`
    - Set `--ag-row-hover-color` to a **10%** opaque version of `--ag-alpine-active-color`
    - Set `--ag-column-hover-color` to a **10%** opaque version of `--ag-alpine-active-color`
    - Set `--ag-input-focus-border-color` to a **40%** opaque version of `--ag-alpine-active-color`

- Balham defines `--ag-balham-active-color` which sets the colour of checked checkboxes, range selections, row selections, and input focus outlines. To reproduce the Sass colour blends, set the following variables:
    - Set `--ag-selected-row-background-color` to a **10%** opaque version of `--ag-alpine-active-color`
    - Set `--ag-range-selection-background-color` to a **20%** opaque version of `--ag-alpine-active-color`

- Material defines `--ag-material-primary-color` and `--ag-material-accent-color` which set the colours used for the primary and accent colour roles specified in the [Material Design colour system](https://material.io/design/color/). Currently primary colour is used for buttons, range selections, selected tab underlines and input focus underlines, and accent colour is used for checked checkboxes. No colour blending is required.

[[note]]
| **Generating semi-transparent colours**
|
| To make a semi-transparent version of a colour, you can use one of these techniques. If your colour is defined as a 6-digit hex value (`#RRGGBB`) convert it to an 8-digit hex value (`#RRGGBBAA`). If your colour is defined as a rgb value (`rgb(R, G, B)`) convert it to rgba (`rgba(R, G, B, A)`).
|
| So for example, the color `deeppink` is hex `#FF1493` or rgb `rgb(255, 20, 147)`.
|
| - 10% opaque: `#8800EE1A` or `rgb(255, 20, 147, 0.1)`
| - 20% opaque: `#8800EE33` or `rgb(255, 20, 147, 0.2)`
| - 30% opaque: `#8800EE4D` or `rgb(255, 20, 147, 0.3)`
| - 40% opaque: `#8800EE66` or `rgb(255, 20, 147, 0.4)`
| - 50% opaque: `#8800EE80` or `rgb(255, 20, 147, 0.5)`
