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
import { _, Autowired, Component } from "@ag-grid-community/core";
import { bindCellRendererToHtmlElement } from "./utils";
var RichSelectRow = /** @class */ (function (_super) {
    __extends(RichSelectRow, _super);
    function RichSelectRow(params) {
        var _this = _super.call(this, /* html */ "<div class=\"ag-rich-select-row\" role=\"presentation\"></div>") || this;
        _this.params = params;
        return _this;
    }
    RichSelectRow.prototype.setState = function (value, valueFormatted, selected) {
        var rendererSuccessful = this.populateWithRenderer(value, valueFormatted);
        if (!rendererSuccessful) {
            this.populateWithoutRenderer(value, valueFormatted);
        }
        this.updateSelected(selected);
    };
    RichSelectRow.prototype.updateSelected = function (selected) {
        this.addOrRemoveCssClass('ag-rich-select-row-selected', selected);
    };
    RichSelectRow.prototype.populateWithoutRenderer = function (value, valueFormatted) {
        var valueFormattedExits = valueFormatted !== null && valueFormatted !== undefined;
        var valueToRender = valueFormattedExits ? valueFormatted : value;
        if (_.exists(valueToRender) && valueToRender !== '') {
            // not using innerHTML to prevent injection of HTML
            // https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML#Security_considerations
            this.getGui().textContent = valueToRender.toString();
        }
        else {
            // putting in blank, so if missing, at least the user can click on it
            this.getGui().innerHTML = '&nbsp;';
        }
    };
    RichSelectRow.prototype.populateWithRenderer = function (value, valueFormatted) {
        var _this = this;
        // bad coder here - we are not populating all values of the cellRendererParams
        var params = {
            value: value,
            valueFormatted: valueFormatted,
            api: this.gridOptionsService.api
        };
        var compDetails = this.userComponentFactory.getCellRendererDetails(this.params, params);
        var cellRendererPromise = compDetails ? compDetails.newAgStackInstance() : undefined;
        if (cellRendererPromise != null) {
            bindCellRendererToHtmlElement(cellRendererPromise, this.getGui());
        }
        else {
            this.getGui().innerText = params.valueFormatted != null ? params.valueFormatted : params.value;
        }
        if (cellRendererPromise) {
            cellRendererPromise.then(function (childComponent) {
                _this.addDestroyFunc(function () {
                    _this.getContext().destroyBean(childComponent);
                });
            });
            return true;
        }
        return false;
    };
    __decorate([
        Autowired('userComponentFactory')
    ], RichSelectRow.prototype, "userComponentFactory", void 0);
    return RichSelectRow;
}(Component));
export { RichSelectRow };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmljaFNlbGVjdFJvdy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9yaWNoU2VsZWN0L3JpY2hTZWxlY3RSb3cudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUNILENBQUMsRUFDRCxTQUFTLEVBQ1QsU0FBUyxFQUlaLE1BQU0seUJBQXlCLENBQUM7QUFDakMsT0FBTyxFQUFFLDZCQUE2QixFQUFFLE1BQU0sU0FBUyxDQUFDO0FBRXhEO0lBQW1DLGlDQUFTO0lBTXhDLHVCQUFZLE1BQTZCO1FBQXpDLFlBQ0ksa0JBQU0sVUFBVSxDQUFBLGdFQUE0RCxDQUFDLFNBRWhGO1FBREcsS0FBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7O0lBQ3pCLENBQUM7SUFFTSxnQ0FBUSxHQUFmLFVBQWdCLEtBQVUsRUFBRSxjQUFzQixFQUFFLFFBQWlCO1FBQ2pFLElBQU0sa0JBQWtCLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEtBQUssRUFBRSxjQUFjLENBQUMsQ0FBQztRQUM1RSxJQUFJLENBQUMsa0JBQWtCLEVBQUU7WUFDckIsSUFBSSxDQUFDLHVCQUF1QixDQUFDLEtBQUssRUFBRSxjQUFjLENBQUMsQ0FBQztTQUN2RDtRQUVELElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDbEMsQ0FBQztJQUVNLHNDQUFjLEdBQXJCLFVBQXNCLFFBQWlCO1FBQ25DLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyw2QkFBNkIsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUN0RSxDQUFDO0lBRU8sK0NBQXVCLEdBQS9CLFVBQWdDLEtBQVUsRUFBRSxjQUFzQjtRQUM5RCxJQUFNLG1CQUFtQixHQUFHLGNBQWMsS0FBSyxJQUFJLElBQUksY0FBYyxLQUFLLFNBQVMsQ0FBQztRQUNwRixJQUFNLGFBQWEsR0FBRyxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFFbkUsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxJQUFJLGFBQWEsS0FBSyxFQUFFLEVBQUU7WUFDakQsbURBQW1EO1lBQ25ELDZGQUE2RjtZQUM3RixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsV0FBVyxHQUFHLGFBQWEsQ0FBQyxRQUFRLEVBQUUsQ0FBQztTQUN4RDthQUFNO1lBQ0gscUVBQXFFO1lBQ3JFLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDO1NBQ3RDO0lBQ0wsQ0FBQztJQUVPLDRDQUFvQixHQUE1QixVQUE2QixLQUFVLEVBQUUsY0FBc0I7UUFBL0QsaUJBMEJDO1FBekJHLDhFQUE4RTtRQUM5RSxJQUFNLE1BQU0sR0FBRztZQUNYLEtBQUssRUFBRSxLQUFLO1lBQ1osY0FBYyxFQUFFLGNBQWM7WUFDOUIsR0FBRyxFQUFFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHO1NBQ1osQ0FBQztRQUV6QixJQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztRQUMxRixJQUFNLG1CQUFtQixHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLGtCQUFrQixFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUV2RixJQUFJLG1CQUFtQixJQUFJLElBQUksRUFBRTtZQUM3Qiw2QkFBNkIsQ0FBQyxtQkFBbUIsRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztTQUNyRTthQUFNO1lBQ0gsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsY0FBYyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQztTQUNsRztRQUVELElBQUksbUJBQW1CLEVBQUU7WUFDckIsbUJBQW1CLENBQUMsSUFBSSxDQUFDLFVBQUEsY0FBYztnQkFDbkMsS0FBSSxDQUFDLGNBQWMsQ0FBQztvQkFDaEIsS0FBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLFdBQVcsQ0FBQyxjQUFjLENBQUMsQ0FBQztnQkFDbEQsQ0FBQyxDQUFDLENBQUM7WUFDUCxDQUFDLENBQUMsQ0FBQztZQUNILE9BQU8sSUFBSSxDQUFDO1NBQ2Y7UUFDRCxPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBOURrQztRQUFsQyxTQUFTLENBQUMsc0JBQXNCLENBQUM7K0RBQW9EO0lBZ0UxRixvQkFBQztDQUFBLEFBbEVELENBQW1DLFNBQVMsR0FrRTNDO1NBbEVZLGFBQWEifQ==