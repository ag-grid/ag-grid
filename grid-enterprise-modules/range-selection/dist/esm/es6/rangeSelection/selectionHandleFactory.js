var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Bean, BeanStub, SelectionHandleType } from "@ag-grid-community/core";
import { RangeHandle } from "./rangeHandle";
import { FillHandle } from "./fillHandle";
let SelectionHandleFactory = class SelectionHandleFactory extends BeanStub {
    createSelectionHandle(type) {
        return this.createBean(type === SelectionHandleType.RANGE ? new RangeHandle() : new FillHandle());
    }
};
SelectionHandleFactory = __decorate([
    Bean('selectionHandleFactory')
], SelectionHandleFactory);
export { SelectionHandleFactory };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VsZWN0aW9uSGFuZGxlRmFjdG9yeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9yYW5nZVNlbGVjdGlvbi9zZWxlY3Rpb25IYW5kbGVGYWN0b3J5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLE9BQU8sRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUE2QyxtQkFBbUIsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ3pILE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDNUMsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUcxQyxJQUFhLHNCQUFzQixHQUFuQyxNQUFhLHNCQUF1QixTQUFRLFFBQVE7SUFDekMscUJBQXFCLENBQUMsSUFBeUI7UUFDbEQsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksS0FBSyxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksVUFBVSxFQUFFLENBQUMsQ0FBQztJQUN0RyxDQUFDO0NBQ0osQ0FBQTtBQUpZLHNCQUFzQjtJQURsQyxJQUFJLENBQUMsd0JBQXdCLENBQUM7R0FDbEIsc0JBQXNCLENBSWxDO1NBSlksc0JBQXNCIn0=