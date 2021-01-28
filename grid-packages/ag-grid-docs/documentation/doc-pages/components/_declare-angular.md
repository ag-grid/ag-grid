[[only-angular]]
|## Declaring Custom Components
|
| In order for ag-Grid to be able to use your Angular components, you need to provide them in
| the **top level** `NgModule`:
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
|         )
|     ]
| })
| ```
|
