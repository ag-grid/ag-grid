import { Component } from 'ag-grid-community';
import { ChartTranslationService } from '../../services/chartTranslationService';
export declare class SwitchCategorySeriesDataPanel extends Component {
    private readonly getValue;
    private readonly setValue;
    private static TEMPLATE;
    protected readonly chartTranslationService: ChartTranslationService;
    private switchCategorySeriesToggleButton?;
    constructor(getValue: () => boolean, setValue: (value: boolean) => void);
    private init;
    refresh(): void;
}
