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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWctZ3JpZC1hbmd1bGFyLm1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvc2VhbmxhbmRzbWFuL2Rldi9hZy1ncmlkLzI5LjEuMC9jb21tdW5pdHktbW9kdWxlcy9hbmd1bGFyLWxlZ2FjeS9wcm9qZWN0cy9hZy1ncmlkLWFuZ3VsYXIvc3JjLyIsInNvdXJjZXMiOlsibGliL2FnLWdyaWQtYW5ndWxhci5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLDRCQUE0QixFQUF1QixRQUFRLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFNUYsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBTTVELE1BQU0sT0FBTyxZQUFZO0lBRXJCOzs7TUFHRTtJQUNGLE1BQU0sQ0FBQyxjQUFjLENBQUMsVUFBZ0I7UUFDbEMsT0FBTztZQUNILFFBQVEsRUFBRSxZQUFZO1lBQ3RCLFNBQVMsRUFBRTtnQkFDUCxFQUFFLE9BQU8sRUFBRSw0QkFBNEIsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUU7YUFDL0U7U0FDSixDQUFDO0lBQ04sQ0FBQztJQUVEOzs7TUFHRTtJQUNGLE1BQU0sQ0FBQyxPQUFPLENBQUMsVUFBZ0I7UUFDM0IsT0FBTztZQUNILFFBQVEsRUFBRSxZQUFZO1lBQ3RCLFNBQVMsRUFBRTtnQkFDUCxFQUFFLE9BQU8sRUFBRSw0QkFBNEIsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUU7YUFDL0U7U0FDSixDQUFDO0lBQ04sQ0FBQzs7O1lBOUJKLFFBQVEsU0FBQztnQkFDTixZQUFZLEVBQUUsQ0FBQyxhQUFhLENBQUM7Z0JBQzdCLE9BQU8sRUFBRSxDQUFDLGFBQWEsQ0FBQzthQUMzQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFOQUxZWkVfRk9SX0VOVFJZX0NPTVBPTkVOVFMsIE1vZHVsZVdpdGhQcm92aWRlcnMsIE5nTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IEFnR3JpZEFuZ3VsYXIgfSBmcm9tICcuL2FnLWdyaWQtYW5ndWxhci5jb21wb25lbnQnO1xuXG5ATmdNb2R1bGUoe1xuICAgIGRlY2xhcmF0aW9uczogW0FnR3JpZEFuZ3VsYXJdLFxuICAgIGV4cG9ydHM6IFtBZ0dyaWRBbmd1bGFyXVxufSlcbmV4cG9ydCBjbGFzcyBBZ0dyaWRNb2R1bGUge1xuXG4gICAgLyoqIFxuICAgICAqIElmIHlvdSBhcmUgdXNpbmcgQW5ndWxhciB2OSssIHdpdGggSXZ5IGVuYWJsZWQsIHlvdSAqKmRvIG5vdCoqIG5lZWQgdG8gcGFzcyB5b3VyIGNvbXBvbmVudHMgdG8gdGhlIGBBZ0dyaWRNb2R1bGVzYCB2aWEgdGhpcyBtZXRob2QuIFxuICAgICAqIFRoZXkgd2lsbCBhdXRvbWF0aWNhbGx5IGJlIHJlc29sdmVkIGJ5IEFuZ3VsYXIuXG4gICAgKi9cbiAgICBzdGF0aWMgd2l0aENvbXBvbmVudHMoY29tcG9uZW50cz86IGFueSk6IE1vZHVsZVdpdGhQcm92aWRlcnM8YW55PiB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBuZ01vZHVsZTogQWdHcmlkTW9kdWxlLFxuICAgICAgICAgICAgcHJvdmlkZXJzOiBbXG4gICAgICAgICAgICAgICAgeyBwcm92aWRlOiBBTkFMWVpFX0ZPUl9FTlRSWV9DT01QT05FTlRTLCB1c2VWYWx1ZTogY29tcG9uZW50cywgbXVsdGk6IHRydWUgfVxuICAgICAgICAgICAgXSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvKiogXG4gICAgICogSWYgeW91IGFyZSB1c2luZyBBbmd1bGFyIHY5Kywgd2l0aCBJdnkgZW5hYmxlZCwgeW91ICoqZG8gbm90KiogbmVlZCB0byBwYXNzIHlvdXIgY29tcG9uZW50cyB0byB0aGUgYEFnR3JpZE1vZHVsZXNgIHZpYSB0aGlzIG1ldGhvZC4gXG4gICAgICogVGhleSB3aWxsIGF1dG9tYXRpY2FsbHkgYmUgcmVzb2x2ZWQgYnkgQW5ndWxhci5cbiAgICAqL1xuICAgIHN0YXRpYyBmb3JSb290KGNvbXBvbmVudHM/OiBhbnkpOiBNb2R1bGVXaXRoUHJvdmlkZXJzPGFueT4ge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbmdNb2R1bGU6IEFnR3JpZE1vZHVsZSxcbiAgICAgICAgICAgIHByb3ZpZGVyczogW1xuICAgICAgICAgICAgICAgIHsgcHJvdmlkZTogQU5BTFlaRV9GT1JfRU5UUllfQ09NUE9ORU5UUywgdXNlVmFsdWU6IGNvbXBvbmVudHMsIG11bHRpOiB0cnVlIH1cbiAgICAgICAgICAgIF0sXG4gICAgICAgIH07XG4gICAgfVxuXG59XG4iXX0=