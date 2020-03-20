/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v23.0.2
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
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
import { AgAbstractField } from "./agAbstractField";
import { AgPickerField } from "./agPickerField";
import { AgList } from "./agList";
import { Autowired, PostConstruct } from "../context/context";
import { _ } from "../utils";
var AgSelect = /** @class */ (function (_super) {
    __extends(AgSelect, _super);
    function AgSelect(config) {
        var _this = _super.call(this) || this;
        _this.displayTag = 'div';
        _this.className = 'ag-select';
        _this.pickerIcon = 'smallDown';
        _this.setTemplate(_this.TEMPLATE.replace(/%displayField%/g, _this.displayTag));
        return _this;
    }
    AgSelect.prototype.init = function () {
        var _this = this;
        this.listComponent = new AgList('select');
        this.getContext().wireBean(this.listComponent);
        this.listComponent.setParentComponent(this);
        this.eWrapper.tabIndex = 0;
        this.listComponent.addDestroyableEventListener(this.listComponent, AgList.EVENT_ITEM_SELECTED, function () { if (_this.hideList) {
            _this.hideList();
        } });
        this.listComponent.addDestroyableEventListener(this.listComponent, AgAbstractField.EVENT_CHANGED, function () {
            _this.setValue(_this.listComponent.getValue(), false, true);
            if (_this.hideList) {
                _this.hideList();
            }
        });
    };
    AgSelect.prototype.showPicker = function () {
        var _this = this;
        var listGui = this.listComponent.getGui();
        var mouseWheelFunc = this.addDestroyableEventListener(document.body, 'wheel', function (e) {
            if (!listGui.contains(e.target) && _this.hideList) {
                _this.hideList();
            }
        });
        var focusOutFunc = this.addDestroyableEventListener(listGui, 'focusout', function (e) {
            if (!listGui.contains(e.relatedTarget) && _this.hideList) {
                _this.hideList();
            }
        });
        this.hideList = this.popupService.addPopup(true, listGui, true, function () {
            _this.hideList = null;
            focusOutFunc();
            mouseWheelFunc();
            if (_this.isAlive()) {
                _this.getFocusableElement().focus();
            }
        });
        _.setElementWidth(listGui, _.getAbsoluteWidth(this.eWrapper));
        listGui.style.maxHeight = _.getInnerHeight(this.popupService.getPopupParent()) + 'px';
        listGui.style.position = 'absolute';
        this.popupService.positionPopupUnderComponent({
            type: 'ag-list',
            eventSource: this.eWrapper,
            ePopup: listGui,
            keepWithinBounds: true
        });
        this.listComponent.refreshHighlighted();
        return this.listComponent;
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
        if (this.value === value) {
            return;
        }
        if (!fromPicker) {
            this.listComponent.setValue(value, true);
        }
        var newValue = this.listComponent.getValue();
        if (newValue === this.getValue()) {
            return;
        }
        this.eDisplayField.innerHTML = this.listComponent.getDisplayValue();
        return _super.prototype.setValue.call(this, value, silent);
    };
    AgSelect.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        if (this.hideList) {
            this.hideList();
        }
        this.listComponent.destroy();
    };
    __decorate([
        Autowired('popupService')
    ], AgSelect.prototype, "popupService", void 0);
    __decorate([
        PostConstruct
    ], AgSelect.prototype, "init", null);
    return AgSelect;
}(AgPickerField));
export { AgSelect };
