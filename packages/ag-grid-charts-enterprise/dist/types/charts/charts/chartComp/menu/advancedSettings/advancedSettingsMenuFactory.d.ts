import { BeanStub } from "ag-grid-community";
import { ChartMenuContext } from "../chartMenuContext";
export declare class AdvancedSettingsMenuFactory extends BeanStub {
    private readonly focusService;
    private readonly chartTranslationService;
    private activeMenu?;
    private activeDialog?;
    showMenu(chartMenuContext: ChartMenuContext, eventSource?: HTMLElement): void;
    hideMenu(): void;
    protected destroy(): void;
}
