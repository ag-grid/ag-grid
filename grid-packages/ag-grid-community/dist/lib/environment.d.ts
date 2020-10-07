import { BeanStub } from "./context/beanStub";
export declare type SASS_PROPERTIES = 'headerHeight' | 'headerCellMinWidth' | 'listItemHeight' | 'rowHeight' | 'chartMenuPanelWidth';
export declare class Environment extends BeanStub {
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
