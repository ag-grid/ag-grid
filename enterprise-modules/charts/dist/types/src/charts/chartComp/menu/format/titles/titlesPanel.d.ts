import type { BeanCollection } from '@ag-grid-community/core';
import { Component } from '@ag-grid-community/core';
import type { FormatPanelOptions } from '../formatPanel';
export declare class TitlesPanel extends Component {
    private readonly options;
    private chartTranslationService;
    wireBeans(beans: BeanCollection): void;
    private readonly titleGroup;
    constructor(options: FormatPanelOptions);
    postConstruct(): void;
}
