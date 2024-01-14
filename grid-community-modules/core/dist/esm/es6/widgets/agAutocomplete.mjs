var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Component } from "./component.mjs";
import { RefSelector } from "./componentAnnotations.mjs";
import { Autowired, PostConstruct } from "../context/context.mjs";
import { AgAutocompleteList } from "./agAutocompleteList.mjs";
import { KeyCode } from "../constants/keyCode.mjs";
import { makeNull } from "../utils/generic.mjs";
export class AgAutocomplete extends Component {
    constructor() {
        super(/* html */ `
            <div class="ag-autocomplete" role="presentation">
                <ag-input-text-field ref="eAutocompleteInput"></ag-input-text-field>
            </div>`);
        this.isListOpen = false;
        this.lastPosition = 0;
        this.valid = true;
    }
    postConstruct() {
        this.eAutocompleteInput.onValueChange(value => this.onValueChanged(value));
        this.eAutocompleteInput.getInputElement().setAttribute('autocomplete', 'off');
        this.addGuiEventListener('keydown', this.onKeyDown.bind(this));
        this.addGuiEventListener('click', this.updatePositionAndList.bind(this));
        this.addDestroyFunc(() => {
            this.destroyBean(this.autocompleteList);
        });
        this.addGuiEventListener('focusout', () => this.onFocusOut());
    }
    onValueChanged(value) {
        const parsedValue = makeNull(value);
        this.updateValue(parsedValue);
        this.updateAutocompleteList(parsedValue);
    }
    updateValue(value) {
        this.updateLastPosition();
        this.dispatchEvent({
            type: AgAutocomplete.EVENT_VALUE_CHANGED,
            value
        });
        this.validate(value);
    }
    updateAutocompleteList(value) {
        var _a, _b, _c, _d;
        const autocompleteListParams = (_b = (_a = this.listGenerator) === null || _a === void 0 ? void 0 : _a.call(this, value, this.lastPosition)) !== null && _b !== void 0 ? _b : { enabled: false };
        if (!autocompleteListParams.type || autocompleteListParams.type !== ((_c = this.autocompleteListParams) === null || _c === void 0 ? void 0 : _c.type)) {
            if (this.isListOpen) {
                this.closeList();
            }
        }
        this.autocompleteListParams = autocompleteListParams;
        if ((_d = this.autocompleteListParams) === null || _d === void 0 ? void 0 : _d.enabled) {
            if (!this.isListOpen) {
                this.openList();
            }
            const { searchString } = this.autocompleteListParams;
            this.autocompleteList.setSearch(searchString !== null && searchString !== void 0 ? searchString : '');
        }
        else {
            if (this.isListOpen) {
                this.closeList();
            }
        }
    }
    onKeyDown(event) {
        const key = event.key;
        this.updateLastPosition();
        switch (key) {
            case KeyCode.ENTER:
                this.onEnterKeyDown(event);
                break;
            case KeyCode.TAB:
                this.onTabKeyDown(event);
                break;
            case KeyCode.DOWN:
            case KeyCode.UP:
                this.onUpDownKeyDown(event, key);
                break;
            case KeyCode.LEFT:
            case KeyCode.RIGHT:
            case KeyCode.PAGE_HOME:
            case KeyCode.PAGE_END:
                // input position is updated after this is called, so do async
                setTimeout(() => {
                    this.updatePositionAndList();
                });
                break;
            case KeyCode.ESCAPE:
                this.onEscapeKeyDown(event);
                break;
            case KeyCode.SPACE:
                if (event.ctrlKey && !this.isListOpen) {
                    event.preventDefault();
                    this.forceOpenList();
                }
                break;
        }
    }
    confirmSelection() {
        var _a;
        const selectedValue = (_a = this.autocompleteList) === null || _a === void 0 ? void 0 : _a.getSelectedValue();
        if (selectedValue) {
            this.closeList();
            this.dispatchEvent({
                type: AgAutocomplete.EVENT_OPTION_SELECTED,
                value: this.getValue(),
                position: this.lastPosition,
                updateEntry: selectedValue,
                autocompleteType: this.autocompleteListParams.type
            });
        }
    }
    onTabKeyDown(event) {
        if (this.isListOpen) {
            event.preventDefault();
            event.stopPropagation();
            this.confirmSelection();
        }
    }
    onEnterKeyDown(event) {
        event.preventDefault();
        if (this.isListOpen) {
            this.confirmSelection();
        }
        else {
            this.onCompleted();
        }
    }
    onUpDownKeyDown(event, key) {
        var _a;
        event.preventDefault();
        if (!this.isListOpen) {
            this.forceOpenList();
        }
        else {
            (_a = this.autocompleteList) === null || _a === void 0 ? void 0 : _a.onNavigationKeyDown(event, key);
        }
    }
    onEscapeKeyDown(event) {
        if (this.isListOpen) {
            event.preventDefault();
            event.stopPropagation();
            this.closeList();
            this.setCaret(this.lastPosition, true);
        }
    }
    onFocusOut() {
        if (this.isListOpen) {
            this.closeList();
        }
    }
    updatePositionAndList() {
        var _a;
        this.updateLastPosition();
        this.updateAutocompleteList((_a = this.eAutocompleteInput.getValue()) !== null && _a !== void 0 ? _a : null);
    }
    setCaret(position, setFocus) {
        const eDocument = this.gridOptionsService.getDocument();
        if (setFocus && eDocument.activeElement === eDocument.body) {
            // clicking on the list loses focus, so restore
            this.eAutocompleteInput.getFocusableElement().focus();
        }
        const eInput = this.eAutocompleteInput.getInputElement();
        eInput.setSelectionRange(position, position);
        if (position === eInput.value.length) {
            // ensure the caret is visible
            eInput.scrollLeft = eInput.scrollWidth;
        }
    }
    forceOpenList() {
        this.onValueChanged(this.eAutocompleteInput.getValue());
    }
    updateLastPosition() {
        var _a;
        this.lastPosition = (_a = this.eAutocompleteInput.getInputElement().selectionStart) !== null && _a !== void 0 ? _a : 0;
    }
    validate(value) {
        var _a;
        if (!this.validator) {
            return;
        }
        this.validationMessage = this.validator(value);
        this.eAutocompleteInput.getInputElement().setCustomValidity((_a = this.validationMessage) !== null && _a !== void 0 ? _a : '');
        this.valid = !this.validationMessage;
        this.dispatchEvent({
            type: AgAutocomplete.EVENT_VALID_CHANGED,
            isValid: this.valid,
            validationMessage: this.validationMessage
        });
    }
    openList() {
        this.isListOpen = true;
        // this is unmanaged as it gets destroyed/created each time it is opened
        this.autocompleteList = this.createBean(new AgAutocompleteList({
            autocompleteEntries: this.autocompleteListParams.entries,
            onConfirmed: () => this.confirmSelection(),
            forceLastSelection: this.forceLastSelection
        }));
        const ePopupGui = this.autocompleteList.getGui();
        const positionParams = {
            ePopup: ePopupGui,
            type: 'autocomplete',
            eventSource: this.getGui(),
            position: 'under',
            alignSide: this.gridOptionsService.get('enableRtl') ? 'right' : 'left',
            keepWithinBounds: true
        };
        const addPopupRes = this.popupService.addPopup({
            eChild: ePopupGui,
            anchorToElement: this.getGui(),
            positionCallback: () => this.popupService.positionPopupByComponent(positionParams),
            ariaLabel: this.listAriaLabel
        });
        this.hidePopup = addPopupRes.hideFunc;
        this.autocompleteList.afterGuiAttached();
    }
    closeList() {
        this.isListOpen = false;
        this.hidePopup();
        this.destroyBean(this.autocompleteList);
        this.autocompleteList = null;
    }
    onCompleted() {
        if (this.isListOpen) {
            this.closeList();
        }
        this.dispatchEvent({
            type: AgAutocomplete.EVENT_VALUE_CONFIRMED,
            value: this.getValue(),
            isValid: this.isValid()
        });
    }
    getValue() {
        return makeNull(this.eAutocompleteInput.getValue());
    }
    setInputPlaceholder(placeholder) {
        this.eAutocompleteInput.setInputPlaceholder(placeholder);
        return this;
    }
    setInputAriaLabel(label) {
        this.eAutocompleteInput.setInputAriaLabel(label);
        return this;
    }
    setListAriaLabel(label) {
        this.listAriaLabel = label;
        return this;
    }
    setListGenerator(listGenerator) {
        this.listGenerator = listGenerator;
        return this;
    }
    setValidator(validator) {
        this.validator = validator;
        return this;
    }
    isValid() {
        return this.valid;
    }
    setValue(params) {
        const { value, position, silent, updateListOnlyIfOpen, restoreFocus } = params;
        this.eAutocompleteInput.setValue(value, true);
        this.setCaret(position !== null && position !== void 0 ? position : this.lastPosition, restoreFocus);
        if (!silent) {
            this.updateValue(value);
        }
        if (!updateListOnlyIfOpen || this.isListOpen) {
            this.updateAutocompleteList(value);
        }
    }
    setForceLastSelection(forceLastSelection) {
        this.forceLastSelection = forceLastSelection;
        return this;
    }
    setInputDisabled(disabled) {
        this.eAutocompleteInput.setDisabled(disabled);
        return this;
    }
}
AgAutocomplete.EVENT_VALUE_CHANGED = 'eventValueChanged';
AgAutocomplete.EVENT_VALUE_CONFIRMED = 'eventValueConfirmed';
AgAutocomplete.EVENT_OPTION_SELECTED = 'eventOptionSelected';
AgAutocomplete.EVENT_VALID_CHANGED = 'eventValidChanged';
__decorate([
    Autowired('popupService')
], AgAutocomplete.prototype, "popupService", void 0);
__decorate([
    RefSelector('eAutocompleteInput')
], AgAutocomplete.prototype, "eAutocompleteInput", void 0);
__decorate([
    PostConstruct
], AgAutocomplete.prototype, "postConstruct", null);
