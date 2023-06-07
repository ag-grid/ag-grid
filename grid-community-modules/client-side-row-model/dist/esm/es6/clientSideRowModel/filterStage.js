var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Bean, BeanStub } from "@ag-grid-community/core";
let FilterStage = class FilterStage extends BeanStub {
    execute(params) {
        const { changedPath } = params;
        this.filterService.filter(changedPath);
    }
};
__decorate([
    Autowired('filterService')
], FilterStage.prototype, "filterService", void 0);
FilterStage = __decorate([
    Bean('filterStage')
], FilterStage);
export { FilterStage };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsdGVyU3RhZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY2xpZW50U2lkZVJvd01vZGVsL2ZpbHRlclN0YWdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLE9BQU8sRUFDSCxTQUFTLEVBQ1QsSUFBSSxFQUdKLFFBQVEsRUFDWCxNQUFNLHlCQUF5QixDQUFDO0FBS2pDLElBQWEsV0FBVyxHQUF4QixNQUFhLFdBQVksU0FBUSxRQUFRO0lBSTlCLE9BQU8sQ0FBQyxNQUEwQjtRQUNyQyxNQUFNLEVBQUUsV0FBVyxFQUFFLEdBQUcsTUFBTSxDQUFDO1FBQy9CLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLFdBQVksQ0FBQyxDQUFDO0lBQzVDLENBQUM7Q0FDSixDQUFBO0FBTitCO0lBQTNCLFNBQVMsQ0FBQyxlQUFlLENBQUM7a0RBQXNDO0FBRnhELFdBQVc7SUFEdkIsSUFBSSxDQUFDLGFBQWEsQ0FBQztHQUNQLFdBQVcsQ0FRdkI7U0FSWSxXQUFXIn0=