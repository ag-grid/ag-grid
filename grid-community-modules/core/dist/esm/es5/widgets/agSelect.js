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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { AgPickerField } from "./agPickerField";
import { AgList } from "./agList";
import { Events } from "../eventKeys";
import { KeyCode } from "../constants/keyCode";
import { setAriaControls } from "../utils/aria";
var AgSelect = /** @class */ (function (_super) {
    __extends(AgSelect, _super);
    function AgSelect(config) {
        return _super.call(this, __assign({ pickerAriaLabelKey: 'ariaLabelSelectField', pickerAriaLabelValue: 'Select Field', pickerType: 'ag-list', className: 'ag-select', pickerIcon: 'smallDown', ariaRole: 'combobox' }, config)) || this;
    }
    AgSelect.prototype.postConstruct = function () {
        _super.prototype.postConstruct.call(this);
        this.createListComponent();
        this.eWrapper.tabIndex = this.gridOptionsService.get('tabIndex');
    };
    AgSelect.prototype.createListComponent = function () {
        var _this = this;
        this.listComponent = this.createBean(new AgList('select'));
        this.listComponent.setParentComponent(this);
        var eListAriaEl = this.listComponent.getAriaElement();
        var listId = "ag-select-list-".concat(this.listComponent.getCompId());
        eListAriaEl.setAttribute('id', listId);
        setAriaControls(this.getAriaElement(), eListAriaEl);
        this.listComponent.addGuiEventListener('keydown', function (e) {
            if (e.key === KeyCode.TAB) {
                e.preventDefault();
                e.stopImmediatePropagation();
                _this.getGui().dispatchEvent(new KeyboardEvent('keydown', {
                    key: e.key,
                    shiftKey: e.shiftKey,
                    ctrlKey: e.ctrlKey,
                    bubbles: true
                }));
            }
            ;
        });
        this.listComponent.addManagedListener(this.listComponent, AgList.EVENT_ITEM_SELECTED, function () {
            _this.hidePicker();
            _this.dispatchEvent({ type: AgSelect.EVENT_ITEM_SELECTED });
        });
        this.listComponent.addManagedListener(this.listComponent, Events.EVENT_FIELD_VALUE_CHANGED, function () {
            if (!_this.listComponent) {
                return;
            }
            _this.setValue(_this.listComponent.getValue(), false, true);
            _this.hidePicker();
        });
    };
    AgSelect.prototype.createPickerComponent = function () {
        // do not create the picker every time to save state
        return this.listComponent;
    };
    AgSelect.prototype.showPicker = function () {
        if (!this.listComponent) {
            return;
        }
        _super.prototype.showPicker.call(this);
        this.listComponent.refreshHighlighted();
    };
    AgSelect.prototype.addOptions = function (options) {
        var _this = this;
        options.forEach(function (option) { return _this.addOption(option); });
        return this;
    };
    AgSelect.prototype.addOption = function (option) {
        this.listComponent.addOption(option);
        return this;
    };
    AgSelect.prototype.setValue = function (value, silent, fromPicker) {
        if (this.value === value || !this.listComponent) {
            return this;
        }
        if (!fromPicker) {
            this.listComponent.setValue(value, true);
        }
        var newValue = this.listComponent.getValue();
        if (newValue === this.getValue()) {
            return this;
        }
        this.eDisplayField.innerHTML = this.listComponent.getDisplayValue();
        return _super.prototype.setValue.call(this, value, silent);
    };
    AgSelect.prototype.destroy = function () {
        if (this.listComponent) {
            this.destroyBean(this.listComponent);
            this.listComponent = undefined;
        }
        _super.prototype.destroy.call(this);
    };
    AgSelect.EVENT_ITEM_SELECTED = 'selectedItem';
    return AgSelect;
}(AgPickerField));
export { AgSelect };
