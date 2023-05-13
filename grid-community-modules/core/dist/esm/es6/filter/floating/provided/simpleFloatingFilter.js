/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.3.5
 * @link https://www.ag-grid.com/
 * @license MIT
 */
import { Component } from '../../../widgets/component';
import { SimpleFilter } from '../../provided/simpleFilter';
import { OptionsFactory } from '../../provided/optionsFactory';
export class SimpleFloatingFilter extends Component {
    getDefaultDebounceMs() {
        return 0;
    }
    // this is a user component, and IComponent has "public destroy()" as part of the interface.
    // so we need to override destroy() just to make the method public.
    destroy() {
        super.destroy();
    }
    isEventFromFloatingFilter(event) {
        return event && event.afterFloatingFilter;
    }
    isEventFromDataChange(event) {
        return event === null || event === void 0 ? void 0 : event.afterDataChange;
    }
    getLastType() {
        return this.lastType;
    }
    isReadOnly() {
        return this.readOnly;
    }
    setLastTypeFromModel(model) {
        // if no model provided by the parent filter use default
        if (!model) {
            this.lastType = this.optionsFactory.getDefaultOption();
            return;
        }
        const isCombined = model.operator;
        let condition;
        if (isCombined) {
            const combinedModel = model;
            condition = combinedModel.conditions[0];
        }
        else {
            condition = model;
        }
        this.lastType = condition.type;
    }
    canWeEditAfterModelFromParentFilter(model) {
        if (!model) {
            // if no model, then we can edit as long as the lastType is something we can edit, as this
            // is the type we will provide to the parent filter if the user decides to use the floating filter.
            return this.isTypeEditable(this.lastType);
        }
        // never allow editing if the filter is combined (ie has two parts)
        const isCombined = model.operator;
        if (isCombined) {
            return false;
        }
        const simpleModel = model;
        return this.isTypeEditable(simpleModel.type);
    }
    init(params) {
        this.optionsFactory = new OptionsFactory();
        this.optionsFactory.init(params.filterParams, this.getDefaultFilterOptions());
        this.lastType = this.optionsFactory.getDefaultOption();
        // readOnly is a property of ProvidedFilterParams - we need to find a better (type-safe)
        // way to support reading this in the future.
        this.readOnly = !!params.filterParams.readOnly;
        // we are editable if:
        // 1) there is a type (user has configured filter wrong if not type)
        //  AND
        // 2) the default type is not 'in range'
        const editable = this.isTypeEditable(this.lastType);
        this.setEditable(editable);
    }
    doesFilterHaveSingleInput(filterType) {
        const customFilterOption = this.optionsFactory.getCustomOption(filterType);
        const { numberOfInputs } = customFilterOption || {};
        return numberOfInputs == null || numberOfInputs == 1;
    }
    isTypeEditable(type) {
        const uneditableTypes = [
            SimpleFilter.IN_RANGE, SimpleFilter.EMPTY, SimpleFilter.BLANK, SimpleFilter.NOT_BLANK,
        ];
        return !!type &&
            !this.isReadOnly() &&
            this.doesFilterHaveSingleInput(type) &&
            uneditableTypes.indexOf(type) < 0;
    }
}
