import { ChartMenuOptions, Component } from "ag-grid-community";
interface ChartToolbarButton {
    buttonName: ChartMenuOptions;
    iconName: string;
    callback: (eventSource: HTMLElement) => void;
}
export declare class ChartToolbar extends Component {
    private readonly chartTranslationService;
    private readonly chartMenuService;
    private eMenu;
    private buttonListenersDestroyFuncs;
    constructor();
    updateParams(params: {
        buttons: ChartToolbarButton[];
    }): void;
    private createButtons;
    private createButton;
    private wrapButton;
    protected destroy(): void;
}
export {};
