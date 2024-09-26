import type { IAggFunc } from 'ag-grid-community';
import { AgSelect, AgToggleButton } from 'ag-grid-community';

import { AgGroupComponent } from '../../../../widgets/agGroupComponent';
import type { ChartController } from '../../chartController';
import type { ColState } from '../../model/chartDataModel';
import { ChartDataModel } from '../../model/chartDataModel';
import { DragDataPanel } from './dragDataPanel';

type AggFuncPreset = 'count' | 'sum' | 'min' | 'max' | 'avg' | 'first' | 'last';

const DEFAULT_AGG_FUNC: AggFuncPreset = 'sum';

export class CategoriesDataPanel extends DragDataPanel {
    private aggFuncToggle?: AgToggleButton;
    private aggFuncSelect?: AgSelect;

    constructor(
        chartController: ChartController,
        private readonly title: string,
        allowMultipleSelection: boolean,
        private dimensionCols: ColState[],
        private isOpen?: boolean
    ) {
        const maxSelection = undefined;
        super(chartController, allowMultipleSelection, maxSelection, /* html */ `<div id="categoriesGroup"></div>`);
    }

    public postConstruct() {
        this.groupComp = this.createBean(
            new AgGroupComponent({
                title: this.title,
                enabled: true,
                suppressEnabledCheckbox: true,
                suppressOpenCloseIcons: false,
                cssIdentifier: 'charts-data',
                expanded: this.isOpen,
            })
        );

        this.createGroup(
            this.dimensionCols,
            (col) => col.displayName ?? '',
            'categoryAdd',
            'categorySelect',
            () => !this.chartController.getAggFunc()
        );
        this.createAggFuncControls(this.dimensionCols);

        this.getGui().appendChild(this.groupComp.getGui());
    }

    public refresh(dimensionCols: ColState[]): void {
        this.valuePillSelect?.setValues(
            dimensionCols,
            dimensionCols.filter((col) => col.selected)
        );
        this.refreshValueSelect(dimensionCols);
        this.refreshAggFuncControls(dimensionCols, this.chartController.getAggFunc());
    }

    private createAggFuncControls(dimensionCols: ColState[]): void {
        const aggFunc = this.chartController.getAggFunc();
        this.groupComp.addItem(
            (this.aggFuncToggle = this.createBean(
                new AgToggleButton({
                    label: this.chartTranslationService.translate('aggregate'),
                    labelAlignment: 'left',
                    labelWidth: 'flex',
                    inputWidth: 'flex',
                    value: aggFunc != undefined,
                    onValueChange: (value) => {
                        const aggFunc = value ? DEFAULT_AGG_FUNC : undefined;
                        this.chartController.setAggFunc(aggFunc);
                        this.aggFuncSelect?.setValue(aggFunc, true);
                        this.aggFuncSelect?.setDisplayed(aggFunc != undefined);
                    },
                })
            ))
        );
        this.groupComp.addItem(
            (this.aggFuncSelect = this.createBean(
                new AgSelect<AggFuncPreset>({
                    options: [
                        { value: 'sum', text: this.chartTranslationService.translate('sum') },
                        { value: 'first', text: this.chartTranslationService.translate('first') },
                        { value: 'last', text: this.chartTranslationService.translate('last') },
                        { value: 'min', text: this.chartTranslationService.translate('min') },
                        { value: 'max', text: this.chartTranslationService.translate('max') },
                        { value: 'count', text: this.chartTranslationService.translate('count') },
                        { value: 'avg', text: this.chartTranslationService.translate('avg') },
                    ],
                    value: typeof aggFunc === 'string' ? aggFunc : undefined,
                    onValueChange: (value) => {
                        this.chartController.setAggFunc(value);
                    },
                })
            ))
        );
        this.refreshAggFuncControls(dimensionCols, aggFunc);
    }

    private refreshAggFuncControls(dimensionCols: ColState[], aggFunc: string | IAggFunc | undefined): void {
        const selectedDimensions = dimensionCols.filter((col) => col.selected);
        const supportsAggregation = selectedDimensions.some((col) => col.colId !== ChartDataModel.DEFAULT_CATEGORY);
        this.aggFuncToggle?.setValue(aggFunc != undefined);
        this.aggFuncSelect?.setValue(typeof aggFunc === 'string' ? aggFunc : undefined, true);
        this.aggFuncToggle?.setDisplayed(supportsAggregation);
        this.aggFuncSelect?.setDisplayed(supportsAggregation && aggFunc != undefined);
    }

    private clearAggFuncControls(): void {
        this.aggFuncToggle = this.destroyBean(this.aggFuncToggle);
        this.aggFuncSelect = this.destroyBean(this.aggFuncSelect);
    }

    public override destroy(): void {
        this.clearAggFuncControls();
        this.groupComp = this.destroyBean(this.groupComp)!;
        super.destroy();
    }
}
