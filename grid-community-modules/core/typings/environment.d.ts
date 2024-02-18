import { BeanStub } from "./context/beanStub";
export declare type SASS_PROPERTIES = 'headerHeight' | 'headerCellMinWidth' | 'listItemHeight' | 'rowHeight' | 'chartMenuPanelWidth';
export declare class Environment extends BeanStub {
    private eGridDiv;
    private calculatedSizes;
    private mutationObserver;
    private postConstruct;
    private fireGridStylesChangedEvent;
    private getSassVariable;
    private calculateValueForSassProperty;
    isThemeDark(): boolean;
    chartMenuPanelWidth(): number | undefined;
    getTheme(): {
        theme?: string;
        el?: HTMLElement;
        themeFamily?: string;
        allThemes: string[];
    };
    getFromTheme(defaultValue: number, sassVariableName: SASS_PROPERTIES): number;
    getFromTheme(defaultValue: null, sassVariableName: SASS_PROPERTIES): number | null | undefined;
    getDefaultRowHeight(): number;
    getListItemHeight(): number;
    refreshRowHeightVariable(): number;
    getMinColWidth(): number;
    protected destroy(): void;
}
