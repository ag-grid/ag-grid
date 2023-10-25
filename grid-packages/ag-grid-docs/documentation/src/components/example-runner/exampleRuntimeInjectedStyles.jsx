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
   
}

.ag-theme-alpine-dark .ag-header-cell {
    font-size: 14px;
}

html[data-color-scheme='dark'] body > * {
    color-scheme: dark;
}


html[data-color-scheme='dark'] button:not(#myGrid button) {
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
}

html[data-color-scheme='dark'] select:not(#myGrid select) {
    appearance: none;
    background-color: #202A34;
    border: 1px solid rgb(255,255,255,0.1);
    border-radius: 4px;
    height: 36px;
    min-width: 36px;

}

html[data-color-scheme='dark'] body:not(#myGrid body) {
  color: #fff;
}




`;