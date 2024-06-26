import type { BeanCollection, NamedBean } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';
import type { ChartMenuContext } from '../chartMenuContext';
export declare class AdvancedSettingsMenuFactory extends BeanStub implements NamedBean {
    beanName: "advancedSettingsMenuFactory";
    private focusService;
    private chartTranslationService;
    wireBeans(beans: BeanCollection): void;
    private activeMenu?;
    private activeDialog?;
    showMenu(chartMenuContext: ChartMenuContext, eventSource?: HTMLElement): void;
    hideMenu(): void;
    destroy(): void;
}
