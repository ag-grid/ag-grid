import React from 'react';

/**
 * These are the CSS styles shared by all examples.
 */
const ExampleStyle = ({ rootId }) => <style media="only screen">
    {`
            html, body${rootId ? `, #${rootId}` : ''} {
                height: 100%;
                width: 100%;
                margin: 0;
                box-sizing: border-box;
                -webkit-overflow-scrolling: touch;
            }

            #myGrid.ag-theme-alpine-dark {
                --ag-background-color: #0A161F;
                --ag-odd-row-background-color: #151F28
                --ag-foreground-color: #e6f1fc; 
                --ag-header-background-color: #1B2938;
                --ag-header-foreground-color: #fff;
                --ag-border-color: color-mix(in srgb, var(--ag-background-color), var(--ag-foreground-color) 15%);
                --ag-header-column-resize-handle-color: color-mix(in srgb, var(--ag-background-color), var(--ag-foreground-color) 15%);
            }

            html {
                position: absolute;
                top: 0;
                left: 0;
                padding: 0;
                overflow: auto;
            }

            body {
                overflow: auto;
            }
        `}
</style>;

export default ExampleStyle;