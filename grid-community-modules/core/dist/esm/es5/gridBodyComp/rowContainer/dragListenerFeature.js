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
import { BeanStub } from "../../context/beanStub";
import { missing } from "../../utils/generic";
import { Autowired, Optional, PostConstruct } from "../../context/context";
var DragListenerFeature = /** @class */ (function (_super) {
    __extends(DragListenerFeature, _super);
    function DragListenerFeature(eContainer) {
        var _this = _super.call(this) || this;
        _this.eContainer = eContainer;
        return _this;
    }
    DragListenerFeature.prototype.postConstruct = function () {
        var _this = this;
        if (missing(this.rangeService)) {
            return;
        }
        this.params = {
            eElement: this.eContainer,
            onDragStart: this.rangeService.onDragStart.bind(this.rangeService),
            onDragStop: this.rangeService.onDragStop.bind(this.rangeService),
            onDragging: this.rangeService.onDragging.bind(this.rangeService)
        };
        this.addManagedPropertyListener('enableRangeSelection', function (props) {
            var isEnabled = props.currentValue;
            if (isEnabled) {
                _this.enableFeature();
                return;
            }
            _this.disableFeature();
        });
        this.addDestroyFunc(function () { return _this.disableFeature(); });
        var isRangeSelection = this.gridOptionsService.get('enableRangeSelection');
        if (isRangeSelection) {
            this.enableFeature();
        }
    };
    DragListenerFeature.prototype.enableFeature = function () {
        this.dragService.addDragSource(this.params);
    };
    DragListenerFeature.prototype.disableFeature = function () {
        this.dragService.removeDragSource(this.params);
    };
    __decorate([
        Optional('rangeService')
    ], DragListenerFeature.prototype, "rangeService", void 0);
    __decorate([
        Autowired('dragService')
    ], DragListenerFeature.prototype, "dragService", void 0);
    __decorate([
        PostConstruct
    ], DragListenerFeature.prototype, "postConstruct", null);
    return DragListenerFeature;
}(BeanStub));
export { DragListenerFeature };
