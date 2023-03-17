import { ANALYZE_FOR_ENTRY_COMPONENTS, NgModule } from '@angular/core';
import { AgGridAngular } from './ag-grid-angular.component';
export class AgGridModule {
    /**
     * If you are using Angular v9+, with Ivy enabled, you **do not** need to pass your components to the `AgGridModules` via this method.
     * They will automatically be resolved by Angular.
    */
    static withComponents(components) {
        return {
            ngModule: AgGridModule,
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
            ngModule: AgGridModule,
            providers: [
                { provide: ANALYZE_FOR_ENTRY_COMPONENTS, useValue: components, multi: true }
            ],
        };
    }
}
AgGridModule.decorators = [
    { type: NgModule, args: [{
                declarations: [AgGridAngular],
                exports: [AgGridAngular]
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWctZ3JpZC1hbmd1bGFyLm1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvc2VhbmxhbmRzbWFuL2Rldi9hZy1ncmlkLzI5LjIuMC9ncmlkLWNvbW11bml0eS1tb2R1bGVzL2FuZ3VsYXItbGVnYWN5L3Byb2plY3RzL2FnLWdyaWQtYW5ndWxhci9zcmMvIiwic291cmNlcyI6WyJsaWIvYWctZ3JpZC1hbmd1bGFyLm1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsNEJBQTRCLEVBQXVCLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUU1RixPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFNNUQsTUFBTSxPQUFPLFlBQVk7SUFFckI7OztNQUdFO0lBQ0YsTUFBTSxDQUFDLGNBQWMsQ0FBQyxVQUFnQjtRQUNsQyxPQUFPO1lBQ0gsUUFBUSxFQUFFLFlBQVk7WUFDdEIsU0FBUyxFQUFFO2dCQUNQLEVBQUUsT0FBTyxFQUFFLDRCQUE0QixFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRTthQUMvRTtTQUNKLENBQUM7SUFDTixDQUFDO0lBRUQ7OztNQUdFO0lBQ0YsTUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFnQjtRQUMzQixPQUFPO1lBQ0gsUUFBUSxFQUFFLFlBQVk7WUFDdEIsU0FBUyxFQUFFO2dCQUNQLEVBQUUsT0FBTyxFQUFFLDRCQUE0QixFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRTthQUMvRTtTQUNKLENBQUM7SUFDTixDQUFDOzs7WUE5QkosUUFBUSxTQUFDO2dCQUNOLFlBQVksRUFBRSxDQUFDLGFBQWEsQ0FBQztnQkFDN0IsT0FBTyxFQUFFLENBQUMsYUFBYSxDQUFDO2FBQzNCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQU5BTFlaRV9GT1JfRU5UUllfQ09NUE9ORU5UUywgTW9kdWxlV2l0aFByb3ZpZGVycywgTmdNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgQWdHcmlkQW5ndWxhciB9IGZyb20gJy4vYWctZ3JpZC1hbmd1bGFyLmNvbXBvbmVudCc7XG5cbkBOZ01vZHVsZSh7XG4gICAgZGVjbGFyYXRpb25zOiBbQWdHcmlkQW5ndWxhcl0sXG4gICAgZXhwb3J0czogW0FnR3JpZEFuZ3VsYXJdXG59KVxuZXhwb3J0IGNsYXNzIEFnR3JpZE1vZHVsZSB7XG5cbiAgICAvKiogXG4gICAgICogSWYgeW91IGFyZSB1c2luZyBBbmd1bGFyIHY5Kywgd2l0aCBJdnkgZW5hYmxlZCwgeW91ICoqZG8gbm90KiogbmVlZCB0byBwYXNzIHlvdXIgY29tcG9uZW50cyB0byB0aGUgYEFnR3JpZE1vZHVsZXNgIHZpYSB0aGlzIG1ldGhvZC4gXG4gICAgICogVGhleSB3aWxsIGF1dG9tYXRpY2FsbHkgYmUgcmVzb2x2ZWQgYnkgQW5ndWxhci5cbiAgICAqL1xuICAgIHN0YXRpYyB3aXRoQ29tcG9uZW50cyhjb21wb25lbnRzPzogYW55KTogTW9kdWxlV2l0aFByb3ZpZGVyczxhbnk+IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIG5nTW9kdWxlOiBBZ0dyaWRNb2R1bGUsXG4gICAgICAgICAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgICAgICAgICB7IHByb3ZpZGU6IEFOQUxZWkVfRk9SX0VOVFJZX0NPTVBPTkVOVFMsIHVzZVZhbHVlOiBjb21wb25lbnRzLCBtdWx0aTogdHJ1ZSB9XG4gICAgICAgICAgICBdLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8qKiBcbiAgICAgKiBJZiB5b3UgYXJlIHVzaW5nIEFuZ3VsYXIgdjkrLCB3aXRoIEl2eSBlbmFibGVkLCB5b3UgKipkbyBub3QqKiBuZWVkIHRvIHBhc3MgeW91ciBjb21wb25lbnRzIHRvIHRoZSBgQWdHcmlkTW9kdWxlc2AgdmlhIHRoaXMgbWV0aG9kLiBcbiAgICAgKiBUaGV5IHdpbGwgYXV0b21hdGljYWxseSBiZSByZXNvbHZlZCBieSBBbmd1bGFyLlxuICAgICovXG4gICAgc3RhdGljIGZvclJvb3QoY29tcG9uZW50cz86IGFueSk6IE1vZHVsZVdpdGhQcm92aWRlcnM8YW55PiB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBuZ01vZHVsZTogQWdHcmlkTW9kdWxlLFxuICAgICAgICAgICAgcHJvdmlkZXJzOiBbXG4gICAgICAgICAgICAgICAgeyBwcm92aWRlOiBBTkFMWVpFX0ZPUl9FTlRSWV9DT01QT05FTlRTLCB1c2VWYWx1ZTogY29tcG9uZW50cywgbXVsdGk6IHRydWUgfVxuICAgICAgICAgICAgXSxcbiAgICAgICAgfTtcbiAgICB9XG5cbn1cbiJdfQ==