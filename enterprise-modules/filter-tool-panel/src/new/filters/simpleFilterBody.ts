import { AgInputNumberField, AgInputTextField, Component, _makeNull, _removeFromParent } from '@ag-grid-community/core';

import type { FilterCondition } from '../filterState';

interface SimpleFilterBodyParams {
    condition: FilterCondition;
    filterType: 'text' | 'number' | 'date';
}

interface InputHelper<TValue = string> {
    createInput(): AgInputTextField;
    parseValueForInput(value?: TValue | null): string | null | undefined;
    parseValueFromInput(value?: string | null): TValue | null | undefined;
}

export class SimpleFilterBody extends Component<'filterChanged'> {
    private eFrom: AgInputTextField;
    private eTo?: AgInputTextField;
    private inputHelper: InputHelper;

    constructor(private params: SimpleFilterBodyParams) {
        super(/* html */ `<div class="ag-filter-body"></div>`);
    }

    postConstruct(): void {
        const { filterType } = this.params;
        this.inputHelper = this.createInputHelper(filterType);
        this.createEFrom();
        this.refreshComp(undefined, this.params);
    }

    public refresh(params: SimpleFilterBodyParams): void {
        const oldParams = this.params;
        this.params = params;
        this.refreshComp(oldParams, params);
    }

    private refreshComp(oldParams: SimpleFilterBodyParams | undefined, newParams: SimpleFilterBodyParams): void {
        if (oldParams === newParams) {
            return;
        }
        const { eFrom } = this;
        let { eTo } = this;
        const { condition, filterType } = newParams;
        const { filterType: oldFilterType } = oldParams ?? {};
        if (oldFilterType != null && oldFilterType !== filterType) {
            this.inputHelper = this.createInputHelper(filterType);
            _removeFromParent(eFrom.getGui());
            this.destroyBean(eFrom);
            this.createEFrom();
            this.eTo = this.checkRemove(eTo);
            eTo = undefined;
        }
        const { inputHelper } = this;
        const { numberOfInputs, disabled = false } = condition;
        if (numberOfInputs === 1) {
            const { from } = condition;
            eFrom.setValue(inputHelper.parseValueForInput(from), true).setDisabled(disabled);
            this.eTo = this.checkRemove(eTo);
        } else if (numberOfInputs === 2) {
            const { from, to } = condition;
            eFrom.setValue(inputHelper.parseValueForInput(from), true).setDisabled(disabled);
            if (!eTo) {
                eTo = this.createFromToElement('to');
                this.eTo = eTo;
            }
            eTo.setValue(inputHelper.parseValueForInput(to), true).setDisabled(disabled);
        }
    }

    private checkRemove(element?: AgInputTextField): undefined {
        if (element) {
            _removeFromParent(element.getGui());
            this.eTo = this.destroyBean(element);
        }
        return undefined;
    }

    private createEFrom(): void {
        this.eFrom = this.createFromToElement('from');
    }

    private createFromToElement(fromTo: 'from' | 'to'): AgInputTextField {
        const { inputHelper } = this;
        const eValue = inputHelper.createInput();
        eValue.addCssClass(`ag-filter-${fromTo}`);
        eValue.addCssClass('ag-filter-filter');
        eValue.onValueChange((value) =>
            this.dispatchLocalEvent({
                type: 'filterChanged',
                key: fromTo,
                value: inputHelper.parseValueFromInput(value),
            })
        );
        this.appendChild(eValue.getGui());
        return eValue;
    }

    private createInputHelper<TValue>(filterType: 'text' | 'number' | 'date'): InputHelper<TValue> {
        if (filterType === 'date') {
            const inputHelper: InputHelper<string> = {
                createInput: () => {
                    const eInput = this.createBean(new AgInputTextField());
                    eInput.getInputElement().type = 'date';
                    return eInput;
                },
                parseValueForInput: (v) => v as any,
                parseValueFromInput: (v) => {
                    const value = _makeNull(v);
                    if (value == null) {
                        return value;
                    }
                    return value.split(' ')[0];
                },
            };
            return inputHelper as any;
        }
        if (filterType === 'number') {
            const inputHelper: InputHelper<number> = {
                createInput: () => this.createBean(new AgInputNumberField()),
                parseValueForInput: (v) => v as any,
                parseValueFromInput: (v) => {
                    const value = _makeNull(v);
                    return value == null ? null : parseFloat(value);
                },
            };
            return inputHelper as any;
        }
        const inputHelper: InputHelper<string> = {
            createInput: () => this.createBean(new AgInputTextField()),
            parseValueForInput: (v) => v as any,
            parseValueFromInput: (v) => {
                const value = _makeNull(v);
                return value;
            },
        };
        return inputHelper as any;
    }

    public override destroy(): void {
        this.eFrom = this.destroyBean(this.eFrom)!;
        this.eTo = this.destroyBean(this.eTo);
    }
}
