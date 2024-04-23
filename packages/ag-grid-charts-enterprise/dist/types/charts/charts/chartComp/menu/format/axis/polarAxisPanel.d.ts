import { Component } from 'ag-grid-community';
import { FormatPanelOptions } from '../formatPanel';
export declare class PolarAxisPanel extends Component {
    static TEMPLATE: string;
    private axisGroup;
    private readonly chartTranslationService;
    private readonly chartController;
    private readonly chartMenuUtils;
    private readonly isExpandedOnInit;
    constructor({ chartController, chartAxisMenuParamsFactory: chartAxisMenuUtils, isExpandedOnInit }: FormatPanelOptions);
    private init;
    private initAxis;
    private initAxisLabels;
    private createOrientationWidget;
    private initRadiusAxis;
    private createSlider;
    private createSelect;
    private translate;
}
