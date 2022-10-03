import { DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { AgGridModule } from '@ag-grid-community/angular';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
    let component: AppComponent;
    let fixture: ComponentFixture<AppComponent>;
    // Get a reference to our quickFilter input
    let quickFilterDE: DebugElement;
    let rowNumberDE: DebugElement;

    beforeEach((async () => {
        TestBed.configureTestingModule({
            declarations: [AppComponent],
            imports: [AgGridModule, FormsModule],
        });

        fixture = TestBed.createComponent(AppComponent);
        component = fixture.componentInstance;
        let compDebugElement = fixture.debugElement;

        // Get a reference to our quickFilter input and rendered template
        quickFilterDE = compDebugElement.query(By.css('#quickFilter'))
        rowNumberDE = compDebugElement.query(By.css('#numberOfRows'))
    }));

    it('should filter rows by quickFilterText using fakeAsync', fakeAsync(() => {

        // When the test starts our test component has been created but not initialised yet.
        // This means our <ag-grid-angular> component has not been created or had data passed to it yet.

        // WARNING: When working with fakeAsync we must ensure our first call to `fixture.detectChanges()` is within our test body and NOT in a beforeEach section!
        // This is vital as it means that during the construction of <ag-grid-component> all async behaviour is correctly patched by fakeAsync
        // If you had a fixture.detectChanges() in your beforeEach then you will find that flush has not impact on your grid async callbacks

        expect(component.grid).toBeUndefined()
        // Our first call to detectChanges, causes the grid to be create and passes the component values to the grid via its Inputs meaning the grid's internal model is setup
        fixture.detectChanges()
        // Grid has now been created
        expect(component.grid.api).toBeDefined()
        // We can test that the internal model of the grid is correct as it has 1000 rows
        // However, at this point Grid callbacks have not been run as they are async. i.e our (modelUpdated) Output has not fired
        validateState({ gridRows: 1000, displayedRows: 0, templateRows: 0 })

        // To have all the async functions run we flush our fakeAsync test environment. This empties the call stack
        flush();
        // So now our component has its displayedRows property updated as the grid callback has been run
        // However, this has not been reflected in our template yet as change detection has not run.
        validateState({ gridRows: 1000, displayedRows: 1000, templateRows: 0 })

        // We now run detectChanges which causes our template to update using the latest values in our component
        fixture.detectChanges()
        // We have now reached our first stable state with consistency between the internal grid model, component data and renderer template output
        validateState({ gridRows: 1000, displayedRows: 1000, templateRows: 1000 })

        // Now let's test that updating the filter text input does filter the grid data.
        // Set the filter to Germany
        quickFilterDE.nativeElement.value = 'Germany'
        quickFilterDE.nativeElement.dispatchEvent(new Event('input'));

        // At this point our text input has been updated but the two way binding [(ngModel)]="quickFilterText" has not been applied
        validateState({ gridRows: 1000, displayedRows: 1000, templateRows: 1000 })

        // We force change detection to run which applies the update to our <ag-grid-angular [quickFilterText] Input.
        fixture.detectChanges()
        // This makes the grid filter its rows, which we can see as now the internal number of rows has been filtered.
        // However, once again, the displayedRows has not been updated yet as the grid schedules callback asynchronously and these are not
        // run until we tell fakeAsync to move forward in time
        validateState({ gridRows: 68, displayedRows: 1000, templateRows: 1000 })

        // We now flush out all the async callbacks
        flush()
        // Our component event handler has now been run and updated its displayedRows value
        validateState({ gridRows: 68, displayedRows: 68, templateRows: 1000 })

        // We now run change detection again so that our template is updated with the latest value from our component
        fixture.detectChanges()
        // We have now reached a stable state and tested that passing a [quickFilterText] to our grid component does correctly filter the rows
        // and update our display correctly with the number of filtered row.
        validateState({ gridRows: 68, displayedRows: 68, templateRows: 68 })

    }))

    // Helper function to validate our internal grid model, component state and the rendered output in our template
    function validateState({ gridRows, displayedRows, templateRows }: { gridRows: number, displayedRows: number, templateRows: number }) {
        expect(component.grid.api).toBeDefined()
        expect(component.grid.api.getDisplayedRowCount()).withContext('api.getDisplayedRowCount').toEqual(gridRows)
        expect(component.displayedRows).withContext('component.displayedRows').toEqual(displayedRows)
        expect(rowNumberDE.nativeElement.innerHTML.trim()).withContext('<div> {{displayedRows}} </div>').toContain(templateRows)
    }

});
