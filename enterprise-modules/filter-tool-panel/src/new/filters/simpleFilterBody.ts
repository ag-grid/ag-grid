import { AgInputTextField, Component, _removeFromParent } from '@ag-grid-community/core';

import type { FilterCondition } from '../filterState';

export class SimpleFilterBody extends Component {
    private eFrom: AgInputTextField;
    private eTo?: AgInputTextField;

    constructor(private condition: FilterCondition) {
        super(/* html */ `<div class="ag-filter-body"></div>`);
    }

    postConstruct(): void {
        this.eFrom = this.createFromToElement('from');
        this.refreshComp(undefined, this.condition);
    }

    public refresh(condition: FilterCondition): void {
        const oldCondition = this.condition;
        this.condition = condition;
        this.refreshComp(oldCondition, condition);
    }

    private refreshComp(oldCondition: FilterCondition | undefined, newCondition: FilterCondition): void {
        if (oldCondition === newCondition) {
            return;
        }
        const { eFrom } = this;
        let { eTo } = this;
        const { numberOfInputs, disabled = false } = newCondition;
        if (numberOfInputs === 1) {
            const { from } = newCondition;
            eFrom.setValue(from, true).setDisabled(disabled);
            if (eTo) {
                _removeFromParent(eTo.getGui());
                this.eTo = this.destroyBean(eTo);
            }
        } else if (numberOfInputs === 2) {
            const { from, to } = newCondition;
            eFrom.setValue(from, true).setDisabled(disabled);
            if (!eTo) {
                eTo = this.createFromToElement('to');
                this.eTo = eTo;
            }
            eTo.setValue(to, true).setDisabled(disabled);
        }
    }

    private createFromToElement(fromTo: 'from' | 'to'): AgInputTextField {
        const eValue = this.createBean(new AgInputTextField());
        eValue.addCssClass(`ag-filter-${fromTo}`);
        eValue.addCssClass('ag-filter-filter');
        this.appendChild(eValue.getGui());
        return eValue;
    }

    public override destroy(): void {
        this.eFrom = this.destroyBean(this.eFrom)!;
        this.eTo = this.destroyBean(this.eTo);
    }
}
