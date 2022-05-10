[[only-angular]]
| AG Grid is the industry standard for Angular Enterprise Applications. Developers using AG Grid are
| building applications that would not be possible if AG Grid did not exist.
|
|<section class="code-tab mb-3">
|<div class="card">
|<div class="card-header">Quick Look Code Example</div>
|<div class="card-body">
|<ul class="nav nav-tabs">
|<li class="nav-item">
|<a  class="nav-link active" id="component-tab" data-toggle="tab" href="#component" role="tab" aria-controls="component" aria-selected="true">
|
| app.component.ts
|
|
|</a>
|</li>
|<li class="nav-item">
|<a class="nav-link" id="template-tab" data-toggle="tab" href="#template" role="tab" aria-controls="template" aria-selected="false">
|
| app.component.html
|
|</a>
|</li>
|</ul>
|<div class="tab-content">
|<div class="tab-pane show active" id="component" role="tabpanel" aria-labelledby="component-tab">
|
| ```ts
| import { Component } from '@angular/core';
| import { ColDef } from 'ag-grid-community';
|
| @Component({
|   selector: 'my-app',
|   templateUrl: './app.component.html',
|   styleUrls: [ './app.component.scss' ]
| })
| export class AppComponent  {
|
|     columnDefs: ColDef[] = [
|         { field: 'make' },
|         { field: 'model' },
|         { field: 'price' }
|     ];
|
|     rowData = [
|         { make: 'Toyota', model: 'Celica', price: 35000 },
|         { make: 'Ford', model: 'Mondeo', price: 32000 },
|         { make: 'Porsche', model: 'Boxster', price: 72000 }
|     ];
|
| }
| ```
|
|</div>
|<div class="tab-pane" id="template" role="tabpanel" aria-labelledby="template-tab">
|
| ```html
| <ag-grid-angular
|     style="width: 500px; height: 150px;"
|     class="ag-theme-alpine"
|     [rowData]="rowData"
|     [columnDefs]="columnDefs">
| </ag-grid-angular>
| ```
|
|</div>
|</div>
|</div>
|<div class="text-right" style="margin-top: -1.5rem;">
|
| <a class="btn btn-dark mb-2 mr-3" href="https://stackblitz.com/edit/ag-grid-angular-hello-world" target="_blank">
|     Open in <img src="resources/stackBlitz_icon.svg" alt="Open in StackBlitz" style="height: 2.5rem"/> StackBlitz
| </a>
|
|</div>
|</div>
|</section>
|
| [[note]]
| | Please refer to our [Compatibility Chart](#ag-grid--angular-compatibility-chart) for Supported Versions of
| | Angular & AG Grid.
|
| ## Getting Started
|
| <video-section id="AeEfiWAGyLc" title="Getting Started Video Tutorial">
|     Below we walk through the necessary steps to add AG Grid (both
|     <a href="../licensing/">Community and Enterprise</a> are covered) to an
|     Angular project and configure some grid features. In particular, we will go through
|     the following steps:
|  </video-section>
|
| 1. [Add AG Grid to Your Project](#add-ag-grid-to-your-project-1)
| 1. [Enable Sorting and Filtering](#enable-sorting-and-filtering-1)
| 1. [Fetch Remote Data](#fetch-remote-data-1)
| 1. [Enable Selection](#enable-selection-1)
| 1. [Grouping (Enterprise)](#grouping-1)
| 1. [Customise the Theme Look](#customise-the-theme-look)
| 1. [Summary](#summary-1)
|
| [[note]]
| |
| | <div id="thinkster-note" style="display: flex;">
| |     <span style="display: inline-block; width: 150px; background: radial-gradient(#41a3ff, #0273D4); border-radius: 5px; padding: 3px;">
| |         <a href="https://thinkster.io/topics/ag-grid" target="_blank">
| |             <img src="resources/thinkster.png"/>
| |         </a>
| |     </span>
| |     <span style="flex-grow: 1; display: flex; align-items: center; padding-left: 10px;">
| |         Thinkster has provided a free course:&nbsp;
| |         <a href="https://thinkster.io/topics/ag-grid" target="_blank">Learning AG Grid with Angular</a>
| |     </span>
| | </div>
| |
|
| ## Add AG Grid to Your Project
|
| For the purposes of this tutorial, we are going to scaffold an Angular app with
| [angular CLI](https://cli.angular.io/). Don't worry if your project has a different
| configuration. AG Grid and its Angular wrapper are distributed as NPM packages, which
| should work with any common Angular project module bundler setup. Let's follow the
| [Angular CLI instructions](https://github.com/angular/angular-cli#installation) - run the
| following in your terminal:
|
|
| ```bash
| npx -p @angular/cli@latest ng new my-app  --style scss --routing false
| cd my-app
| npm start
| ```
|
| [[note]]
| | We are passing `--style scss` to the app scaffolding command so that we may customise the
| | grid theme look through Sass variables.
|
| If everything goes well, `ng serve` has started the web server. You can open your app at
| <a href="http://localhost:4200" target="_blank">localhost:4200</a>.
|
| As a next step, let's add the AG Grid NPM packages. run the following command in `my-app` (you may need a new instance of | the terminal):
|
| ```bash
| npm install --save ag-grid-community ag-grid-angular
| npm install # in certain circumstances npm will perform an "auto prune". This step ensures all expected dependencies are | present
| ```
|
| After a few seconds of waiting, you should be good to go. Let's get to the actual coding! As a first
| step, let's add the AG Grid Angular module to our app module (`src/app/app.module.ts`):
|
| ```ts
| import { BrowserModule } from '@angular/platform-browser';
| import { NgModule } from '@angular/core';
|
| import { AppComponent } from './app.component';
| import { AgGridModule } from 'ag-grid-angular';
|
| @NgModule({
|   declarations: [AppComponent],
|   imports: [
|     BrowserModule,
|     AgGridModule.withComponents([])
|   ],
|   providers: [],
|   bootstrap: [AppComponent]
| })
| export class AppModule {}
| ```
|
| [[note]]
| | The `withComponents` call is only necessary for Angular <= v8 or if Ivy has been disabled (`enableIvy:false`). If this is the case you must use `withComponents` to enable the grid to use Angular
| | components as cells / headers  otherwise you can ignore it and just import `AgGridModule`.
|
| The next step is to add the AG Grid styles - replace the content of
| `src/styles.scss` with the following code:
|
| ```scss
| @import "ag-grid-community/dist/styles/ag-grid.css";
| @import "ag-grid-community/dist/styles/ag-theme-alpine.css";
| ```
|
| The code above imports the grid "structure" stylesheet (`ag-grid.css`), and one of the
| available grid themes: (`ag-theme-alpine.css`). The grid ships several different themes; pick one
| that matches your project design. You can customise it further with Sass variables, a technique
| which we will cover further down the road.
|
| Next, let's declare the basic grid configuration. Edit `src/app/app.component.ts`:
|
| ```ts
| import { Component } from '@angular/core';
| import { ColDef } from 'ag-grid-community';
|
| @Component({
|     selector: 'app-root',
|     templateUrl: './app.component.html',
|     styleUrls: ['./app.component.scss']
| })
| export class AppComponent {
|
|     columnDefs: ColDef[] = [
|         { field: 'make' },
|         { field: 'model' },
|         { field: 'price'}
|     ];
|
|     rowData = [
|         { make: 'Toyota', model: 'Celica', price: 35000 },
|         { make: 'Ford', model: 'Mondeo', price: 32000 },
|         { make: 'Porsche', model: 'Boxster', price: 72000 }
|     ];
| }
| ```
|
| The code above presents two essential configuration properties of the grid -
| [the column definitions](/column-definitions/)
| (`columnDefs`) and the data (`rowData`). In our case, the column definitions contain three columns;
| each column entry specifies the header label and the data field to be displayed in the body of the table.
|
| Finally, let's add the component definition to our template. Edit `app/app.component.html` and remove the scaffold code:
|
| ```html
| <ag-grid-angular
|     style="width: 500px; height: 500px;"
|     class="ag-theme-alpine"
|     [rowData]="rowData"
|     [columnDefs]="columnDefs"
| >
| </ag-grid-angular>
| ```
|
| This is the ag-grid component definition, with two property bindings - `rowData` and `columnDefs`.
| The component also accepts the standard DOM `style` and `class`. We have set the class to `ag-theme-alpine`,
| which defines the grid theme. As you may have already noticed, the CSS class matches the name of CSS
| file we imported earlier.
|
| If everything works as expected, you should see a simple grid like the one on the screenshot:
|
| ![AG Grid hello world](resources/step1.png)
|
| ## Enable Sorting And Filtering
|
| So far, so good. But wouldn't it be nice to be able to sort the data to help us see which car is the
| least/most expensive? Well, enabling sorting in AG Grid is actually quite simple - all you
| need to do is set the `sortable` property to each column you want to be able to sort by.
|
| ```ts
| columnDefs: ColDef[] = [
|     { field: 'make', sortable: true },
|     { field: 'model', sortable: true },
|     { field: 'price', sortable: true }
| ];
| ```
|
| After adding the property, you should be able to sort the grid by clicking on the column
| headers. Clicking on a header toggles through ascending, descending and no-sort.
|
| Our application doesn't have too many rows, so it's fairly easy to find data. But it's easy to
| imagine how a real-world application may have hundreds (or even hundreds of thousands!) of
| rows, with many columns. In a data set like this [filtering](/filtering/)
| is your friend.
|
| As with sorting, enabling filtering is as easy as setting the `filter` property:
|
| ```ts
| columnDefs: ColDef[] = [
|     { field: 'make', sortable: true, filter: true },
|     { field: 'model', sortable: true, filter: true },
|     { field: 'price', sortable: true, filter: true }
| ];
| ```
|
| With this property set, the grid will display a small column menu icon when you hover the header. Pressing
| it will display a popup with a filtering UI which lets you choose the kind of filter and the text that
| you want to filter by.
|
| ![AG Grid sorting and filtering](resources/step2.png)
|
| ## Fetch Remote Data
|
| Displaying hard-coded data in JavaScript is not going to get us very far. In the real world,
| most of the time, we are dealing with data that resides on a remote server. Thanks to Angular,
| implementing this is actually quite simple. Notice that the actual data fetching is performed
| outside of the grid component - we are using Angular's [HttpClient](https://angular.io/guide/http)
| and an async pipe. As a first step, let's add the `HttpModule` to our app module:
|
| ```ts
| import { BrowserModule } from '@angular/platform-browser';
| import { NgModule } from '@angular/core';
|
| import { AppComponent } from './app.component';
| import { AgGridModule } from 'ag-grid-angular';
| import { HttpClientModule } from '@angular/common/http';
|
| @NgModule({
|   declarations: [AppComponent],
|   imports: [
|     BrowserModule,
|     HttpClientModule,
|     AgGridModule.withComponents([])
|   ],
|   providers: [],
|   bootstrap: [AppComponent]
| })
| export class AppModule {}
| ```
|
| Now, let's remove the hard-coded data and fetch it from a remote server.
| Edit the `src/app/app.component.ts` to this:
|
|```ts
|import { Component } from '@angular/core';
|import { HttpClient } from '@angular/common/http';
|import { Observable } from 'rxjs';
|import { ColDef } from 'ag-grid-community';
|
|@Component({
|    selector: 'app-root',
|    templateUrl: './app.component.html',
|    styleUrls: ['./app.component.scss']
|})
|export class AppComponent {
|
|    columnDefs: ColDef[] = [
|        { field: 'make', sortable: true, filter: true },
|        { field: 'model', sortable: true, filter: true },
|        { field: 'price', sortable: true, filter: true }
|    ];
|
|    rowData: Observable<any[]>;
|
|    constructor(private http: HttpClient) {
|        this.rowData = this.http.get<any[]>('https://www.ag-grid.com/example-assets/small-row-data.json');
|    }
|}
|```
|
| The above code turns the `rowData` from a hard-coded array to an `Observable`. For the grid to work with
| it, we need to add an async pipe to the property:
|
| ```html
| <ag-grid-angular
|     style="width: 500px; height: 500px;"
|     class="ag-theme-alpine"
|     [rowData]="rowData | async"
|     [columnDefs]="columnDefs"
| >
| </ag-grid-angular>
| ```
|
| The remote data is the same as the one we initially had, so you should not notice any actual changes
| to the grid. However, you will see an additional HTTP request performed if you open your developer tools.
|
| ## Enable Selection
|
| Being a programmer is a hectic job. Just when we thought that we are done with our assignment, the manager
| shows up with a fresh set of requirements! It turned out that we need to allow the user to select certain
| rows from the grid and to mark them as flagged in the system. We will leave the flag toggle state and
| persistence to the backend team. On our side, we should enable the selection and, afterwards, to obtain
| the selected records and pass them with an API call to a remote service endpoint.
|
| Fortunately, the above task is quite simple with AG Grid. As you may have already guessed, it is just a
| matter of adding and changing couple of properties. Edit `src/app/app.component.ts` first:
|
| ```ts
|import { Component } from '@angular/core';
|import { HttpClient } from '@angular/common/http';
|import { Observable } from 'rxjs';
|import { ColDef } from 'ag-grid-community';
|
|@Component({
|    selector: 'app-root',
|    templateUrl: './app.component.html',
|    styleUrls: ['./app.component.scss']
|})
|export class AppComponent {
|
|    columnDefs: ColDef[] = [
|        {field: 'make', sortable: true, filter: true, checkboxSelection: true},
|        {field: 'model', sortable: true, filter: true},
|        {field: 'price', sortable: true, filter: true}
|    ];
|
|    rowData: Observable<any[]>;
|
|    constructor(private http: HttpClient) {
|       this.rowData = this.http.get<any[]>('https://www.ag-grid.com/example-assets/small-row-data.json');
|    }
|}
| ```
|
| Next, let's enable [multiple row selection](/row-selection/#example-multiple-row-selection),
| so that the user can pick many rows:
|
| ```html
| <ag-grid-angular
|     style="width: 500px; height: 500px;"
|     class="ag-theme-alpine"
|     [rowData]="rowData | async"
|     [columnDefs]="columnDefs"
|     rowSelection="multiple"
| >
| </ag-grid-angular>
| ```
|
| Great! Now the first column contains a checkbox that, when clicked, selects the row. The only
| thing we have to add is a button that gets the selected data and sends it to the server. To do this,
| we are going to use the [AG Grid API](/grid-api/) - we will access
| it through the component instance. To access to component instance we will need to add the
| `#agGrid` id to our component.
|
| ```html
| <button (click)="getSelectedRows()">Get Selected Rows</button>
| <ag-grid-angular
|     #agGrid
|     style="width: 500px; height: 500px;"
|     class="ag-theme-alpine"
|     [rowData]="rowData | async"
|     [columnDefs]="columnDefs"
|     rowSelection="multiple"
| >
| </ag-grid-angular>
| ```
|
| Now let's make the instance accessible, and add the `getSelectedRows` method to our component:
|
|```diff
|+ import { Component, ViewChild } from '@angular/core';
|import { HttpClient } from '@angular/common/http';
|import { Observable } from 'rxjs';
|import { ColDef } from 'ag-grid-community';
|+ import { AgGridAngular } from 'ag-grid-angular';
|
|@Component({
|    selector: 'app-root',
|    templateUrl: './app.component.html',
|    styleUrls: ['./app.component.scss']
|})
|export class AppComponent {
|+  @ViewChild('agGrid') agGrid!: AgGridAngular;
|
|    columnDefs: ColDef[] = [
|        {field: 'make', sortable: true, filter: true, checkboxSelection: true},
|        {field: 'model', sortable: true, filter: true},
|        {field: 'price', sortable: true, filter: true}
|    ];
|
|    rowData: Observable<any[]>;
|
|    constructor(private http: HttpClient) {
|       this.rowData = this.http.get<any[]>('https://www.ag-grid.com/example-assets/small-row-data.json');
|    }
|
|+  getSelectedRows(): void {
|+      const selectedNodes = this.agGrid.api.getSelectedNodes();
|+      const selectedData = selectedNodes.map(node => node.data);
|+      const selectedDataStringPresentation = selectedData.map(node => `${node.make} ${node.model}`).join(', ');
|+
|+      alert(`Selected nodes: ${selectedDataStringPresentation}`);
|+   }
|}
|```
|
| Well, we cheated a bit - calling `alert` is not exactly a call to our backend.
| Hopefully you will forgive us this shortcut for the sake of keeping the article short and
| simple. Of course, you can substitute that bit with a real-world application logic after you
| are done with the tutorial.
|
| ## Grouping (enterprise)
|
| [[note]]
| | Grouping is a feature exclusive to AG Grid Enterprise. You are free to trial AG Grid Enterprise
| | to see what you think. You only need to get in touch if you want to start using AG Grid Enterprise
| | in a project intended for production.
|
| In addition to filtering and sorting, [grouping](/grouping/) is another effective way for the
| user to make sense out of large amounts of data.
|
| Our current data set is pretty small so let's switch to a larger one:
|
| ```diff
| constructor(private http: HttpClient) {
| -     this.rowData = this.http.get<any[]>('https://www.ag-grid.com/example-assets/small-row-data.json');
| +     this.rowData = this.http.get<any[]>('https://www.ag-grid.com/example-assets/row-data.json');
| }
| ```
|
| Let's enable the enterprise features of ag-grid. Install the additional package:
|
| ```bash
| npm install --save ag-grid-enterprise
| ```
|
| Then, add the import to `app.module.ts`:
|
| ```diff
| import { AgGridModule } from 'ag-grid-angular';
| import { HttpClientModule } from '@angular/common/http';
| + import 'ag-grid-enterprise';
| ```
|
| If everything is ok, you should see a message in the console that tells you there is no enterprise
| license key. You can ignore the message as we are trialing. In addition to that, the grid got a few
| UI improvements - a custom context menu and fancier column menu popup - feel free to look around:
|
| ![AG Grid final](resources/step3.png)
|
| Now let's enable grouping! Add an `autoGroupColumnDef` property and change the
| `columnDefs` to the following:
|
| ```ts
| export class AppComponent {
|     @ViewChild('agGrid') agGrid!: AgGridAngular;
|
|     defaultColDef: ColDef = {
|         sortable: true,
|         filter: true
|     };
|
|     columnDefs: ColDef[] = [
|         { field: 'make', rowGroup: true },
|         { field: 'price' }
|     ];
|
|     autoGroupColumnDef: ColDef = {
|         headerName: 'Model',
|         field: 'model',
|         cellRenderer: 'agGroupCellRenderer',
|         cellRendererParams: {
|             checkbox: true
|         }
|     };
|
|     rowData: Observable<any[]>;
|
|     constructor(private http: HttpClient) {
|         this.rowData = this.http.get<any[]>('https://www.ag-grid.com/example-assets/row-data.json');
|     }
|
|     getSelectedRows() {
|         const selectedNodes = this.agGrid.api.getSelectedNodes();
|         const selectedData = selectedNodes.map(node => {
|           if (node.groupData) {
|             return { make: node.key, model: 'Group' };
|           }
|           return node.data;
|         });
|         const selectedDataStringPresentation = selectedData.map(node => `${node.make} ${node.model}`).join(', ');
|
|         alert(`Selected nodes: ${selectedDataStringPresentation}`);
|     }
| }
| ```
|
| Add the the `autoGroupColumnDef` and `defaultColDef` properties to the template too:
|
| ```diff
| class="ag-theme-alpine"
| + [defaultColDef]="defaultColDef"
| + [autoGroupColumnDef]="autoGroupColumnDef"
| ```
|
| There we go! The grid now groups the data by `make`, while listing the `model` field value when expanded.
| Notice that grouping works with checkboxes as well - the `groupSelectsChildren` property adds a
| group-level checkbox that selects/deselects all items in the group.
|
| [[note]]
| | Don't worry if this step feels a bit overwhelming - the grouping feature is very powerful and supports
| | complex interaction scenarios which you might not need initially. The grouping documentation section
| | contains plenty of real-world runnable examples that can get you started for your particular  case.
|
| ## Customise the Theme Look
|
| The last thing which we are going to do is to change the grid look and feel by modifying some of the
| theme's parameters.
|
| Open `src/styles.scss` and replace the `css` with `scss` files - we'll also add some parameters to change the odd row background color:
|
| ```scss
| @import "ag-grid-community/src/styles/ag-grid.scss";
| @import "ag-grid-community/src/styles/ag-theme-alpine/sass/ag-theme-alpine-mixin.scss";
|
| .ag-theme-alpine {
|     @include ag-theme-alpine((
|         odd-row-background-color: #CFD8DC
|     ));
| }
| ```
|
| You can find a [full list of theme parameters here](/themes-customising/#full-list-of-theme-parameters).
|
| If everything is configured correctly, the second row of the grid will get slightly darker.
| Congratulations! You now know now bend the grid look to your will - there are a few dozens more
| Sass variables that let you control the font family and size, border color, header background color
| and even the amount of spacing in the cells and columns. The full
| [theme parameter list](/themes-customising/#full-list-of-theme-parameters) is
| available in the themes documentation section.
|
| ## AG Grid & Angular Compatibility Chart
|
| [[note]]
| | Due to a breaking change in Angular 10 you may experience the following error when building:
| | `Generic type 'ModuleWithProviders<T>' requires 1 type argument(s)`<br/><br/>
| | If you wish to use Angular 10 with AG Grid versions 18-23 then you need to set `"skipLibCheck": true`
| | in `tsconfig.app.json` Please note however that this is a workaround and Angular 10 is only
| | officially supported with AG Grid 24+.
|
| | Angular Version | AG Grid Versions                        |
| | --------------- | --------------------------------------- |
| | 6               | 18 - 22                                 |
| | 7 - 9           | 18 - 23+ (23 recommended for Angular 9) |
| | 7 - 10+         | 24+ (24+ for Angular 10)                |
|
| ## Summary
|
| With this Angular grid tutorial, we managed to accomplish a lot. Starting from the humble beginnings of
| a three row / column setup, we now have a grid that supports sorting, filtering, binding to remote data,
| selection and even grouping! While doing so, we learned how to configure the grid, how to access its
| API object, and how to change the styling of the component.
|
| [[note]]
| | Want to know more?
| |
| | Want to see some full examples of customising AG Grid using Angular components? See this blog
| | written by Max Koretskyi (aka Angular in Depth Wizard)
| | <a href="https://blog.ag-grid.com/learn-to-customize-angular-grid-in-less-than-10-minutes/" target="_blank">
| | Learn to customise Angular grid in less than 10 minutes</a>.
| |
| | A full working examples of AG Grid and Angular can be found in
| | [Github](https://github.com/ag-grid/ag-grid-angular-cli-example), illustrating
| | (amongst others) rich grids, filtering with angular components and master/detail.
