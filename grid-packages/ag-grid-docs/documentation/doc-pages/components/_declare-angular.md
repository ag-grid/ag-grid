[[only-angular]]
|## View Engine: Declaring Custom Components
|
|[[note]]
|| If you are not using Ivy you need an additional step to register your custom components.
|
| If you are using Angular v8 or v9+ but with Ivy disabled by the compiler flag `enableIvy: false` then you must declare your custom components with the AgGridModule via the `withComponents` method. This enables AG Grid to be able to use your Angular components by adding them as `entryComponents` for you. You need to provide them in the **top level** `NgModule`:
|
| ```jsx
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
| ```
|
