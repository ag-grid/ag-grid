/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.0
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
    // used by:
    // 1) NumberFloatingFilter & TextFloatingFilter: Always, for both when editable and read only.
    // 2) DateFloatingFilter: Only when read only (as we show text rather than a date picker when read only)
    getTextFromModel(model) {
        if (!model) {
            return null;
        }
        const isCombined = model.operator != null;
        if (isCombined) {
            const combinedModel = model;
            const { condition1, condition2 } = combinedModel || {};
            const customOption1 = this.getTextFromModel(condition1);
            const customOption2 = this.getTextFromModel(condition2);
            return [
                customOption1,
                combinedModel.operator,
                customOption2,
            ].join(' ');
        }
        else {
            const condition = model;
            const customOption = this.optionsFactory.getCustomOption(condition.type);
            // For custom filter options we display the Name of the filter instead
            // of displaying the `from` value, as it wouldn't be relevant
            const { displayKey, displayName, numberOfInputs } = customOption || {};
            if (displayKey && displayName && numberOfInputs === 0) {
                this.gridOptionsWrapper.getLocaleTextFunc()(displayKey, displayName);
                return displayName;
            }
            return this.conditionToString(condition, customOption);
        }
    }
    isEventFromFloatingFilter(event) {
        return event && event.afterFloatingFilter;
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
            condition = combinedModel.condition1;
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
        // readOnly is a property of IProvidedFilterParams - we need to find a better (type-safe)
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
