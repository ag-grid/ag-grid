export declare type SASS_PROPERTIES = 'headerHeight' | 'virtualItemHeight' | 'rowHeight' | 'chartMenuPanelWidth';
export declare class Environment {
    private eGridDiv;
    getSassVariable(theme: string, key: SASS_PROPERTIES): number;
    isThemeDark(): boolean;
    useNativeCheckboxes(): boolean;
    chartMenuPanelWidth(): number;
    getTheme(): {
        theme?: string;
        el?: HTMLElement;
        themeFamily?: string;
    };
}
