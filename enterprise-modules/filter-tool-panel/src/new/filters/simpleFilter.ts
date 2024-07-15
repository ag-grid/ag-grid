import type { ListOption } from '@ag-grid-community/core';
import { Component, RefPlaceholder, _removeFromParent } from '@ag-grid-community/core';

import type { FilterCondition, SimpleFilterOperatorParams, SimpleFilterParams } from '../filterState';
import { SimpleFilterJoin } from './simpleFilterJoin';
import { SimpleFilterOption } from './simpleFilterOption';

export class SimpleFilter extends Component {
    private readonly eFilterBody: HTMLElement = RefPlaceholder;

    private eOptions: SimpleFilterOption[] = [];
    private eJoinOperators: SimpleFilterJoin[] = [];

    constructor(private params: SimpleFilterParams) {
        super(/* html */ `<form class="ag-filter-wrapper">
            <div data-ref="eFilterBody" class="ag-filter-body-wrapper ag-simple-filter-body-wrapper"></div>
        </form>`);
    }

    public postConstruct(): void {
        this.refreshComp(undefined, this.params);
    }

    public refresh(params: SimpleFilterParams): void {
        const oldParams = this.params;
        this.params = params;
        this.refreshComp(oldParams, params);
    }

    private refreshComp(oldParams: SimpleFilterParams | undefined, newParams: SimpleFilterParams): void {
        if (oldParams === newParams) {
            return;
        }
        const { conditions, joinOperator, options } = newParams;
        const currentNumConditions = conditions.length;

        conditions.forEach((condition, index) => {
            if (index !== 0) {
                this.createOrRefreshJoinOperator(index, joinOperator);
            }
            this.createOrRefreshOption(index, condition, options);
        });

        this.eOptions.splice(currentNumConditions).forEach((eOption) => {
            eOption.removeFromGui();
            this.destroyBean(eOption);
        });
        this.eJoinOperators.splice(currentNumConditions - 1).forEach((eJoinOperator) => {
            _removeFromParent(eJoinOperator.getGui());
            this.destroyBean(eJoinOperator);
        });
    }

    private createOrRefreshOption(index: number, condition: FilterCondition, options: ListOption[]): void {
        const { eFilterBody, eOptions } = this;
        const existingOption = eOptions[index];
        const params = {
            eFilterBody,
            condition,
            options,
        };
        if (existingOption) {
            existingOption.refresh(params);
            return;
        }
        const optionWrapper = this.createBean(new SimpleFilterOption(params));
        optionWrapper.appendToGui();
        eOptions.push(optionWrapper);
    }

    private createOrRefreshJoinOperator(index: number, operator: SimpleFilterOperatorParams): void {
        // first condition doesn't have a join operator
        const operatorIndex = index - 1;
        const existingJoinOperator = this.eJoinOperators[operatorIndex];
        if (existingJoinOperator) {
            existingJoinOperator.refresh(operator);
            return;
        }
        const eJoinOperator = this.createBean(new SimpleFilterJoin(operator));
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
