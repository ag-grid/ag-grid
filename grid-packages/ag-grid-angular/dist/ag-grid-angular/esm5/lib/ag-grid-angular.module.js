import { __decorate } from "tslib";
import { ANALYZE_FOR_ENTRY_COMPONENTS, NgModule } from '@angular/core';
import { AgGridAngular } from './ag-grid-angular.component';
import { AgGridColumn } from './ag-grid-column.component';
var AgGridModule = /** @class */ (function () {
    function AgGridModule() {
    }
    AgGridModule_1 = AgGridModule;
    /**
     * If you are using Angular v9+, with Ivy enabled, you **do not** need to pass your components to the `AgGridModules` via this method.
     * They will automatically be resolved by Angular.
    */
    AgGridModule.withComponents = function (components) {
        return {
            ngModule: AgGridModule_1,
            providers: [
                { provide: ANALYZE_FOR_ENTRY_COMPONENTS, useValue: components, multi: true }
            ],
        };
    };
    /**
     * If you are using Angular v9+, with Ivy enabled, you **do not** need to pass your components to the `AgGridModules` via this method.
     * They will automatically be resolved by Angular.
    */
    AgGridModule.forRoot = function (components) {
        return {
            ngModule: AgGridModule_1,
            providers: [
                { provide: ANALYZE_FOR_ENTRY_COMPONENTS, useValue: components, multi: true }
            ],
        };
    };
    var AgGridModule_1;
    AgGridModule = AgGridModule_1 = __decorate([
        NgModule({
            declarations: [AgGridAngular, AgGridColumn],
            imports: [],
            exports: [AgGridAngular, AgGridColumn]
        })
    ], AgGridModule);
    return AgGridModule;
}());
export { AgGridModule };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWctZ3JpZC1hbmd1bGFyLm1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL2FnLWdyaWQtYW5ndWxhci8iLCJzb3VyY2VzIjpbImxpYi9hZy1ncmlkLWFuZ3VsYXIubW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsNEJBQTRCLEVBQXVCLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUU1RixPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDNUQsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBTzFEO0lBQUE7SUE0QkEsQ0FBQztxQkE1QlksWUFBWTtJQUVyQjs7O01BR0U7SUFDSywyQkFBYyxHQUFyQixVQUFzQixVQUFnQjtRQUNsQyxPQUFPO1lBQ0gsUUFBUSxFQUFFLGNBQVk7WUFDdEIsU0FBUyxFQUFFO2dCQUNQLEVBQUUsT0FBTyxFQUFFLDRCQUE0QixFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRTthQUMvRTtTQUNKLENBQUM7SUFDTixDQUFDO0lBRUQ7OztNQUdFO0lBQ0ssb0JBQU8sR0FBZCxVQUFlLFVBQWdCO1FBQzNCLE9BQU87WUFDSCxRQUFRLEVBQUUsY0FBWTtZQUN0QixTQUFTLEVBQUU7Z0JBQ1AsRUFBRSxPQUFPLEVBQUUsNEJBQTRCLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFO2FBQy9FO1NBQ0osQ0FBQztJQUNOLENBQUM7O0lBMUJRLFlBQVk7UUFMeEIsUUFBUSxDQUFDO1lBQ04sWUFBWSxFQUFFLENBQUMsYUFBYSxFQUFFLFlBQVksQ0FBQztZQUMzQyxPQUFPLEVBQUUsRUFBRTtZQUNYLE9BQU8sRUFBRSxDQUFDLGFBQWEsRUFBRSxZQUFZLENBQUM7U0FDekMsQ0FBQztPQUNXLFlBQVksQ0E0QnhCO0lBQUQsbUJBQUM7Q0FBQSxBQTVCRCxJQTRCQztTQTVCWSxZQUFZIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQU5BTFlaRV9GT1JfRU5UUllfQ09NUE9ORU5UUywgTW9kdWxlV2l0aFByb3ZpZGVycywgTmdNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgQWdHcmlkQW5ndWxhciB9IGZyb20gJy4vYWctZ3JpZC1hbmd1bGFyLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBBZ0dyaWRDb2x1bW4gfSBmcm9tICcuL2FnLWdyaWQtY29sdW1uLmNvbXBvbmVudCc7XG5cbkBOZ01vZHVsZSh7XG4gICAgZGVjbGFyYXRpb25zOiBbQWdHcmlkQW5ndWxhciwgQWdHcmlkQ29sdW1uXSxcbiAgICBpbXBvcnRzOiBbXSxcbiAgICBleHBvcnRzOiBbQWdHcmlkQW5ndWxhciwgQWdHcmlkQ29sdW1uXVxufSlcbmV4cG9ydCBjbGFzcyBBZ0dyaWRNb2R1bGUge1xuXG4gICAgLyoqIFxuICAgICAqIElmIHlvdSBhcmUgdXNpbmcgQW5ndWxhciB2OSssIHdpdGggSXZ5IGVuYWJsZWQsIHlvdSAqKmRvIG5vdCoqIG5lZWQgdG8gcGFzcyB5b3VyIGNvbXBvbmVudHMgdG8gdGhlIGBBZ0dyaWRNb2R1bGVzYCB2aWEgdGhpcyBtZXRob2QuIFxuICAgICAqIFRoZXkgd2lsbCBhdXRvbWF0aWNhbGx5IGJlIHJlc29sdmVkIGJ5IEFuZ3VsYXIuXG4gICAgKi9cbiAgICBzdGF0aWMgd2l0aENvbXBvbmVudHMoY29tcG9uZW50cz86IGFueSk6IE1vZHVsZVdpdGhQcm92aWRlcnM8YW55PiB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBuZ01vZHVsZTogQWdHcmlkTW9kdWxlLFxuICAgICAgICAgICAgcHJvdmlkZXJzOiBbXG4gICAgICAgICAgICAgICAgeyBwcm92aWRlOiBBTkFMWVpFX0ZPUl9FTlRSWV9DT01QT05FTlRTLCB1c2VWYWx1ZTogY29tcG9uZW50cywgbXVsdGk6IHRydWUgfVxuICAgICAgICAgICAgXSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvKiogXG4gICAgICogSWYgeW91IGFyZSB1c2luZyBBbmd1bGFyIHY5Kywgd2l0aCBJdnkgZW5hYmxlZCwgeW91ICoqZG8gbm90KiogbmVlZCB0byBwYXNzIHlvdXIgY29tcG9uZW50cyB0byB0aGUgYEFnR3JpZE1vZHVsZXNgIHZpYSB0aGlzIG1ldGhvZC4gXG4gICAgICogVGhleSB3aWxsIGF1dG9tYXRpY2FsbHkgYmUgcmVzb2x2ZWQgYnkgQW5ndWxhci5cbiAgICAqL1xuICAgIHN0YXRpYyBmb3JSb290KGNvbXBvbmVudHM/OiBhbnkpOiBNb2R1bGVXaXRoUHJvdmlkZXJzPGFueT4ge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbmdNb2R1bGU6IEFnR3JpZE1vZHVsZSxcbiAgICAgICAgICAgIHByb3ZpZGVyczogW1xuICAgICAgICAgICAgICAgIHsgcHJvdmlkZTogQU5BTFlaRV9GT1JfRU5UUllfQ09NUE9ORU5UUywgdXNlVmFsdWU6IGNvbXBvbmVudHMsIG11bHRpOiB0cnVlIH1cbiAgICAgICAgICAgIF0sXG4gICAgICAgIH07XG4gICAgfVxuXG59XG4iXX0=