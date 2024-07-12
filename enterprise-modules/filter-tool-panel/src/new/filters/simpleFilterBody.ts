import type { TextFilterModel } from '@ag-grid-community/core';
import { AgInputTextField, Component, _removeFromParent } from '@ag-grid-community/core';

interface SimpleFilterBodyParams {
    model?: TextFilterModel;
    numberOfInputs: 1 | 2;
    disabled?: boolean;
}

export class SimpleFilterBody extends Component {
    private eFrom: AgInputTextField;
    private eTo?: AgInputTextField;

    constructor(private params: SimpleFilterBodyParams) {
        super(/* html */ `<div class="ag-filter-body"></div>`);
    }

    postConstruct(): void {
        this.eFrom = this.createFromToElement('from');
        this.refresh(this.params);
    }

    public refresh(params: SimpleFilterBodyParams): void {
        this.params = params;

        const { model: { filter, filterTo } = {}, numberOfInputs, disabled = false } = params;
        const { eFrom } = this;
        let { eTo } = this;

        eFrom.setValue(filter, true).setDisabled(disabled);

        if (numberOfInputs === 2) {
            if (!eTo) {
                eTo = this.createFromToElement('to');
                this.eTo = eTo;
            }
            eTo.setValue(filterTo, true).setDisabled(disabled);
        } else if (eTo) {
            _removeFromParent(eTo.getGui());
            this.eTo = this.destroyBean(eTo);
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
