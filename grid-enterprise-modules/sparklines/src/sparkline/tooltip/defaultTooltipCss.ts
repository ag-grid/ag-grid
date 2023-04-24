export const defaultTooltipCss = `
.ag-sparkline-tooltip-wrapper {
    position: absolute;
    user-select: none;
    pointer-events: none;
}

.ag-sparkline-tooltip {
    position: relative;
    font: 12px arial,sans-serif;
    border-radius: 2px;
    box-shadow: 0 1px 3px rgb(0 0 0 / 20%), 0 1px 1px rgb(0 0 0 / 14%);
    line-height: 1.7em;
    overflow: hidden;
    white-space: nowrap;
    z-index: 99999;
    background-color: rgb(255, 255, 255);
    color: rgba(0,0,0, 0.67);
}

.ag-sparkline-tooltip-content {
    padding: 0 7px;
    opacity: 1;
}

.ag-sparkline-tooltip-title {
    padding-left: 7px;
    opacity: 1;
}

.ag-sparkline-tooltip-wrapper-hidden {
    top: -10000px !important;
}

.ag-sparkline-wrapper {
    box-sizing: border-box;
    overflow: hidden;
}
`;