import type { BeanCollection } from '@ag-grid-community/core';
import { Component } from '@ag-grid-community/core';
import type { ChartMenuParamsFactory } from '../../chartMenuParamsFactory';
export declare class TileSpacingPanel extends Component {
    private readonly chartMenuUtils;
    private chartTranslationService;
    wireBeans(beans: BeanCollection): void;
    constructor(chartMenuUtils: ChartMenuParamsFactory);
    postConstruct(): void;
    private getSliderParams;
}
