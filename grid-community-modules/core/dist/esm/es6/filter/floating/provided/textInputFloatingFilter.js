/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.2.0
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
import { AgInputTextField } from '../../../widgets/agInputTextField';
import { KeyCode } from '../../../constants/keyCode';
import { TextFilter } from '../../provided/text/textFilter';
import { BeanStub } from '../../../context/beanStub';
export class FloatingFilterTextInputService extends BeanStub {
    constructor(params) {
        super();
        this.params = params;
    }
    setupGui(parentElement) {
        this.eFloatingFilterTextInput = this.createManagedBean(new AgInputTextField(this.params.config));
        this.eFloatingFilterTextInput.setInputAriaLabel(this.params.ariaLabel);
        parentElement.appendChild(this.eFloatingFilterTextInput.getGui());
    }
    setEditable(editable) {
        this.eFloatingFilterTextInput.setDisabled(!editable);
    }
    getValue() {
        return this.eFloatingFilterTextInput.getValue();
    }
    setValue(value, silent) {
        this.eFloatingFilterTextInput.setValue(value, silent);
    }
    addValueChangedListener(listener) {
        const inputGui = this.eFloatingFilterTextInput.getGui();
        this.addManagedListener(inputGui, 'input', listener);
        this.addManagedListener(inputGui, 'keypress', listener);
        this.addManagedListener(inputGui, 'keydown', listener);
    }
}
export class TextInputFloatingFilter extends SimpleFloatingFilter {
    postConstruct() {
        this.setTemplate(/* html */ `
            <div class="ag-floating-filter-input" role="presentation" ref="eFloatingFilterInputContainer"></div>
        `);
    }
    getDefaultDebounceMs() {
        return 500;
    }
    onParentModelChanged(model, event) {
        if (this.isEventFromFloatingFilter(event) || this.isEventFromDataChange(event)) {
            // if the floating filter triggered the change, it is already in sync.
            // Data changes also do not affect provided text floating filters
            return;
        }
        this.setLastTypeFromModel(model);
        this.setEditable(this.canWeEditAfterModelFromParentFilter(model));
        this.floatingFilterInputService.setValue(this.getFilterModelFormatter().getModelAsString(model));
    }
    init(params) {
        this.params = params;
        const displayName = this.columnModel.getDisplayNameForColumn(params.column, 'header', true);
        const translate = this.localeService.getLocaleTextFunc();
        const ariaLabel = `${displayName} ${translate('ariaFilterInput', 'Filter Input')}`;
        this.floatingFilterInputService = this.createFloatingFilterInputService(ariaLabel);
        this.floatingFilterInputService.setupGui(this.eFloatingFilterInputContainer);
        super.init(params);
        this.applyActive = ProvidedFilter.isUseApplyButton(this.params.filterParams);
        if (!this.isReadOnly()) {
            const debounceMs = ProvidedFilter.getDebounceMs(this.params.filterParams, this.getDefaultDebounceMs());
            const toDebounce = debounce(this.syncUpWithParentFilter.bind(this), debounceMs);
            this.floatingFilterInputService.addValueChangedListener(toDebounce);
        }
    }
    syncUpWithParentFilter(e) {
        const enterKeyPressed = e.key === KeyCode.ENTER;
        if (this.applyActive && !enterKeyPressed) {
            return;
        }
        let value = this.floatingFilterInputService.getValue();
        if (this.params.filterParams.trimInput) {
            value = TextFilter.trimInput(value);
            this.floatingFilterInputService.setValue(value, true); // ensure visible value is trimmed
        }
        this.params.parentFilterInstance(filterInstance => {
            if (filterInstance) {
                // NumberFilter is typed as number, but actually receives string values
                filterInstance.onFloatingFilterChanged(this.getLastType() || null, value || null);
            }
        });
    }
    setEditable(editable) {
        this.floatingFilterInputService.setEditable(editable);
    }
}
__decorate([
    Autowired('columnModel')
], TextInputFloatingFilter.prototype, "columnModel", void 0);
__decorate([
    RefSelector('eFloatingFilterInputContainer')
], TextInputFloatingFilter.prototype, "eFloatingFilterInputContainer", void 0);
__decorate([
    PostConstruct
], TextInputFloatingFilter.prototype, "postConstruct", null);
