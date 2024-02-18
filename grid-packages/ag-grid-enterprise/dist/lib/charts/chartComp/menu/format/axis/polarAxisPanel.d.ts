import { Component } from 'ag-grid-community';
import { FormatPanelOptions } from '../formatPanel';
export declare class PolarAxisPanel extends Component {
    static TEMPLATE: string;
    private axisGroup;
    private axisColorInput;
    private axisLineWidthSlider;
    private chartTranslationService;
    private readonly chartController;
    private readonly chartOptionsService;
    private readonly isExpandedOnInit;
    private dynamicComponents;
    constructor({ chartController, chartOptionsService, isExpandedOnInit }: FormatPanelOptions);
    private init;
    private initAxis;
    private initAxisLabels;
    private createOrientationWidget;
    private initRadiusAxis;
    private initSlider;
    private initSelect;
    private translate;
    private destroyDynamicComponents;
    protected destroy(): void;
}
