import type { BeanCollection, TextFilterModel } from '@ag-grid-community/core';
import { AgSelect, BeanStub, _removeFromParent } from '@ag-grid-community/core';

import type { FilterPanelTranslationService } from '../filterPanelTranslationService';
import type { FilterState } from '../filterState';
import { SimpleFilterBody } from './simpleFilterBody';

interface SimpleFilterOptionParams {
    state: FilterState;
    eFilterBody: HTMLElement;
    model?: TextFilterModel;
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

        this.refresh(params);
    }

    public removeFromGui(): void {
        const { eType, eConditionBody } = this;
        _removeFromParent(eType.getGui());
        if (eConditionBody) {
            _removeFromParent(eConditionBody.getGui());
        }
    }

    public refresh(params: SimpleFilterOptionParams): void {
        this.params = params;

        const {
            state: {
                simpleFilterParams: { options, defaultOption },
            },
            model,
            eFilterBody,
        } = this.params;
        const value = model?.type ?? defaultOption;
        const activeOption = options.find((option) => option.value === value);
        const numberOfInputs = activeOption?.numberOfInputs ?? 1;

        this.eType
            .clearOptions()
            .addOptions(options)
            .setValue(value, true)
            .setDisabled(options.length <= 1);

        let { eConditionBody } = this;
        if (numberOfInputs != 0) {
            const params = { model, numberOfInputs };
            if (!eConditionBody) {
                eConditionBody = this.createBean(new SimpleFilterBody(params));
                this.eConditionBody = eConditionBody;
                eFilterBody.appendChild(eConditionBody.getGui());
            } else {
                eConditionBody.refresh(params);
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
