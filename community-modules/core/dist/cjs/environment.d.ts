// Type definitions for @ag-grid-community/core v23.0.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
export declare type SASS_PROPERTIES = 'headerHeight' | 'headerCellMinWidth' | 'listItemHeight' | 'rowHeight' | 'chartMenuPanelWidth';
export declare class Environment {
    private eGridDiv;
    getSassVariable(theme: string, key: SASS_PROPERTIES): number;
    isThemeDark(): boolean;
    chartMenuPanelWidth(): number;
    getTheme(): {
        theme?: string;
        el?: HTMLElement;
        themeFamily?: string;
    };
}
