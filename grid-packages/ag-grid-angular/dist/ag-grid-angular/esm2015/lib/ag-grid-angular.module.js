var AgGridModule_1;
import { __decorate } from "tslib";
import { ANALYZE_FOR_ENTRY_COMPONENTS, NgModule } from '@angular/core';
import { AgGridAngular } from './ag-grid-angular.component';
import { AgGridColumn } from './ag-grid-column.component';
let AgGridModule = AgGridModule_1 = class AgGridModule {
    /**
     * If you are using Angular v9+, with Ivy enabled, you **do not** need to pass your components to the `AgGridModules` via this method.
     * They will automatically be resolved by Angular.
    */
    static withComponents(components) {
        return {
            ngModule: AgGridModule_1,
            providers: [
                { provide: ANALYZE_FOR_ENTRY_COMPONENTS, useValue: components, multi: true }
            ],
        };
    }
    /**
     * If you are using Angular v9+, with Ivy enabled, you **do not** need to pass your components to the `AgGridModules` via this method.
     * They will automatically be resolved by Angular.
    */
    static forRoot(components) {
        return {
            ngModule: AgGridModule_1,
            providers: [
                { provide: ANALYZE_FOR_ENTRY_COMPONENTS, useValue: components, multi: true }
            ],
        };
    }
};
AgGridModule = AgGridModule_1 = __decorate([
    NgModule({
        declarations: [AgGridAngular, AgGridColumn],
        imports: [],
        exports: [AgGridAngular, AgGridColumn]
    })
], AgGridModule);
export { AgGridModule };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWctZ3JpZC1hbmd1bGFyLm1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL2FnLWdyaWQtYW5ndWxhci8iLCJzb3VyY2VzIjpbImxpYi9hZy1ncmlkLWFuZ3VsYXIubW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsT0FBTyxFQUFFLDRCQUE0QixFQUF1QixRQUFRLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFNUYsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQzVELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQU8xRCxJQUFhLFlBQVksb0JBQXpCLE1BQWEsWUFBWTtJQUVyQjs7O01BR0U7SUFDRixNQUFNLENBQUMsY0FBYyxDQUFDLFVBQWdCO1FBQ2xDLE9BQU87WUFDSCxRQUFRLEVBQUUsY0FBWTtZQUN0QixTQUFTLEVBQUU7Z0JBQ1AsRUFBRSxPQUFPLEVBQUUsNEJBQTRCLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFO2FBQy9FO1NBQ0osQ0FBQztJQUNOLENBQUM7SUFFRDs7O01BR0U7SUFDRixNQUFNLENBQUMsT0FBTyxDQUFDLFVBQWdCO1FBQzNCLE9BQU87WUFDSCxRQUFRLEVBQUUsY0FBWTtZQUN0QixTQUFTLEVBQUU7Z0JBQ1AsRUFBRSxPQUFPLEVBQUUsNEJBQTRCLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFO2FBQy9FO1NBQ0osQ0FBQztJQUNOLENBQUM7Q0FFSixDQUFBO0FBNUJZLFlBQVk7SUFMeEIsUUFBUSxDQUFDO1FBQ04sWUFBWSxFQUFFLENBQUMsYUFBYSxFQUFFLFlBQVksQ0FBQztRQUMzQyxPQUFPLEVBQUUsRUFBRTtRQUNYLE9BQU8sRUFBRSxDQUFDLGFBQWEsRUFBRSxZQUFZLENBQUM7S0FDekMsQ0FBQztHQUNXLFlBQVksQ0E0QnhCO1NBNUJZLFlBQVkiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBTkFMWVpFX0ZPUl9FTlRSWV9DT01QT05FTlRTLCBNb2R1bGVXaXRoUHJvdmlkZXJzLCBOZ01vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBBZ0dyaWRBbmd1bGFyIH0gZnJvbSAnLi9hZy1ncmlkLWFuZ3VsYXIuY29tcG9uZW50JztcbmltcG9ydCB7IEFnR3JpZENvbHVtbiB9IGZyb20gJy4vYWctZ3JpZC1jb2x1bW4uY29tcG9uZW50JztcblxuQE5nTW9kdWxlKHtcbiAgICBkZWNsYXJhdGlvbnM6IFtBZ0dyaWRBbmd1bGFyLCBBZ0dyaWRDb2x1bW5dLFxuICAgIGltcG9ydHM6IFtdLFxuICAgIGV4cG9ydHM6IFtBZ0dyaWRBbmd1bGFyLCBBZ0dyaWRDb2x1bW5dXG59KVxuZXhwb3J0IGNsYXNzIEFnR3JpZE1vZHVsZSB7XG5cbiAgICAvKiogXG4gICAgICogSWYgeW91IGFyZSB1c2luZyBBbmd1bGFyIHY5Kywgd2l0aCBJdnkgZW5hYmxlZCwgeW91ICoqZG8gbm90KiogbmVlZCB0byBwYXNzIHlvdXIgY29tcG9uZW50cyB0byB0aGUgYEFnR3JpZE1vZHVsZXNgIHZpYSB0aGlzIG1ldGhvZC4gXG4gICAgICogVGhleSB3aWxsIGF1dG9tYXRpY2FsbHkgYmUgcmVzb2x2ZWQgYnkgQW5ndWxhci5cbiAgICAqL1xuICAgIHN0YXRpYyB3aXRoQ29tcG9uZW50cyhjb21wb25lbnRzPzogYW55KTogTW9kdWxlV2l0aFByb3ZpZGVyczxhbnk+IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIG5nTW9kdWxlOiBBZ0dyaWRNb2R1bGUsXG4gICAgICAgICAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgICAgICAgICB7IHByb3ZpZGU6IEFOQUxZWkVfRk9SX0VOVFJZX0NPTVBPTkVOVFMsIHVzZVZhbHVlOiBjb21wb25lbnRzLCBtdWx0aTogdHJ1ZSB9XG4gICAgICAgICAgICBdLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8qKiBcbiAgICAgKiBJZiB5b3UgYXJlIHVzaW5nIEFuZ3VsYXIgdjkrLCB3aXRoIEl2eSBlbmFibGVkLCB5b3UgKipkbyBub3QqKiBuZWVkIHRvIHBhc3MgeW91ciBjb21wb25lbnRzIHRvIHRoZSBgQWdHcmlkTW9kdWxlc2AgdmlhIHRoaXMgbWV0aG9kLiBcbiAgICAgKiBUaGV5IHdpbGwgYXV0b21hdGljYWxseSBiZSByZXNvbHZlZCBieSBBbmd1bGFyLlxuICAgICovXG4gICAgc3RhdGljIGZvclJvb3QoY29tcG9uZW50cz86IGFueSk6IE1vZHVsZVdpdGhQcm92aWRlcnM8YW55PiB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBuZ01vZHVsZTogQWdHcmlkTW9kdWxlLFxuICAgICAgICAgICAgcHJvdmlkZXJzOiBbXG4gICAgICAgICAgICAgICAgeyBwcm92aWRlOiBBTkFMWVpFX0ZPUl9FTlRSWV9DT01QT05FTlRTLCB1c2VWYWx1ZTogY29tcG9uZW50cywgbXVsdGk6IHRydWUgfVxuICAgICAgICAgICAgXSxcbiAgICAgICAgfTtcbiAgICB9XG5cbn1cbiJdfQ==