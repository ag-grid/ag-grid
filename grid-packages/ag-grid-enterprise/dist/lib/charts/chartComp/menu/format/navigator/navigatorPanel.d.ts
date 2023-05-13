import { Component } from "ag-grid-community";
import { FormatPanelOptions } from "../formatPanel";
export declare class NavigatorPanel extends Component {
    static TEMPLATE: string;
    private navigatorGroup;
    private navigatorHeightSlider;
    private chartTranslationService;
    private readonly chartOptionsService;
    private readonly isExpandedOnInit;
    constructor({ chartOptionsService, isExpandedOnInit }: FormatPanelOptions);
    private init;
    private initNavigator;
    protected destroy(): void;
}
