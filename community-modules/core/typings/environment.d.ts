import { BeanStub } from "./context/beanStub";
export declare type SASS_PROPERTIES = 'headerHeight' | 'headerCellMinWidth' | 'listItemHeight' | 'rowHeight' | 'chartMenuPanelWidth';
export declare class Environment extends BeanStub {
    private eGridDiv;
    getSassVariable(theme: string, key: SASS_PROPERTIES): number | undefined;
    isThemeDark(): boolean;
    chartMenuPanelWidth(): number | undefined;
    getTheme(): {
        theme?: string;
        el?: HTMLElement;
        themeFamily?: string;
        allThemes: string[];
    };
}
