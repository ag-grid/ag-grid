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
import { Bean, BeanStub, SelectionHandleType } from "@ag-grid-community/core";
import { RangeHandle } from "./rangeHandle";
import { FillHandle } from "./fillHandle";
var SelectionHandleFactory = /** @class */ (function (_super) {
    __extends(SelectionHandleFactory, _super);
    function SelectionHandleFactory() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SelectionHandleFactory.prototype.createSelectionHandle = function (type) {
        if (type === SelectionHandleType.RANGE) {
            return this.createBean(new RangeHandle());
        }
        return this.createBean(new FillHandle());
    };
    SelectionHandleFactory = __decorate([
        Bean('selectionHandleFactory')
    ], SelectionHandleFactory);
    return SelectionHandleFactory;
}(BeanStub));
export { SelectionHandleFactory };
