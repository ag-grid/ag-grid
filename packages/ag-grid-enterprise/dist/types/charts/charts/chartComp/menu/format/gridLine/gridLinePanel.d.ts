import { Component } from 'ag-grid-community';
import { ChartMenuParamsFactory } from '../../chartMenuParamsFactory';
export declare class GridLinePanel extends Component {
    private readonly chartMenuUtils;
    static TEMPLATE: string;
    private readonly chartTranslationService;
    private readonly chartOptions;
    constructor(chartMenuUtils: ChartMenuParamsFactory);
    private init;
    private getGridLineColorPickerParams;
    private getGridLineWidthSliderParams;
    private getGridLineDashSliderParams;
}
