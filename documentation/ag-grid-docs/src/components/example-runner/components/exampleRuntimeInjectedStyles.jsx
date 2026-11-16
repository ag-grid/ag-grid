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

html, body {
    background-color: transparent;
}

/* Apply "color-scheme: dark;" to all elements outside the grid */
html[data-color-scheme='dark'] body > *:where(:not([class^=ag])) {
    color-scheme: dark;

    /* restore light color scheme for legacy quartz light theme which does not set its own color scheme */
    .ag-theme-quartz {
        color-scheme: light;
    }
}

html {
    --example-background-color: white;
    --example-text-color: black;
    --example-color-scheme: light;
    --example-font-family: 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen-Sans', 'Ubuntu', 'Cantarell', 'Helvetica Neue', 'sans-serif';
}

html[data-color-scheme='dark'] {
    --example-background-color: #1f2836;
    --example-text-color: white;
    --example-color-scheme: dark;
}

html[data-color-scheme='dark'] body {
  color: #fff;
}

#myChart, .my-chart {
    margin-top: 8px;
    margin-bottom: 8px;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid color-mix(in srgb, transparent, #181d1f 15%);

    [data-color-scheme='dark'] & {
        border-color: color-mix(in srgb, transparent, #FFF 15%);
    }
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
