/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { RefSelector } from '../../../widgets/componentAnnotations';
import { debounce } from '../../../utils/function';
import { ProvidedFilter } from '../../provided/providedFilter';
import { PostConstruct, Autowired } from '../../../context/context';
import { SimpleFloatingFilter } from './simpleFloatingFilter';
import { SimpleFilter } from '../../provided/simpleFilter';
import { KeyCode } from '../../../constants/keyCode';
import { TextFilter } from '../../provided/text/textFilter';
export class TextInputFloatingFilter extends SimpleFloatingFilter {
    postConstruct() {
        this.resetTemplate();
    }
    resetTemplate(paramsMap) {
        this.setTemplate(/* html */ `
            <div class="ag-floating-filter-input" role="presentation">
                <ag-input-text-field ref="eFloatingFilterInput"></ag-input-text-field>
            </div>
        `, paramsMap);
    }
    getDefaultDebounceMs() {
        return 500;
    }
    onParentModelChanged(model, event) {
        if (this.isEventFromFloatingFilter(event)) {
            // if the floating filter triggered the change, it is already in sync
            return;
        }
        this.setLastTypeFromModel(model);
        this.eFloatingFilterInput.setValue(this.getTextFromModel(model));
        this.setEditable(this.canWeEditAfterModelFromParentFilter(model));
    }
    init(params) {
        super.init(params);
        this.params = params;
        this.applyActive = ProvidedFilter.isUseApplyButton(this.params.filterParams);
        const { allowedCharPattern } = this.params.filterParams;
        if (allowedCharPattern != null) {
            this.resetTemplate({ eFloatingFilterInput: { allowedCharPattern } });
        }
        if (!this.isReadOnly()) {
            const debounceMs = ProvidedFilter.getDebounceMs(this.params.filterParams, this.getDefaultDebounceMs());
            const toDebounce = debounce(this.syncUpWithParentFilter.bind(this), debounceMs);
            const filterGui = this.eFloatingFilterInput.getGui();
            this.addManagedListener(filterGui, 'input', toDebounce);
            this.addManagedListener(filterGui, 'keypress', toDebounce);
            this.addManagedListener(filterGui, 'keydown', toDebounce);
        }
        const columnDef = params.column.getDefinition();
        if (this.isReadOnly() || (columnDef.filterParams &&
            columnDef.filterParams.filterOptions &&
            columnDef.filterParams.filterOptions.length === 1 &&
            columnDef.filterParams.filterOptions[0] === 'inRange')) {
            this.eFloatingFilterInput.setDisabled(true);
        }
        const displayName = this.columnModel.getDisplayNameForColumn(params.column, 'header', true);
        const translate = this.gridOptionsWrapper.getLocaleTextFunc();
        this.eFloatingFilterInput.setInputAriaLabel(`${displayName} ${translate('ariaFilterInput', 'Filter Input')}`);
    }
    syncUpWithParentFilter(e) {
        const enterKeyPressed = e.key === KeyCode.ENTER;
        if (this.applyActive && !enterKeyPressed) {
            return;
        }
        let value = this.eFloatingFilterInput.getValue();
        if (this.params.filterParams.trimInput) {
            value = TextFilter.trimInput(value);
            this.eFloatingFilterInput.setValue(value, true); // ensure visible value is trimmed
        }
        this.params.parentFilterInstance(filterInstance => {
            if (filterInstance) {
                filterInstance.onFloatingFilterChanged(this.getLastType() || null, value || null);
            }
        });
    }
    conditionToString(condition, options) {
        const { numberOfInputs } = options || {};
        const isRange = condition.type == SimpleFilter.IN_RANGE || numberOfInputs === 2;
        if (isRange) {
            return `${condition.filter}-${condition.filterTo}`;
        }
        // cater for when the type doesn't need a value
        if (condition.filter != null) {
            return `${condition.filter}`;
        }
        return `${condition.type}`;
    }
    setEditable(editable) {
        this.eFloatingFilterInput.setDisabled(!editable);
    }
}
__decorate([
    Autowired('columnModel')
], TextInputFloatingFilter.prototype, "columnModel", void 0);
__decorate([
    RefSelector('eFloatingFilterInput')
], TextInputFloatingFilter.prototype, "eFloatingFilterInput", void 0);
__decorate([
    PostConstruct
], TextInputFloatingFilter.prototype, "postConstruct", null);
