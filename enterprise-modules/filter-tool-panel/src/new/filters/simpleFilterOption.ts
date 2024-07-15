import type { BeanCollection, ListOption } from '@ag-grid-community/core';
import { AgSelect, BeanStub, _removeFromParent } from '@ag-grid-community/core';

import type { FilterPanelTranslationService } from '../filterPanelTranslationService';
import type { FilterCondition } from '../filterState';
import { SimpleFilterBody } from './simpleFilterBody';

interface SimpleFilterOptionParams {
    eFilterBody: HTMLElement;
    condition: FilterCondition;
    options: ListOption[];
}

export class SimpleFilterOption extends BeanStub {
    private translationService: FilterPanelTranslationService;

    private eType: AgSelect;
    private eConditionBody?: SimpleFilterBody;

    constructor(private params: SimpleFilterOptionParams) {
        super();
    }

    public wireBeans(beans: BeanCollection): void {
        this.translationService = beans.filterPanelTranslationService as FilterPanelTranslationService;
    }

    public appendToGui(): void {
        const eType = this.createManagedBean(
            new AgSelect({
                className: 'ag-select ag-filter-select',
                ariaLabel: this.translationService.translate('ariaFilteringOperator'),
                onValueChange: (value) => {
                    // TODO
                    value;
                },
            })
        );
        this.eType = eType;
        const { params } = this;
        params.eFilterBody.appendChild(eType.getGui());

        this.refreshComp(undefined, params);
    }

    public removeFromGui(): void {
        const { eType, eConditionBody } = this;
        _removeFromParent(eType.getGui());
        if (eConditionBody) {
            _removeFromParent(eConditionBody.getGui());
        }
    }

    public refresh(params: SimpleFilterOptionParams): void {
        const oldParams = this.params;
        this.params = params;
        this.refreshComp(oldParams, params);
    }

    private refreshComp(oldParams: SimpleFilterOptionParams | undefined, newParams: SimpleFilterOptionParams): void {
        if (oldParams === newParams) {
            return;
        }
        const { condition, eFilterBody, options } = newParams;

        const { numberOfInputs, option, disabled = false } = condition;

        this.eType.clearOptions().addOptions(options).setValue(option, true).setDisabled(disabled);

        let { eConditionBody } = this;
        if (numberOfInputs != 0) {
            if (!eConditionBody) {
                eConditionBody = this.createBean(new SimpleFilterBody(condition));
                this.eConditionBody = eConditionBody;
                eFilterBody.appendChild(eConditionBody.getGui());
            } else {
                eConditionBody.refresh(condition);
            }
        } else if (numberOfInputs === 0 && eConditionBody) {
            _removeFromParent(eConditionBody.getGui());
            this.eConditionBody = this.destroyBean(eConditionBody);
        }
    }

    public override destroy(): void {
        this.eType = this.destroyBean(this.eType)!;
        this.eConditionBody = this.destroyBean(this.eConditionBody);
        super.destroy();
    }
}
