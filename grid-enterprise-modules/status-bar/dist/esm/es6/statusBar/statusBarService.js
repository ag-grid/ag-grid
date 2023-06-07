var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Bean, BeanStub } from '@ag-grid-community/core';
let StatusBarService = class StatusBarService extends BeanStub {
    // tslint:disable-next-line
    constructor() {
        super();
        this.allComponents = {};
    }
    registerStatusPanel(key, component) {
        this.allComponents[key] = component;
    }
    getStatusPanel(key) {
        return this.allComponents[key];
    }
};
StatusBarService = __decorate([
    Bean('statusBarService')
], StatusBarService);
export { StatusBarService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdHVzQmFyU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zdGF0dXNCYXIvc3RhdHVzQmFyU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxPQUFPLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBdUMsTUFBTSx5QkFBeUIsQ0FBQztBQUc5RixJQUFhLGdCQUFnQixHQUE3QixNQUFhLGdCQUFpQixTQUFRLFFBQVE7SUFJMUMsMkJBQTJCO0lBQzNCO1FBQ0ksS0FBSyxFQUFFLENBQUM7UUFKSixrQkFBYSxHQUFzQyxFQUFFLENBQUM7SUFLOUQsQ0FBQztJQUVNLG1CQUFtQixDQUFDLEdBQVcsRUFBRSxTQUEyQjtRQUMvRCxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxHQUFHLFNBQVMsQ0FBQztJQUN4QyxDQUFDO0lBRU0sY0FBYyxDQUFDLEdBQVc7UUFDN0IsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ25DLENBQUM7Q0FDSixDQUFBO0FBaEJZLGdCQUFnQjtJQUQ1QixJQUFJLENBQUMsa0JBQWtCLENBQUM7R0FDWixnQkFBZ0IsQ0FnQjVCO1NBaEJZLGdCQUFnQiJ9