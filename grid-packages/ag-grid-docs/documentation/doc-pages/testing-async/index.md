---
title: "Testing Async"
frameworks: ["angular"]
---

 We will walk through an example that tests asynchronous grid code as part of your Angular application,
 using default build tools provided when using the [Angular CLI](https://cli.angular.io/).

 ## Application To Test

The examples below test that text entered into the filter box uses the [Quick Filter](/filter-quick) to filter grid rows. The test will also validate that the filtered row count is correctly updated in the component template.

The filter value uses two way data binding, via `[(ngModel)]=quickFilterText`, to update the quick filter text property that is bound to the grid Input `[quickFilterText]`.

```html
<input type="text" id="quickFilter" [(ngModel)]="quickFilterText">
<div id="numberOfRows">Number of rows: {{displayedRows}}</div>

<ag-grid-angular 
   [quickFilterText]="quickFilterText" 
   (modelUpdated)="onModelUpdated($event)">
</ag-grid-angular>
```

The current number of displayed rows is shown in the template and is kept up to date by adding an event listener to the `(modelUpdated)` output.

```ts
export class AppComponent {
    public quickFilterText: string = ''

    onModelUpdated(params: ModelUpdatedEvent) {
        this.displayedRows = params.api.getDisplayedRowCount();
    }
}
```

The expected behaviour can be seen in the example below by entering the text "Germany" in the filter and seeing how there are `68` rows after filtering.

<grid-example title='Async Test' name='async-test' type='mixed' ></grid-example>


 ## Configuring the Test Module

 The first part of the test is to configure the test module. It requires AG Grid's `AgGridModule` and also Angular's `FormModule` to provided support for `ngModel`.

 ```ts
beforeEach(() => {
    TestBed.configureTestingModule({
        declarations: [AppComponent],
        imports: [AgGridModule, FormsModule],
    });
    // Create the test component fixture
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    let compDebugElement = fixture.debugElement;

    // Get a reference to the quickFilter input and rendered template
    quickFilterDE = compDebugElement.query(By.css('#quickFilter'))
    rowNumberDE = compDebugElement.query(By.css('#numberOfRows'))
});
 ```

[[note]]
|It is not recommended to run fixture.detectChanges() inside the beforeEach method as this can lead to numerous issues when testing asynchronous code.

Two approaches are outlined below to test the asynchronous grid behaviour.
 - Using `fakeAsync`
 - Using `async` `await`

### Validation Helper Function

Both approaches share a common helper function, `validateState`, that tests the component at multiple stages to gain insight into how the test works. It validates the internal grid state, the state of the component variable and finally the rendered HTML output of the component.

```ts
function validateState({ gridRows, displayedRows, templateRows }) {
  
    // Validate the internal grid model by calling its api method to get the row count
    expect(component.grid.api.getDisplayedRowCount()).toEqual(gridRows)
    
    // Validate the component property displayedRows which we use in the template
    expect(component.displayedRows).toEqual(displayedRows)

    // Validate the rendered html content that the user would see 
    expect(rowNumberDE.nativeElement.innerHTML).toContain(templateRows)
}
```
 ## FakeAsync

 Angular provides [fakeAsync](https://angular.io/api/core/testing/fakeAsync) as a tool for testing asynchronous code. It enables tests to control the flow of time and when asynchronous tasks are executed.

### Filter Test

The code below uses fakeAsync to test the quick filter. Step by step annotations are provided to explain why each `flush` and `fixture.detectChanges` method is required. 

```ts
it('should filter rows by quickFilterText', fakeAsync(() => {

    // When the test starts the component has been created but is not initialised.
    // This means the <ag-grid-angular> component has not been created or had data passed to it.
    // To validate this, test that the grid is undefined at the start of the test.
    expect(component.grid).toBeUndefined()

    // When working with fakeAsync ensure the first call to `fixture.detectChanges()`
    // is within the test body and NOT in a beforeEach section.
    // This is vital as it means that during the construction of <ag-grid-component>
    // all async behaviour is correctly patched.

    // The first call to detectChanges, creates the grid and binds the component values to the grid via its @Inputs.
    fixture.detectChanges()
    // Next validate that the grid has now been created.
    expect(component.grid.api).toBeDefined()

    // Now validate that the internal grid model is correct. It should have 1000 rows.
    // However, at this point the asynchronous grid callbacks have not run.
    // i.e the (modelUpdated) @Output has not fired.
    // This is why the internal grid state has 1000 rows, but the component and template still have 0 values.
    validateState({ gridRows: 1000, displayedRows: 0, templateRows: 0 })

    // To have the asynchronous functions execute call `flush()`.
    // This executes all the commands that currently exist on the call stack,
    // (and any added during the flush) until it is empty.
    flush();
    // Now the component has its displayedRows property updated as (modelUpdated) executes.
    // However, this is not reflected in the template as change detection has not run.
    validateState({ gridRows: 1000, displayedRows: 1000, templateRows: 0 })

    // Run detectChanges to update the template with the latest values in from the component.
    fixture.detectChanges()
    // State is now with consistent between the internal grid model, component data and renderer template.
    // All correctly show 1000 rows before any filtering.
    validateState({ gridRows: 1000, displayedRows: 1000, templateRows: 1000 })

    // Now update the filter text input.
    // Set the filter value to 'Germany' and fire the input event
    // which is required for ngModel to see the change.
    quickFilterDE.nativeElement.value = 'Germany'
    quickFilterDE.nativeElement.dispatchEvent(new Event('input'));

    // At this point the text input has been updated but the grid 
    // @Input [quickFilterText]="quickFilterText" has not.
    validateState({ gridRows: 1000, displayedRows: 1000, templateRows: 1000 })

    // Trigger change detection to apply the update to the @Input binding.
    // [quickFilterText]="quickFilterText".
    fixture.detectChanges()

    // The grid has now used the quickFilterText property to filters its rows.
    // Validate that the internal number of rows has been reduced to 68 for all German rows.
    // However, once again, the displayedRows has not been updated yet
    // as the grid schedules callbacks asynchronously.
    validateState({ gridRows: 68, displayedRows: 1000, templateRows: 1000 })

    // flush all the asynchronous callbacks.
    flush()
    // The component event handler, (modelUpdated), has now run and updated its displayedRows value.
    validateState({ gridRows: 68, displayedRows: 68, templateRows: 1000 })

    // Run change detection again so that the template reflects the displayedRows value from the component.
    fixture.detectChanges()
    // State is now stable and the quick filter has been validated    
    validateState({ gridRows: 68, displayedRows: 68, templateRows: 68 })

}))

```

Unlike the verbose test above, in your application you may only want to validate the state at the end of the test. Here is the test in its minimal form which shows the required pattern of `detectChanges` -> `flush` -> `detectChanges` to handle passing data to the grid, have the grid async code run and then finally update the rendered template.  

```ts
it('should filter rows by quickFilterText', fakeAsync(() => {

    fixture.detectChanges()
    flush();
    fixture.detectChanges()

    validateState({ gridRows: 1000, displayedRows: 1000, templateRows: 1000 })

    quickFilterDE.nativeElement.value = 'Germany'
    quickFilterDE.nativeElement.dispatchEvent(new Event('input'));

    fixture.detectChanges()
    flush()
    fixture.detectChanges()

    validateState({ gridRows: 68, displayedRows: 68, templateRows: 68 })
}))

```

 ## async await

 The second option to testing asynchronous behaviour is to use `async` and `await` syntax along with the Angular method [fixture.whenStable()](https://angular.io/api/core/Testability#whenstable). The same test for the quick filter can be written with `async`, `await` as follows.

### Filter Test

 ```ts
it('should filter rows by quickFilterText (async await)', (async () => {

    // When the test starts the component has been created but is not initialised.
    // This means the <ag-grid-angular> component has not been created or had data passed to it.
    // To validate this, test that the grid is undefined at the start of the test.
    expect(component.grid).toBeUndefined()

    // When working with fakeAsync ensure the first call to `fixture.detectChanges()`
    // is within the test body and NOT in a beforeEach section.
    // This is vital as it means that during the construction of <ag-grid-component>
    // all async behaviour is correctly patched.

    // The first call to detectChanges, creates the grid and binds the component values to the grid via its @Inputs.
    fixture.detectChanges()
    // Next validate that the grid has now been created.
    expect(component.grid.api).toBeDefined()

    // Now validate that the internal grid model is correct. It should have 1000 rows.
    // However, at this point the asynchronous grid callbacks have not run.
    // i.e the (modelUpdated) @Output has not fired.
    // This is why the internal grid state has 1000 rows, but the component and template still have 0 values.
    validateState({ gridRows: 1000, displayedRows: 0, templateRows: 0 })

    // Wait for the fixture to be stable which allows all the asynchronous code to run.
    await fixture.whenStable()

    // Now that the fixture is stable validate that the async callback (modelUpdated) has run.
    validateState({ gridRows: 1000, displayedRows: 1000, templateRows: 0 })

    // Run change detection to update the template based off the new component state
    fixture.detectChanges()

    // The grid is now stable and the template value matches
    validateState({ gridRows: 1000, displayedRows: 1000, templateRows: 1000 })

    // Now update the filter text input.
    // Set the filter value to 'Germany' and fire the input event
    // which is required for ngModel to see the change.
    quickFilterDE.nativeElement.value = 'Germany'
    quickFilterDE.nativeElement.dispatchEvent(new Event('input'));

    // Force change detection to run to apply the update to the <ag-grid-angular [quickFilterText] Input.
    fixture.detectChanges()

    // The grid filtering is done synchronously so the internal model is already updated.
    validateState({ gridRows: 68, displayedRows: 1000, templateRows: 1000 })

    // Wait for the asynchronous code to complete
    await fixture.whenStable()

    // The grid callback has now completed updating the component state
    validateState({ gridRows: 68, displayedRows: 1000, templateRows: 1000 })

    // Run change detection again to update the template.
    fixture.detectChanges()

    // State is now stable and the quick filter has been validated    
    validateState({ gridRows: 68, displayedRows: 68, templateRows: 68 })

}))
 ```

 And as before it is possible to shorten the test for your own use case. 
 
 Once again there is a similar pattern of `detectChanges` -> `await whenStable` -> `detectChanges` required for this asynchronous test.

  ```ts
it('should filter rows by quickFilterText (async await)', (async () => {

    fixture.detectChanges()
    await fixture.whenStable()
    fixture.detectChanges()

    validateState({ gridRows: 1000, displayedRows: 1000, templateRows: 1000 })

    quickFilterDE.nativeElement.value = 'Germany'
    quickFilterDE.nativeElement.dispatchEvent(new Event('input'));

    fixture.detectChanges()
    await fixture.whenStable()
    fixture.detectChanges()

    validateState({ gridRows: 68, displayedRows: 68, templateRows: 68 })
}))
 ```

 ## suppressBrowserResizeObserver

 With the grid option `suppressBrowserResizeObserver` enabled, due to the internal implementation of this feature, it is recommended to use the async await approach. The fakeAsync approach will result in the following error: `ERROR: flush failed after reaching the limit of 20 tasks. Does your code use a polling timeout?`. This occurs because during the `flush` process every resize event creates a new async call which in turn creates another and so on. This means the call stack queue never empties resulting in the error above.