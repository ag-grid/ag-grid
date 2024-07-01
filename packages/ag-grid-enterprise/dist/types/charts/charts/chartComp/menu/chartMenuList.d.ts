import type { BeanCollection, NamedBean } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';
import type { ChartMenuContext } from './chartMenuContext';
export declare class ChartMenuListFactory extends BeanStub implements NamedBean {
    beanName: "chartMenuListFactory";
    private popupService;
    private chartMenuService;
    private chartTranslationService;
    wireBeans(beans: BeanCollection): void;
    private activeChartMenuList?;
    showMenuList(params: {
        eventSource: HTMLElement;
        showMenu: () => void;
        chartMenuContext: ChartMenuContext;
    }): void;
    private getMenuItems;
    private mapWithStockItems;
    private getStockMenuItem;
    private createMenuItem;
    destroy(): void;
}
