import type { BeanCollection } from 'ag-grid-community';
import { Component } from 'ag-grid-community';
import type { FormatPanelOptions } from '../formatPanel';
export declare class PolarAxisPanel extends Component {
    private readonly options;
    private readonly axisGroup;
    private chartTranslationService;
    wireBeans(beans: BeanCollection): void;
    constructor(options: FormatPanelOptions);
    postConstruct(): void;
    private initAxis;
    private initAxisLabels;
    private createOrientationWidget;
    private initRadiusAxis;
    private createSlider;
    private createSelect;
    private translate;
}
