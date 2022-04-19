---
title: "Testing with FakeAsync"
---

 We will walk through an example that tests asynchronous grid code as part of your Angular application,
 using default build tools provided when using the [Angular CLI](https://cli.angular.io/).

 ## Application To Test

We will test our [Quick Filter](/quick-filter) example to validate that filtering by the string `Germany` correctly filters the grid rows. We will also validate that the filtered row count is correctly updated in our template.

We use two way data binding via `[(ngModel)]=quickFilterText` to update the quick filter text that is bound to the grid property `[quickFilterText]` in the following way.

```html
    <input type="text" id="quickFilter" [(ngModel)]="quickFilterText">
    <div id="numberOfRows">Number of rows: {{displayedRows}}</div>

    <ag-grid-angular 
        [quickFilterText]="quickFilterText" 
        (modelUpdated)="onModelUpdated($event)">
    </ag-grid-angular>
```

We display the current number of displayed rows in our template and keep this up to date by adding an event listener to the `(modelUpdated)` output.

```ts
export class AppComponent {
    public quickFilterText: string = ''
 
    onModelUpdated(params: ModelUpdatedEvent) {
        this.displayedRows = params.api.getDisplayedRowCount();
    }
}
```

You can see the expected behaviour in the example below by entering the text `Germany` in the filter and seeing how there are `68` rows after filtering.

<grid-example title='Async Test' name='async-test' type='mixed' ></grid-example>


 ## Configuring the Test Module

 The first part of the test is to configure our test module. We need to add AG Grid's `AgGridModule` and also Angular's `FormModule` as that is required for `ngModel` to work.

 ```ts
    beforeEach((async () => {
        TestBed.configureTestingModule({
            declarations: [AppComponent],
            imports: [AgGridModule, FormsModule],
        });
        // Create our test component fixture
        fixture = TestBed.createComponent(AppComponent);
        component = fixture.componentInstance;
        let compDebugElement = fixture.debugElement;

        // Get a reference to our quickFilter input and rendered template
        quickFilterDE = compDebugElement.query(By.css('#quickFilter'))
        rowNumberDE = compDebugElement.query(By.css('#numberOfRows'))
    }));
 ```

[[note]]
|We do **not** run fixture.detectChanges() inside our beforeEach method as we want to ensure the grid is constructed within  our fakeAsync test. This avoids numerous issues.

 ## Testing Async Behaviour with FakeAsync

 Angular provides us with the testing tool [fakeAsync](https://angular.io/api/core/testing/fakeAsync) for handling asynchronous code in our tests. This enables us to control the flow of time and when asynchronous tasks are executed. Next we show how to write the filter test with `fakeAsync`.

### Validation Helper Function

We use the helper function `validateState` to test the component at multiple stages to help understand how `fakeAsync` works with the grid. We validate the internal grid state, the state our our component variable and finally the html rendered by the component.

```ts
  function validateState({ gridRows, displayedRows, templateRows }) {
    
    // Validate the internal grid model by calling its api method to get the row count
    expect(component.grid.api.getDisplayedRowCount()).toEqual(gridRows)
    
    // Validate the component property displayedRows which we use in our template
    expect(component.displayedRows).toEqual(displayedRows)

    // Validate the rendered html content that the user would see  
    expect(getTextValue(rowNumberDE)).toContain(templateRows)
  }
```

### FakeAsync Filter Test

Now let's run through the filter test, step by step, explaining why we are calling the `fakeAsync` helper `flush` and also `fixture.detectChanges`. 

```ts

it('should filter rows by quickFilterText', fakeAsync(() => {

    // When the test starts our test component has been created but not initialised.
    // This means our <ag-grid-angular> component has not been created or had data passed to it.
    // To validate this we test that our grid is undefined at the start of this test.
    expect(component.grid).toBeUndefined()

    // When working with fakeAsync we must ensure our first call to `fixture.detectChanges()`
    // is within our test body and NOT in a beforeEach section.
    // This is vital as it means that during the construction of <ag-grid-component>
    // all async behaviour is correctly patched.

    // Our first call to detectChanges, creates the grid and binds the component values to the grid via its @Inputs.
    fixture.detectChanges()
    // We validate that our grid has now been created.
    expect(component.grid.api).toBeDefined()

    // We now validate that the internal grid model is correct. 
    // It should have 1000 rows.
    // However, at this point the asynchronous grid callbacks have not run.
    // i.e our (modelUpdated) @Output has not fired.
    // This is why the internal grid state has 1000 rows, but our component and template still have 0 values.
    validateState({ gridRows: 1000, displayedRows: 0, templateRows: 0 })

    // To have the asynchronous functions execute we `flush` our fakeAsync test environment.
    // This executes all the commands that currently exist on the call stack,
    // (and any added during the flush) until it is empty.
    flush();
    // Now our component has its displayedRows property updated as (modelUpdated) executes.
    // However, this is not reflected in our template as change detection has not run.
    validateState({ gridRows: 1000, displayedRows: 1000, templateRows: 0 })

    // We run detectChanges which causes our template to render with the latest values in our component.
    fixture.detectChanges()
    // We have reached our first stable state with consistency between the internal grid model,
    // component data and renderer template.
    // All correctly show 1000 rows before any filtering.
    validateState({ gridRows: 1000, displayedRows: 1000, templateRows: 1000 })

    // Now let's test that updating the filter text input filters the data visible in the grid.
    // First we set the filter value to 'Germany' and then fire the input event
    // which is required for ngModel to see the change.
    quickFilterDE.nativeElement.value = 'Germany'
    quickFilterDE.nativeElement.dispatchEvent(new Event('input'));

    // At this point our text input has been updated but the grid 
    // @Input [quickFilterText]="quickFilterText" has not been applied.
    validateState({ gridRows: 1000, displayedRows: 1000, templateRows: 1000 })

    // We trigger change detection which applies the update to our @Input binding.
    // [quickFilterText]="quickFilterText".
    fixture.detectChanges()

    // With this new value for the quickFilterText property the grid filters its rows.
    // We can validate that the internal number of rows has been reduced to 68 for all the German rows.
    // However, once again, the displayedRows has not been updated yet
    // as the grid schedules callbacks asynchronously.
    validateState({ gridRows: 68, displayedRows: 1000, templateRows: 1000 })

    // We flush all the asynchronous callbacks.
    flush()
    // Our component event handler, (modelUpdated), has run and updated its displayedRows value.
    validateState({ gridRows: 68, displayedRows: 68, templateRows: 1000 })

    // We run change detection again so that our template updates with the latest value from our component.
    fixture.detectChanges()
    // We have now reached a stable state and tested that passing
    // [quickFilterText] to our grid component does correctly filter the rows.
    validateState({ gridRows: 68, displayedRows: 68, templateRows: 68 })

  }))

```

When you write tests in your application you may only want to validate the state at the end of the test, unlike this example. However, it demonstrates why you may need to have multiple instances of `flush()` and `fixture.detectChanges()` present in your `fakeAsync` tests.

Here is the test in its minimal form which shows the required pattern of `detectChanges` -> `flush` -> `detectChanges` to handle passing data to the grid, have the grid async code run and then finally update the rendered template.  

```ts

it('should filter rows by quickFilterText', fakeAsync(() => {

    fixture.detectChanges()
    flush();
    fixture.detectChanges()

    validateState({ gridRows: 1000, displayedRows: 1000, templateRows: 1000 })

    // Now let's test that updating the filter text input filters the data visible in the grid.
    // First we set the filter value to 'Germany' and then fire the input event
    // which is required for ngModel to see the change.
    quickFilterDE.nativeElement.value = 'Germany'
    quickFilterDE.nativeElement.dispatchEvent(new Event('input'));

    fixture.detectChanges()
    flush()
    fixture.detectChanges()

    validateState({ gridRows: 68, displayedRows: 68, templateRows: 68 })

  }))

```