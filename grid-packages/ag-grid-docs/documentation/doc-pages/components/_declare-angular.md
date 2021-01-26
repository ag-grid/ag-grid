[[only-angular]]
|## Declaring Custom Components
|
| In order for ag-Grid to be able to use your Angular components, you need to provide them in
| the **top level** module:
|
| ```jsx
| @NgModule({
|     imports: [
|         BrowserModule,
|         FormsModule,
|         RouterModule.forRoot(appRoutes),
|         AgGridModule.withComponents(
|             [
|                 SquareComponent,
|                 CubeComponent,
|                 // ...other components
| ```
|
