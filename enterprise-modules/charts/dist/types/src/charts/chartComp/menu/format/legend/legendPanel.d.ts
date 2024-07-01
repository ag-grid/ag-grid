import type { BeanCollection } from '@ag-grid-community/core';
import { Component } from '@ag-grid-community/core';
import type { FormatPanelOptions } from '../formatPanel';
export declare class LegendPanel extends Component {
    private readonly options;
    private chartTranslationService;
    wireBeans(beans: BeanCollection): void;
    private readonly legendGroup;
    private readonly key;
    private readonly isGradient;
    constructor(options: FormatPanelOptions);
    postConstruct(): void;
    private getItems;
    private createLabelPanel;
}
