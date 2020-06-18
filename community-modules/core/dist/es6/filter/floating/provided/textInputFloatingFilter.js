/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v23.2.1
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
import { RefSelector } from '../../../widgets/componentAnnotations';
import { debounce } from '../../../utils/function';
import { Constants } from '../../../constants';
import { ProvidedFilter } from '../../provided/providedFilter';
import { PostConstruct, Autowired } from '../../../context/context';
import { SimpleFloatingFilter } from './simpleFloatingFilter';
import { isKeyPressed } from '../../../utils/keyboard';
var TextInputFloatingFilter = /** @class */ (function (_super) {
    __extends(TextInputFloatingFilter, _super);
    function TextInputFloatingFilter() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TextInputFloatingFilter.prototype.postConstruct = function () {
        this.setTemplate(/* html */ "\n            <div class=\"ag-floating-filter-input\" role=\"presentation\">\n                <ag-input-text-field ref=\"eFloatingFilterInput\"></ag-input-text-field>\n            </div>");
    };
    TextInputFloatingFilter.prototype.getDefaultDebounceMs = function () {
        return 500;
    };
    TextInputFloatingFilter.prototype.onParentModelChanged = function (model, event) {
        // we don't want to update the floating filter if the floating filter caused the change.
        // as if it caused the change, the ui is already in sync. if we didn't do this, the UI
        // would behave strange as it would be updating as the user is typing
        if (this.isEventFromFloatingFilter(event)) {
            return;
        }
        this.setLastTypeFromModel(model);
        var modelString = this.getTextFromModel(model);
        this.eFloatingFilterInput.setValue(modelString);
        var editable = this.canWeEditAfterModelFromParentFilter(model);
        this.setEditable(editable);
    };
    TextInputFloatingFilter.prototype.init = function (params) {
        _super.prototype.init.call(this, params);
        this.params = params;
        this.applyActive = ProvidedFilter.isUseApplyButton(this.params.filterParams);
        var debounceMs = ProvidedFilter.getDebounceMs(this.params.filterParams, this.getDefaultDebounceMs());
        var toDebounce = debounce(this.syncUpWithParentFilter.bind(this), debounceMs);
        var filterGui = this.eFloatingFilterInput.getGui();
        this.addManagedListener(filterGui, 'input', toDebounce);
        this.addManagedListener(filterGui, 'keypress', toDebounce);
        this.addManagedListener(filterGui, 'keydown', toDebounce);
        var columnDef = params.column.getDefinition();
        if (columnDef.filterParams &&
            columnDef.filterParams.filterOptions &&
            columnDef.filterParams.filterOptions.length === 1 &&
            columnDef.filterParams.filterOptions[0] === 'inRange') {
            this.eFloatingFilterInput.setDisabled(true);
        }
        var displayName = this.columnController.getDisplayNameForColumn(params.column, 'header', true);
        this.eFloatingFilterInput.setInputAriaLabel(displayName + " Filter Input");
    };
    TextInputFloatingFilter.prototype.syncUpWithParentFilter = function (e) {
        var _this = this;
        var value = this.eFloatingFilterInput.getValue();
        var enterKeyPressed = isKeyPressed(e, Constants.KEY_ENTER);
        if (this.applyActive && !enterKeyPressed) {
            return;
        }
        this.params.parentFilterInstance(function (filterInstance) {
            if (filterInstance) {
                var simpleFilter = filterInstance;
                simpleFilter.onFloatingFilterChanged(_this.getLastType(), value);
            }
        });
    };
    TextInputFloatingFilter.prototype.setEditable = function (editable) {
        this.eFloatingFilterInput.setDisabled(!editable);
    };
    __decorate([
        Autowired('columnController')
    ], TextInputFloatingFilter.prototype, "columnController", void 0);
    __decorate([
        RefSelector('eFloatingFilterInput')
    ], TextInputFloatingFilter.prototype, "eFloatingFilterInput", void 0);
    __decorate([
        PostConstruct
    ], TextInputFloatingFilter.prototype, "postConstruct", null);
    return TextInputFloatingFilter;
}(SimpleFloatingFilter));
export { TextInputFloatingFilter };
