import { BeanStub } from 'ag-grid-community';
import { ChartMenuContext } from './chartMenuContext';
export declare class ChartMenuListFactory extends BeanStub {
    private readonly popupService;
    private readonly chartMenuService;
    private readonly chartTranslationService;
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
    protected destroy(): void;
}
