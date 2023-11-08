/**
 * These styles are injected at runtime if the example is running on the
 * website. Use them for making website-specific tweaks that we don't want to
 * show to users who view the code or run the example on CodeSandbox.
 */
export default /* css */ `

.ag-theme-alpine-dark {

    padding-top: 8px;

    .ag-root-wrapper {
        border-radius: 8px;
      }

     .ag-menu, .ag-menu-header {
        background-color: #151F28;
    }
      
    --ag-border-radius: 8px;
    --ag-background-color: #0A161F;
    --ag-odd-row-background-color: #151F28;
    --ag-foreground-color: #e6f1fc; 
    --ag-header-background-color: #151F28;
    --ag-header-foreground-color: #fff;
    --ag-border-color: color-mix(in srgb, var(--ag-background-color), var(--ag-foreground-color) 12%);
    --ag-header-column-resize-handle-color: color-mix(in srgb, var(--ag-background-color), var(--ag-foreground-color) 15%);
    --ag-control-panel-background-color: #151F28;
    --ag-subheader-background-color: #151F28;

    /* charts */
    --ag-group-title-bar: #151F28;

    .ag-chart-menu-panel {
        background: #151F28;
    }
}

.ag-theme-alpine-dark .ag-root-wrapper {
    border-radius: 8px;
}

.ag-theme-alpine-dark .ag-menu,
.ag-theme-alpine-dark .ag-menu-header {
    background-color: #151F28;
}

.ag-theme-alpine-dark .ag-header-cell {
    font-size: 14px;
}

body {
    padding: 0;
}

/* This should be refactored and fixed at the place where .test-header is defined */
.test-header {
    margin-bottom: 0 !important;
}

html[data-color-scheme='dark'] body > * {
    color-scheme: dark;
}

html[data-color-scheme='dark'] div + #myGrid {
    margin-top: -8px;
}

html[data-color-scheme='dark'] button:not(#myGrid button, #myChart button, button[class*='ag-']) {
    appearance: none;
    background-color: #202A34;
    border: 1px solid rgb(255,255,255,0.1);
    border-radius: 4px;
    height: 36px;
    color: #fff;
    cursor: pointer;
    display: inline-block;
    font-size: 14px;
    font-weight: 500;
    letter-spacing: .025em;
    padding: 0.375em 1em 0.5em;
    white-space: nowrap;
    margin-right: 6px;
    margin-bottom: 8px;
    transition: background-color .25s ease-in-out;
}

html[data-color-scheme='dark'] button:not(#myGrid button, #myChart button, button[class*='ag-']):hover {
    background-color: #2a343e;
}

html[data-color-scheme='dark'] select:not(#myGrid select, #myChart select, select[class*='ag-']) {
    appearance: none;
    background-color: #202A34;
    border: 1px solid rgb(255,255,255,0.1);
    border-radius: 4px;
    height: 36px;
    min-width: 36px;
    transition: background-color .25s ease-in-out;
}

html[data-color-scheme='dark'] select:not(#myGrid select, #myChart select, select[class*='ag-']):hover {
    background-color: #2a343e;
}

html[data-color-scheme='dark'] input:not(#myGrid input, #myChart input, input[class*='ag-']) {
    appearance: none;
    background-color: #202A34;
    border: 1px solid rgb(255,255,255,0.1);
    border-radius: 4px;
    height: 36px;
    min-width: 36px;
}

html[data-color-scheme='dark'] body:not(#myGrid body, #myChart body) {
  color: #fff;
}
`;
