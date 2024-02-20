"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgAutocomplete = void 0;
var component_1 = require("./component");
var componentAnnotations_1 = require("./componentAnnotations");
var context_1 = require("../context/context");
var agAutocompleteList_1 = require("./agAutocompleteList");
var keyCode_1 = require("../constants/keyCode");
var generic_1 = require("../utils/generic");
var AgAutocomplete = /** @class */ (function (_super) {
    __extends(AgAutocomplete, _super);
    function AgAutocomplete() {
        var _this = _super.call(this, /* html */ "\n            <div class=\"ag-autocomplete\" role=\"presentation\">\n                <ag-input-text-field ref=\"eAutocompleteInput\"></ag-input-text-field>\n            </div>") || this;
        _this.isListOpen = false;
        _this.lastPosition = 0;
        _this.valid = true;
        return _this;
    }
    AgAutocomplete.prototype.postConstruct = function () {
        var _this = this;
        this.eAutocompleteInput.onValueChange(function (value) { return _this.onValueChanged(value); });
        this.eAutocompleteInput.getInputElement().setAttribute('autocomplete', 'off');
        this.addGuiEventListener('keydown', this.onKeyDown.bind(this));
        this.addGuiEventListener('click', this.updatePositionAndList.bind(this));
        this.addDestroyFunc(function () {
            _this.destroyBean(_this.autocompleteList);
        });
        this.addGuiEventListener('focusout', function () { return _this.onFocusOut(); });
    };
    AgAutocomplete.prototype.onValueChanged = function (value) {
        var parsedValue = (0, generic_1.makeNull)(value);
        this.updateValue(parsedValue);
        this.updateAutocompleteList(parsedValue);
    };
    AgAutocomplete.prototype.updateValue = function (value) {
        this.updateLastPosition();
        this.dispatchEvent({
            type: AgAutocomplete.EVENT_VALUE_CHANGED,
            value: value
        });
        this.validate(value);
    };
    AgAutocomplete.prototype.updateAutocompleteList = function (value) {
        var _a, _b, _c, _d;
        var autocompleteListParams = (_b = (_a = this.listGenerator) === null || _a === void 0 ? void 0 : _a.call(this, value, this.lastPosition)) !== null && _b !== void 0 ? _b : { enabled: false };
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
            var searchString = this.autocompleteListParams.searchString;
            this.autocompleteList.setSearch(searchString !== null && searchString !== void 0 ? searchString : '');
        }
        else {
            if (this.isListOpen) {
                this.closeList();
            }
        }
    };
    AgAutocomplete.prototype.onKeyDown = function (event) {
        var _this = this;
        var key = event.key;
        this.updateLastPosition();
        switch (key) {
            case keyCode_1.KeyCode.ENTER:
                this.onEnterKeyDown(event);
                break;
            case keyCode_1.KeyCode.TAB:
                this.onTabKeyDown(event);
                break;
            case keyCode_1.KeyCode.DOWN:
            case keyCode_1.KeyCode.UP:
                this.onUpDownKeyDown(event, key);
                break;
            case keyCode_1.KeyCode.LEFT:
            case keyCode_1.KeyCode.RIGHT:
            case keyCode_1.KeyCode.PAGE_HOME:
            case keyCode_1.KeyCode.PAGE_END:
                // input position is updated after this is called, so do async
                setTimeout(function () {
                    _this.updatePositionAndList();
                });
                break;
            case keyCode_1.KeyCode.ESCAPE:
                this.onEscapeKeyDown(event);
                break;
            case keyCode_1.KeyCode.SPACE:
                if (event.ctrlKey && !this.isListOpen) {
                    event.preventDefault();
                    this.forceOpenList();
                }
                break;
        }
    };
    AgAutocomplete.prototype.confirmSelection = function () {
        var _a;
        var selectedValue = (_a = this.autocompleteList) === null || _a === void 0 ? void 0 : _a.getSelectedValue();
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
    };
    AgAutocomplete.prototype.onTabKeyDown = function (event) {
        if (this.isListOpen) {
            event.preventDefault();
            event.stopPropagation();
            this.confirmSelection();
        }
    };
    AgAutocomplete.prototype.onEnterKeyDown = function (event) {
        event.preventDefault();
        if (this.isListOpen) {
            this.confirmSelection();
        }
        else {
            this.onCompleted();
        }
    };
    AgAutocomplete.prototype.onUpDownKeyDown = function (event, key) {
        var _a;
        event.preventDefault();
        if (!this.isListOpen) {
            this.forceOpenList();
        }
        else {
            (_a = this.autocompleteList) === null || _a === void 0 ? void 0 : _a.onNavigationKeyDown(event, key);
        }
    };
    AgAutocomplete.prototype.onEscapeKeyDown = function (event) {
        if (this.isListOpen) {
            event.preventDefault();
            event.stopPropagation();
            this.closeList();
            this.setCaret(this.lastPosition, true);
        }
    };
    AgAutocomplete.prototype.onFocusOut = function () {
        if (this.isListOpen) {
            this.closeList();
        }
    };
    AgAutocomplete.prototype.updatePositionAndList = function () {
        var _a;
        this.updateLastPosition();
        this.updateAutocompleteList((_a = this.eAutocompleteInput.getValue()) !== null && _a !== void 0 ? _a : null);
    };
    AgAutocomplete.prototype.setCaret = function (position, setFocus) {
        var eDocument = this.gridOptionsService.getDocument();
        if (setFocus && eDocument.activeElement === eDocument.body) {
            // clicking on the list loses focus, so restore
            this.eAutocompleteInput.getFocusableElement().focus();
        }
        var eInput = this.eAutocompleteInput.getInputElement();
        eInput.setSelectionRange(position, position);
        if (position === eInput.value.length) {
            // ensure the caret is visible
            eInput.scrollLeft = eInput.scrollWidth;
        }
    };
    AgAutocomplete.prototype.forceOpenList = function () {
        this.onValueChanged(this.eAutocompleteInput.getValue());
    };
    AgAutocomplete.prototype.updateLastPosition = function () {
        var _a;
        this.lastPosition = (_a = this.eAutocompleteInput.getInputElement().selectionStart) !== null && _a !== void 0 ? _a : 0;
    };
    AgAutocomplete.prototype.validate = function (value) {
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
    };
    AgAutocomplete.prototype.openList = function () {
        var _this = this;
        this.isListOpen = true;
        // this is unmanaged as it gets destroyed/created each time it is opened
        this.autocompleteList = this.createBean(new agAutocompleteList_1.AgAutocompleteList({
            autocompleteEntries: this.autocompleteListParams.entries,
            onConfirmed: function () { return _this.confirmSelection(); },
            forceLastSelection: this.forceLastSelection
        }));
        var ePopupGui = this.autocompleteList.getGui();
        var positionParams = {
            ePopup: ePopupGui,
            type: 'autocomplete',
            eventSource: this.getGui(),
            position: 'under',
            alignSide: this.gridOptionsService.get('enableRtl') ? 'right' : 'left',
            keepWithinBounds: true
        };
        var addPopupRes = this.popupService.addPopup({
            eChild: ePopupGui,
            anchorToElement: this.getGui(),
            positionCallback: function () { return _this.popupService.positionPopupByComponent(positionParams); },
            ariaLabel: this.listAriaLabel
        });
        this.hidePopup = addPopupRes.hideFunc;
        this.autocompleteList.afterGuiAttached();
    };
    AgAutocomplete.prototype.closeList = function () {
        this.isListOpen = false;
        this.hidePopup();
        this.destroyBean(this.autocompleteList);
        this.autocompleteList = null;
    };
    AgAutocomplete.prototype.onCompleted = function () {
        if (this.isListOpen) {
            this.closeList();
        }
        this.dispatchEvent({
            type: AgAutocomplete.EVENT_VALUE_CONFIRMED,
            value: this.getValue(),
            isValid: this.isValid()
        });
    };
    AgAutocomplete.prototype.getValue = function () {
        return (0, generic_1.makeNull)(this.eAutocompleteInput.getValue());
    };
    AgAutocomplete.prototype.setInputPlaceholder = function (placeholder) {
        this.eAutocompleteInput.setInputPlaceholder(placeholder);
        return this;
    };
    AgAutocomplete.prototype.setInputAriaLabel = function (label) {
        this.eAutocompleteInput.setInputAriaLabel(label);
        return this;
    };
    AgAutocomplete.prototype.setListAriaLabel = function (label) {
        this.listAriaLabel = label;
        return this;
    };
    AgAutocomplete.prototype.setListGenerator = function (listGenerator) {
        this.listGenerator = listGenerator;
        return this;
    };
    AgAutocomplete.prototype.setValidator = function (validator) {
        this.validator = validator;
        return this;
    };
    AgAutocomplete.prototype.isValid = function () {
        return this.valid;
    };
    AgAutocomplete.prototype.setValue = function (params) {
        var value = params.value, position = params.position, silent = params.silent, updateListOnlyIfOpen = params.updateListOnlyIfOpen, restoreFocus = params.restoreFocus;
        this.eAutocompleteInput.setValue(value, true);
        this.setCaret(position !== null && position !== void 0 ? position : this.lastPosition, restoreFocus);
        if (!silent) {
            this.updateValue(value);
        }
        if (!updateListOnlyIfOpen || this.isListOpen) {
            this.updateAutocompleteList(value);
        }
    };
    AgAutocomplete.prototype.setForceLastSelection = function (forceLastSelection) {
        this.forceLastSelection = forceLastSelection;
        return this;
    };
    AgAutocomplete.prototype.setInputDisabled = function (disabled) {
        this.eAutocompleteInput.setDisabled(disabled);
        return this;
    };
    AgAutocomplete.EVENT_VALUE_CHANGED = 'eventValueChanged';
    AgAutocomplete.EVENT_VALUE_CONFIRMED = 'eventValueConfirmed';
    AgAutocomplete.EVENT_OPTION_SELECTED = 'eventOptionSelected';
    AgAutocomplete.EVENT_VALID_CHANGED = 'eventValidChanged';
    __decorate([
        (0, context_1.Autowired)('popupService')
    ], AgAutocomplete.prototype, "popupService", void 0);
    __decorate([
        (0, componentAnnotations_1.RefSelector)('eAutocompleteInput')
    ], AgAutocomplete.prototype, "eAutocompleteInput", void 0);
    __decorate([
        context_1.PostConstruct
    ], AgAutocomplete.prototype, "postConstruct", null);
    return AgAutocomplete;
}(component_1.Component));
exports.AgAutocomplete = AgAutocomplete;
