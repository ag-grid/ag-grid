import type { BeanCollection, ChartToolbarMenuItemOptions } from 'ag-grid-community';
import { Component } from 'ag-grid-community';
interface ChartToolbarButton {
    buttonName: ChartToolbarMenuItemOptions;
    iconName: string;
    callback: (eventSource: HTMLElement) => void;
}
export declare class ChartToolbar extends Component {
    private chartTranslationService;
    wireBeans(beans: BeanCollection): void;
    private readonly eMenu;
    private buttonListenersDestroyFuncs;
    constructor();
    updateParams(params: {
        buttons: ChartToolbarButton[];
    }): void;
    private createButtons;
    private createButton;
    destroy(): void;
}
export {};
