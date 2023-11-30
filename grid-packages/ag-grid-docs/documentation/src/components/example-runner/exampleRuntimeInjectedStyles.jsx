/**
 * These styles are injected at runtime if the example is running on the
 * website. Use them for making website-specific tweaks that we don't want to
 * show to users who view the code or run the example on CodeSandbox.
 */
export default /* css */ `

body {
    padding: 0;
}

/* This should be refactored and fixed at the place where .test-header is defined */
.test-header {
    margin-bottom: 0 !important;
}

html[data-color-scheme='dark'] {
    color-scheme: dark;
    background-color: #0b1d28;
}

html[data-color-scheme='dark'] button:not(.ag-root-wrapper button, #myChart button, button[class*='ag-']) , .ag-fill-direction  {
    border: 2px solid rgba(255,255,255, 0.2);
}

.ag-theme-quartz-dark {
 
}

.ag-theme-quartz {

    
/*
TODO - reinstate these in a way that doesn't clobber example's row colours
    .ag-row {
        background: color-mix(in srgb, transparent, #fff 60%); 
        --ag-data-color: rgba(0,0,0,0.75)
    
    }

    .ag-header {
        background: color-mix(in srgb, var(--ag-data-color), var(--ag-header-background-color) 98%); 
    }
*/
}



html button:not(.ag-root-wrapper button, .ag-chart button, button[class*='ag-']), .ag-fill-direction  {
    appearance: none;
    background-color: var(--background-100);
    border: 2px solid rgba(0,0,0, 0.2);
    border-radius: 6px;
    height: 36px;
    color: var(--default-text-color);
    cursor: pointer;
    display: inline-block;
    font-size: 14px;
    font-weight: 500;
    letter-spacing: .01em;
    padding: 0.375em 1em 0.4em;
    white-space: nowrap;
    margin-right: 6px;
    margin-bottom: 8px;
    transition: background-color .25s ease-in-out;
}

html[data-color-scheme='dark'] button:not(.ag-root-wrapper button, .ag-chart button, button[class*='ag-']):hover {
    background-color: #2a343e;
}

html button:not(.ag-root-wrapper button, .ag-chart button, button[class*='ag-']):hover {
    background-color: rgba(0,0,0, 0.1);
}

html[data-color-scheme='dark'] select:not(.ag-root-wrapper select, .ag-chart select, select[class*='ag-']) {
    appearance: none;
    background-color: #202A34;
    border: 1px solid rgb(255,255,255,0.1);
    border-radius: 4px;
    height: 36px;
    min-width: 36px;
    transition: background-color .25s ease-in-out;
}

html[data-color-scheme='dark'] select:not(.ag-root-wrapper select, .ag-chart select, select[class*='ag-']):hover {
    background-color: #2a343e;
}

html[data-color-scheme='dark'] input:not(.ag-root-wrapper input):not(.ag-chart input):not([class*='ag-']):not([type='checkbox']):not([type='radio']) {
    appearance: none;
    background-color: #202A34;
    border: 1px solid rgb(255,255,255,0.1);
    border-radius: 4px;
    height: 36px;
    min-width: 36px;
}

html[data-color-scheme='light'] input:not(.ag-root-wrapper input):not(.ag-chart input):not([class*='ag-']):not([type='checkbox']):not([type='radio']) {
    appearance: none;
    background-color: #fff;
    border: 1px solid rgb(0,0,0,0.1);
    border-radius: 4px;
    height: 36px;
    min-width: 36px;
}

html[data-color-scheme='dark'] body {
  color: #fff;
}

#myChart, .my-chart {
    margin-top: 8px;
    margin-bottom: 8px;
    border-radius: 8px;
    border: 1px solid var(--ag-border-color);
}

#myChart .ag-chart,
.my-chart .ag-chart {
    border-radius: 8px;
}

#top .my-chart {
    margin-top: 0;
}

#top .my-chart {
    margin-bottom: 0;
}

#top .my-chart:first-child {
    margin-right: 8px;
}
`;
