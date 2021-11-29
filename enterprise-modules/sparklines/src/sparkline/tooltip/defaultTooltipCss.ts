export const defaultTooltipCss = `
.ag-sparkline-tooltip {
    display: table;
    position: absolute;
    user-select: none;
    pointer-events: none;
    white-space: nowrap;
    z-index: 99999;
    font: 12px arial,sans-serif;
    border-radius: 2px;
    box-shadow: 0 1px 3px rgb(0 0 0 / 20%), 0 1px 1px rgb(0 0 0 / 14%);
}

.ag-sparkline-tooltip-content {
    padding: 0 7px;
    line-height: 1.7em;
    border-radius: 2px;
    overflow: hidden;
}

.ag-sparkline-tooltip-title {
    font-weight: 400;
}

.ag-sparkline-tooltip-hidden {
    top: -10000px !important;
}

.ag-sparkline-wrapper {
    box-sizing: border-box;
    overflow: hidden;
}
`;