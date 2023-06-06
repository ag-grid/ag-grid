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
import { Component, RefSelector } from '@ag-grid-community/core';
var NameValueComp = /** @class */ (function (_super) {
    __extends(NameValueComp, _super);
    function NameValueComp() {
        return _super.call(this, NameValueComp.TEMPLATE) || this;
    }
    NameValueComp.prototype.setLabel = function (key, defaultValue) {
        // we want to hide until the first value comes in
        this.setDisplayed(false);
        var localeTextFunc = this.localeService.getLocaleTextFunc();
        this.eLabel.innerHTML = localeTextFunc(key, defaultValue);
    };
    NameValueComp.prototype.setValue = function (value) {
        this.eValue.innerHTML = value;
    };
    NameValueComp.TEMPLATE = "<div class=\"ag-status-name-value\">\n            <span ref=\"eLabel\"></span>:&nbsp;\n            <span ref=\"eValue\" class=\"ag-status-name-value-value\"></span>\n        </div>";
    __decorate([
        RefSelector('eLabel')
    ], NameValueComp.prototype, "eLabel", void 0);
    __decorate([
        RefSelector('eValue')
    ], NameValueComp.prototype, "eValue", void 0);
    return NameValueComp;
}(Component));
export { NameValueComp };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmFtZVZhbHVlQ29tcC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9zdGF0dXNCYXIvcHJvdmlkZWRQYW5lbHMvbmFtZVZhbHVlQ29tcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBRWpFO0lBQW1DLGlDQUFTO0lBV3hDO2VBQ0ksa0JBQU0sYUFBYSxDQUFDLFFBQVEsQ0FBQztJQUNqQyxDQUFDO0lBRU0sZ0NBQVEsR0FBZixVQUFnQixHQUFXLEVBQUUsWUFBb0I7UUFDN0MsaURBQWlEO1FBQ2pELElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFekIsSUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBQzlELElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxHQUFHLGNBQWMsQ0FBQyxHQUFHLEVBQUUsWUFBWSxDQUFDLENBQUM7SUFDOUQsQ0FBQztJQUVNLGdDQUFRLEdBQWYsVUFBZ0IsS0FBVTtRQUN0QixJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7SUFDbEMsQ0FBQztJQXZCYyxzQkFBUSxHQUNuQixzTEFHTyxDQUFDO0lBRVc7UUFBdEIsV0FBVyxDQUFDLFFBQVEsQ0FBQztpREFBNkI7SUFDNUI7UUFBdEIsV0FBVyxDQUFDLFFBQVEsQ0FBQztpREFBNkI7SUFpQnZELG9CQUFDO0NBQUEsQUExQkQsQ0FBbUMsU0FBUyxHQTBCM0M7U0ExQlksYUFBYSJ9