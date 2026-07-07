This file documents suggested replacements for selectors that worked before v36.

If your app contains CSS rules os `querySelector` calls targeting the old selectors, you will need verify that they still work as expected.

Note to agents: unless the app is configured with comprehensive visual regression tests, these will require human verification. Include a human verification step in the plan. If possible assist this step by determining which features and parts of the application are most likely to be affected and suggesting a review of these areas.

**1. Classes with available replacements**

If you are styling one of the classes on the left below in CSS, update it to the class on the right and test that the visual effect is the same.

- ag-floating-top-container / ag-floating-top-viewport -> `.ag-grid-pinned-top-rows-container`
- ag-floating-bottom-container / ag-floating-bottom-viewport -> `.ag-grid-pinned-bottom-rows-container`
- ag-sticky-top -> `.ag-grid-sticky-top-rows-container`
- ag-sticky-bottom -> `.ag-grid-sticky-bottom-rows-container`
- ag-center-cols-spanned-cells-container -> `.ag-grid-scrolling-spanned-cells-container`
- ag-floating-top-spanned-cells-container -> `.ag-grid-pinned-top-rows-spanned-cells-container`
- ag-floating-bottom-spanned-cells-container -> `.ag-grid-pinned-bottom-rows-spanned-cells-container`
- ag-floating-top -> `.ag-grid-pinned-top-rows`
- ag-floating-bottom -> `.ag-grid-pinned-bottom-rows`

**2. Classes with alternate selectors**

These elements have no direct replacement, but if using them to select components you can replace them with a descendent selector combining two class names. For example `.ag-pinned-left-sticky-top .ag-icon { ... }` could be replaced with `.ag-grid-sticky-top-rows-container .ag-grid-pinned-left-cells .ag-icon { ... }`

- ag-pinned-left-header -> `.ag-header .ag-grid-pinned-left-cells`
- ag-pinned-right-header -> `.ag-header .ag-grid-pinned-right-cells`
- ag-pinned-left-sticky-top -> `.ag-grid-sticky-top-rows-container .ag-grid-pinned-left-cells`
- ag-pinned-right-sticky-top -> `.ag-grid-sticky-top-rows-container .ag-grid-pinned-right-cells`
- ag-pinned-left-sticky-bottom -> `.ag-grid-sticky-bottom-rows-container .ag-grid-pinned-left-cells`
- ag-pinned-right-sticky-bottom -> `.ag-grid-sticky-bottom-rows-container .ag-grid-pinned-right-cells`
- ag-full-width-container -> `.ag-full-width-row`
- ag-header-container, ag-header-viewport -> `.ag-header`
- ag-pinned-left-cols-container -> `.ag-grid-scrolling-rows .ag-grid-pinned-left-cells`
- ag-pinned-right-cols-container -> `.ag-grid-scrolling-rows .ag-grid-pinned-right-cells`
- ag-center-cols-container, ag-center-cols-viewport -> `.ag-grid-scrolling-cells`
- ag-body-viewport, ag-body -> `.ag-grid-scrolling-container`
- ag-pinned-left-floating-top -> `.ag-grid-pinned-top-rows-container .ag-grid-pinned-left-cells`
- ag-pinned-right-floating-top -> `.ag-grid-pinned-top-rows-container .ag-grid-pinned-right-cells`
- ag-pinned-left-floating-bottom -> `.ag-grid-pinned-bottom-rows-container .ag-grid-pinned-left-cells`
- ag-pinned-right-floating-bottom -> `.ag-grid-pinned-bottom-rows-container .ag-grid-pinned-right-cells`

**3. Elements removed**

In the old DOM layout, non-scrollable containers had spacing elements below to align better with scrollable regions. These are no longer required as there is one large scrollable region. If you are using these it is likely that they are no longer required under the new layout:

- ag-scroller-corner
- ag-horizontal-left-spacer
- ag-horizontal-right-spacer
