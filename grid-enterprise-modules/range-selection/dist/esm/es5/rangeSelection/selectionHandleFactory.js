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
import { Bean, BeanStub, SelectionHandleType } from "@ag-grid-community/core";
import { RangeHandle } from "./rangeHandle";
import { FillHandle } from "./fillHandle";
var SelectionHandleFactory = /** @class */ (function (_super) {
    __extends(SelectionHandleFactory, _super);
    function SelectionHandleFactory() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SelectionHandleFactory.prototype.createSelectionHandle = function (type) {
        return this.createBean(type === SelectionHandleType.RANGE ? new RangeHandle() : new FillHandle());
    };
    SelectionHandleFactory = __decorate([
        Bean('selectionHandleFactory')
    ], SelectionHandleFactory);
    return SelectionHandleFactory;
}(BeanStub));
export { SelectionHandleFactory };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VsZWN0aW9uSGFuZGxlRmFjdG9yeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9yYW5nZVNlbGVjdGlvbi9zZWxlY3Rpb25IYW5kbGVGYWN0b3J5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUE2QyxtQkFBbUIsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ3pILE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDNUMsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUcxQztJQUE0QywwQ0FBUTtJQUFwRDs7SUFJQSxDQUFDO0lBSFUsc0RBQXFCLEdBQTVCLFVBQTZCLElBQXlCO1FBQ2xELE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEtBQUssbUJBQW1CLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLFVBQVUsRUFBRSxDQUFDLENBQUM7SUFDdEcsQ0FBQztJQUhRLHNCQUFzQjtRQURsQyxJQUFJLENBQUMsd0JBQXdCLENBQUM7T0FDbEIsc0JBQXNCLENBSWxDO0lBQUQsNkJBQUM7Q0FBQSxBQUpELENBQTRDLFFBQVEsR0FJbkQ7U0FKWSxzQkFBc0IifQ==