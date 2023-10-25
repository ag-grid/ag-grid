/**
 * These styles are injected at runtime if the example is running on the
 * website. Use them for making website-specific tweaks that we don't want to
 * show to users who view the code or run the example on CodeSandbox.
 */
export default /* css */ `

.ag-theme-alpine-dark {
    --ag-background-color: #0A161F;
    --ag-odd-row-background-color: #151F28;
    --ag-foreground-color: #e6f1fc; 
    --ag-header-background-color: #1B2938;
    --ag-header-foreground-color: #fff;
    --ag-border-color: color-mix(in srgb, var(--ag-background-color), var(--ag-foreground-color) 15%);
    --ag-header-column-resize-handle-color: color-mix(in srgb, var(--ag-background-color), var(--ag-foreground-color) 15%);
}

.ag-theme-alpine-dark .ag-header-cell {
    font-size: 14px;
}

`;