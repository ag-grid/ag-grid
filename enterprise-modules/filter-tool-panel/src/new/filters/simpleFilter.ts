import type { ICombinedSimpleModel, JoinOperator, TextFilterModel } from '@ag-grid-community/core';
import { Component, RefPlaceholder, _removeFromParent } from '@ag-grid-community/core';

import type { FilterState } from '../filterState';
import { SimpleFilterJoin } from './simpleFilterJoin';
import { SimpleFilterOption } from './simpleFilterOption';

export class SimpleFilter extends Component {
    private readonly eFilterBody: HTMLElement = RefPlaceholder;

    private eOptions: SimpleFilterOption[] = [];
    private eJoinOperators: SimpleFilterJoin[] = [];

    private currentOperator: JoinOperator;

    constructor(private state: FilterState) {
        super(/* html */ `<form class="ag-filter-wrapper">
            <div data-ref="eFilterBody" class="ag-filter-body-wrapper ag-simple-filter-body-wrapper"></div>
        </form>`);
    }

    public postConstruct(): void {
        this.refresh(this.state);
    }

    public refresh(state: FilterState): void {
        this.state = state;
        const {
            unappliedModel,
            simpleFilterParams: { defaultJoinOperator, numAlwaysVisibleConditions },
        } = state;
        this.currentOperator = defaultJoinOperator;
        if (!unappliedModel) {
            this.createOrRefreshOption(0);
        } else {
            const isCombined = (unappliedModel as ICombinedSimpleModel<TextFilterModel>).operator;
            if (isCombined) {
                const { conditions, operator } = unappliedModel as ICombinedSimpleModel<TextFilterModel>;
                this.currentOperator = operator;
                conditions.forEach((condition, index) => {
                    if (index !== 0) {
                        this.createOrRefreshJoinOperator(index);
                    }
                    this.createOrRefreshOption(index, condition);
                });
            } else {
                const simpleModel = unappliedModel as TextFilterModel;
                this.createOrRefreshOption(0, simpleModel);
            }
        }
        let currentNumConditions = this.eOptions.length;
        for (let i = currentNumConditions; i < numAlwaysVisibleConditions; i++) {
            this.createOrRefreshJoinOperator(i);
            this.createOrRefreshOption(i);
        }
        currentNumConditions = Math.max(currentNumConditions, numAlwaysVisibleConditions);
        this.eOptions.splice(currentNumConditions).forEach((eOption) => {
            eOption.removeFromGui();
            this.destroyBean(eOption);
        });
        this.eJoinOperators.splice(currentNumConditions - 1).forEach((eJoinOperator) => {
            _removeFromParent(eJoinOperator.getGui());
            this.destroyBean(eJoinOperator);
        });
    }

    private createOrRefreshOption(index: number, model?: TextFilterModel): void {
        const { state, eFilterBody, eOptions } = this;
        const existingOption = eOptions[index];
        const params = {
            state,
            eFilterBody,
            model,
        };
        if (existingOption) {
            existingOption.refresh(params);
            return;
        }
        const optionWrapper = this.createBean(new SimpleFilterOption(params));
        optionWrapper.appendToGui();
        eOptions.push(optionWrapper);
    }

    private createOrRefreshJoinOperator(index: number, disabled?: boolean): void {
        // first condition doesn't have a join operator
        const operatorIndex = index - 1;
        const existingJoinOperator = this.eJoinOperators[operatorIndex];
        const params = { operator: this.currentOperator, disabled };
        if (existingJoinOperator) {
            existingJoinOperator.refresh(params);
            return;
        }
        const eJoinOperator = this.createBean(new SimpleFilterJoin(params));
        this.eFilterBody.appendChild(eJoinOperator.getGui());
        this.eJoinOperators.push(eJoinOperator);
    }

    public override destroy(): void {
        this.destroyBeans(this.eOptions);
        this.destroyBeans(this.eJoinOperators);
        this.eOptions.length = 0;
        this.eJoinOperators.length = 0;
        super.destroy();
    }
}
