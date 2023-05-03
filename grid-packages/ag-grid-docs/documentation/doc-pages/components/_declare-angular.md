<framework-specific-section frameworks="angular">
|## View Engine: Declaring Custom Components
</framework-specific-section>

<framework-specific-section frameworks="angular">
<note>
|| If you are using our [legacy](../angular-compatibility/#ag-grid-legacy) packages for [compatibility](/angular-compatibility/) and **not** using Ivy you need an additional step to register your custom components.
</note>
</framework-specific-section>

<framework-specific-section frameworks="angular">
| If you are using Angular v10-11 and have Ivy **disabled** via `enableIvy: false` then you must declare your custom components with the AgGridModule via the `withComponents` method. This enables AG Grid to be able to use your Angular components by adding them as `entryComponents` for you. You need to provide them in the **top level** `NgModule`:
</framework-specific-section>

<framework-specific-section frameworks="angular">
<snippet transform={false}>
| @NgModule({
|     imports: [
|         BrowserModule,
|         AgGridModule.withComponents(
|             [
|                 SquareComponent,      // Components to be used within the Grid
|                 CubeComponent,
|                 // ...other components
|             ]
|         ),
|     ]
| })
</snippet>
</framework-specific-section>