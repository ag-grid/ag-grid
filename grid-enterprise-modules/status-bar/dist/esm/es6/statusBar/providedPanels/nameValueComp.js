var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Component, RefSelector } from '@ag-grid-community/core';
export class NameValueComp extends Component {
    constructor() {
        super(NameValueComp.TEMPLATE);
    }
    setLabel(key, defaultValue) {
        // we want to hide until the first value comes in
        this.setDisplayed(false);
        const localeTextFunc = this.localeService.getLocaleTextFunc();
        this.eLabel.innerHTML = localeTextFunc(key, defaultValue);
    }
    setValue(value) {
        this.eValue.innerHTML = value;
    }
}
NameValueComp.TEMPLATE = `<div class="ag-status-name-value">
            <span ref="eLabel"></span>:&nbsp;
            <span ref="eValue" class="ag-status-name-value-value"></span>
        </div>`;
__decorate([
    RefSelector('eLabel')
], NameValueComp.prototype, "eLabel", void 0);
__decorate([
    RefSelector('eValue')
], NameValueComp.prototype, "eValue", void 0);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmFtZVZhbHVlQ29tcC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9zdGF0dXNCYXIvcHJvdmlkZWRQYW5lbHMvbmFtZVZhbHVlQ29tcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBRWpFLE1BQU0sT0FBTyxhQUFjLFNBQVEsU0FBUztJQVd4QztRQUNJLEtBQUssQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDbEMsQ0FBQztJQUVNLFFBQVEsQ0FBQyxHQUFXLEVBQUUsWUFBb0I7UUFDN0MsaURBQWlEO1FBQ2pELElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFekIsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBQzlELElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxHQUFHLGNBQWMsQ0FBQyxHQUFHLEVBQUUsWUFBWSxDQUFDLENBQUM7SUFDOUQsQ0FBQztJQUVNLFFBQVEsQ0FBQyxLQUFVO1FBQ3RCLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztJQUNsQyxDQUFDOztBQXZCYyxzQkFBUSxHQUNuQjs7O2VBR08sQ0FBQztBQUVXO0lBQXRCLFdBQVcsQ0FBQyxRQUFRLENBQUM7NkNBQTZCO0FBQzVCO0lBQXRCLFdBQVcsQ0FBQyxRQUFRLENBQUM7NkNBQTZCIn0=