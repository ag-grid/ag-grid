import type { AgRadioButton, AgRadioButtonParams, BeanCollection, JoinOperator } from '@ag-grid-community/core';
import { AgRadioButtonSelector, Component, RefPlaceholder } from '@ag-grid-community/core';

import type { FilterPanelTranslationService } from '../filterPanelTranslationService';

interface SimpleFilterJoinParams {
    operator: JoinOperator;
    disabled?: boolean;
}

export class SimpleFilterJoin extends Component {
    private readonly eRadioButtonAnd: AgRadioButton = RefPlaceholder;
    private readonly eRadioButtonOr: AgRadioButton = RefPlaceholder;

    private translationService: FilterPanelTranslationService;

    constructor(private params: SimpleFilterJoinParams) {
        super();
    }

    public wireBeans(beans: BeanCollection): void {
        this.translationService = beans.filterPanelTranslationService as FilterPanelTranslationService;
    }

    public postConstruct(): void {
        const name = `ag-simple-filter-and-or-${this.getCompId()}-1`;
        const valueChangeListener = (operator: JoinOperator) => (value: boolean) => {
            if (value) {
                this.updateOperator(operator);
            }
        };
        const eRadioButtonAndParams: AgRadioButtonParams = {
            label: this.translationService.translate('andCondition'),
            name,
            onValueChange: valueChangeListener('AND'),
        };
        const eRadioButtonOrParams: AgRadioButtonParams = {
            label: this.translationService.translate('orCondition'),
            name,
            onValueChange: valueChangeListener('OR'),
        };

        this.setTemplate(
            /* html */ `<div class="ag-filter-condition">
            <ag-radio-button data-ref="eRadioButtonAnd" class="ag-filter-condition-operator ag-filter-condition-operator-and"></ag-radio-button>
            <ag-radio-button data-ref="eRadioButtonOr" class="ag-filter-condition-operator ag-filter-condition-operator-or"></ag-radio-button>
        </div>`,
            [AgRadioButtonSelector],
            {
                eRadioButtonAnd: eRadioButtonAndParams,
                eRadioButtonOr: eRadioButtonOrParams,
            }
        );
        this.refresh(this.params);
    }

    public refresh(params: SimpleFilterJoinParams): void {
        this.params = params;
        const { operator, disabled = false } = params;
        const isAnd = operator === 'AND';
        this.eRadioButtonAnd.setValue(isAnd, true).setDisabled(disabled);
        this.eRadioButtonOr.setValue(!isAnd, true).setDisabled(disabled);
    }

    private updateOperator(operator: JoinOperator): void {
        // TODO
        operator;
    }
}
