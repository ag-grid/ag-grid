export const DEFAULT_CONTEXT_MENU_CLASS = 'ag-chart-context-menu';

export const defaultContextMenuCss = `
.${DEFAULT_CONTEXT_MENU_CLASS} {
    transition: transform 0.1s ease;
    position: fixed;
    left: 0px;
    top: 0px;
    white-space: nowrap;
    z-index: 99999;
    font: 13px Verdana, sans-serif;
    color: black;
    background: rgb(244, 244, 244);
    border-radius: 5px;
    box-shadow: 0 0 1px rgba(3, 3, 3, 0.7), 0.5vh 0.5vh 1vh rgba(3, 3, 3, 0.25);
}

.${DEFAULT_CONTEXT_MENU_CLASS}__cover {
    position: fixed;
    left: 0px;
    top: 0px;
    background: rgba(255, 255, 255, 0.5);
}

.${DEFAULT_CONTEXT_MENU_CLASS}__menu {
    display: flex;
    flex-direction: column;
    padding: 0.5em;
}

.${DEFAULT_CONTEXT_MENU_CLASS}__item {
    background: none;
    border: none;
    border-radius: 3px;
    box-sizing: border-box;
    font: inherit;
    padding: 0.5em;
    text-align: left;
    -webkit-appearance: none;
    -moz-appearance: none;
}

.${DEFAULT_CONTEXT_MENU_CLASS}__item:hover {
    background: rgb(230, 230, 230);
    cursor: pointer;
}

.${DEFAULT_CONTEXT_MENU_CLASS}__item:active {
    background: rgb(236, 236, 236);
    cursor: pointer;
}

.${DEFAULT_CONTEXT_MENU_CLASS}__divider {
    margin: 5px;
    background: rgb(230, 230, 230);
    height: 1px;
}
`;
