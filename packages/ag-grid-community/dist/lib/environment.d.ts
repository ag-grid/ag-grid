export declare type SASS_PROPERTIES = 'headerHeight' | 'virtualItemHeight' | 'rowHeight';
export declare class Environment {
    private eGridDiv;
    getSassVariable(theme: string, key: SASS_PROPERTIES): number;
    isThemeDark(): boolean;
    getTheme(): {
        theme?: string;
        el?: HTMLElement;
    };
}
