var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Component, RefSelector, } from '@ag-grid-community/core';
import { SetFilter } from './setFilter';
import { SetValueModel } from './setValueModel';
export class SetFloatingFilterComp extends Component {
    constructor() {
        super(/* html */ `
            <div class="ag-floating-filter-input" role="presentation">
                <ag-input-text-field ref="eFloatingFilterText"></ag-input-text-field>
            </div>`);
        this.availableValuesListenerAdded = false;
    }
    // this is a user component, and IComponent has "public destroy()" as part of the interface.
    // so we need to override destroy() just to make the method public.
    destroy() {
        super.destroy();
    }
    init(params) {
        const displayName = this.columnModel.getDisplayNameForColumn(params.column, 'header', true);
        const translate = this.localeService.getLocaleTextFunc();
        this.eFloatingFilterText
            .setDisabled(true)
            .setInputAriaLabel(`${displayName} ${translate('ariaFilterInput', 'Filter Input')}`)
            .addGuiEventListener('click', () => params.showParentFilter());
        this.params = params;
    }
    onParentModelChanged(parentModel) {
        this.updateFloatingFilterText(parentModel);
    }
    parentSetFilterInstance(cb) {
        this.params.parentFilterInstance((filter) => {
            if (!(filter instanceof SetFilter)) {
                throw new Error('AG Grid - SetFloatingFilter expects SetFilter as its parent');
            }
            cb(filter);
        });
    }
    addAvailableValuesListener() {
        this.parentSetFilterInstance((setFilter) => {
            const setValueModel = setFilter.getValueModel();
            if (!setValueModel) {
                return;
            }
            // unlike other filters, what we show in the floating filter can be different, even
            // if another filter changes. this is due to how set filter restricts its values based
            // on selections in other filters, e.g. if you filter Language to English, then the set filter
            // on Country will only show English speaking countries. Thus the list of items to show
            // in the floating filter can change.
            this.addManagedListener(setValueModel, SetValueModel.EVENT_AVAILABLE_VALUES_CHANGED, () => this.updateFloatingFilterText());
        });
        this.availableValuesListenerAdded = true;
    }
    updateFloatingFilterText(parentModel) {
        if (!this.availableValuesListenerAdded) {
            this.addAvailableValuesListener();
        }
        this.parentSetFilterInstance((setFilter) => {
            const { values } = parentModel || setFilter.getModel() || {};
            const valueModel = setFilter.getValueModel();
            if (values == null || valueModel == null) {
                this.eFloatingFilterText.setValue('');
                return;
            }
            const availableKeys = values.filter(v => valueModel.isKeyAvailable(v));
            const numValues = availableKeys.length;
            const formattedValues = availableKeys.slice(0, 10).map(key => setFilter.getFormattedValue(key));
            const valuesString = `(${numValues}) ${formattedValues.join(',')}${numValues > 10 ? ',...' : ''}`;
            this.eFloatingFilterText.setValue(valuesString);
        });
    }
}
__decorate([
    RefSelector('eFloatingFilterText')
], SetFloatingFilterComp.prototype, "eFloatingFilterText", void 0);
__decorate([
    Autowired('valueFormatterService')
], SetFloatingFilterComp.prototype, "valueFormatterService", void 0);
__decorate([
    Autowired('columnModel')
], SetFloatingFilterComp.prototype, "columnModel", void 0);
