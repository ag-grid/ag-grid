---
targets: ['*']
description: 'Browser testing tips for documentation review'
---

# Documentation Review - Browser Testing

Tips for browser-testing AG Grid documentation pages via chrome automation.

## Page Navigation

-   AG Grid example grids are rendered inside iframes. Scrolling while the cursor is over a grid example scrolls the grid's rows, not the page itself.
-   To navigate down the page, scroll outside the grid area (e.g., over prose text or margins), or use keyboard navigation (`End`, `Home`, `Page Down`/`Page Up`).
-   Use anchor links (`#section-name`) in the URL to jump directly to specific sections rather than scrolling through the entire page.

## Example Testing

-   Each example has interactive controls (buttons, dropdowns) rendered above the grid iframe. Click them to verify the documented behaviour.
-   After clicking an interactive control, take a screenshot to capture the result state.
-   Check the browser console for errors after testing examples — expected messages like AG Grid Enterprise license warnings can be ignored.

## URL Pattern

-   Dev server docs pages require a framework prefix: `https://localhost:4610/javascript-data-grid/${pageName}/`
-   The framework prefix can be changed to test other frameworks: `react-data-grid`, `angular-data-grid`, `vue-data-grid`.

## Direct URL Testing (Sub-agent Mode)

When the product configuration includes an **Example Direct URL Pattern**, example browser testing is delegated to a `docs-example-browser-tester` sub-agent that opens each example at its standalone URL.

Direct URL characteristics:

-   Examples render full-viewport with no docs page chrome, no iframe wrapper.
-   Interactive controls (buttons, dropdowns) from the example's `index.html` are directly accessible without scrolling past documentation content.
-   Console messages come from the example only, not the surrounding docs page.
-   Screenshots capture the complete example without docs page chrome.

The main agent retains responsibility for page-level visual/interaction testing (Step 6) which requires the full docs page context (theme switchers, framework selectors, cross-references, keyboard navigation).
