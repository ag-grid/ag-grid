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
import { Bean, BeanStub } from '@ag-grid-community/core';
var StatusBarService = /** @class */ (function (_super) {
    __extends(StatusBarService, _super);
    // tslint:disable-next-line
    function StatusBarService() {
        var _this = _super.call(this) || this;
        _this.allComponents = {};
        return _this;
    }
    StatusBarService.prototype.registerStatusPanel = function (key, component) {
        this.allComponents[key] = component;
    };
    StatusBarService.prototype.getStatusPanel = function (key) {
        return this.allComponents[key];
    };
    StatusBarService = __decorate([
        Bean('statusBarService')
    ], StatusBarService);
    return StatusBarService;
}(BeanStub));
export { StatusBarService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdHVzQmFyU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zdGF0dXNCYXIvc3RhdHVzQmFyU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxPQUFPLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBdUMsTUFBTSx5QkFBeUIsQ0FBQztBQUc5RjtJQUFzQyxvQ0FBUTtJQUkxQywyQkFBMkI7SUFDM0I7UUFBQSxZQUNJLGlCQUFPLFNBQ1Y7UUFMTyxtQkFBYSxHQUFzQyxFQUFFLENBQUM7O0lBSzlELENBQUM7SUFFTSw4Q0FBbUIsR0FBMUIsVUFBMkIsR0FBVyxFQUFFLFNBQTJCO1FBQy9ELElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLEdBQUcsU0FBUyxDQUFDO0lBQ3hDLENBQUM7SUFFTSx5Q0FBYyxHQUFyQixVQUFzQixHQUFXO1FBQzdCLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNuQyxDQUFDO0lBZlEsZ0JBQWdCO1FBRDVCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQztPQUNaLGdCQUFnQixDQWdCNUI7SUFBRCx1QkFBQztDQUFBLEFBaEJELENBQXNDLFFBQVEsR0FnQjdDO1NBaEJZLGdCQUFnQiJ9