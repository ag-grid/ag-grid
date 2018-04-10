<?php
$pageTitle = "ag-Grid Reference: Getting Started with Angular";
$pageDescription = "ag-Grid is a feature-rich Angular datagrid available in Free or Enterprise versions. This page details how to get started using ag-Grid inside an Angular application.";
$pageKeyboards = "Angular 2 Grid";
$pageGroup = "basics";
include '../getting-started/header.php';
?>

<h1>Get Started with ag-Grid in Your Angular Project</h1>

<p class="lead">The "ag" part of ag-Grid stands for "agnostic". The internal ag-Grid engine is implemented in TypeScript with zero dependencies. 
ag-Grid supports Angular through a <strong>wrapper component</strong>. The wrapper lets you use ag-Grid in your application like any other Angular component &ndash; you pass configuration through property bindings and handle events through event bindings. 
You can even use Angular components to customize the grid UI and cell contents / behavior.</p> 

<p>In this article, we will walk you through the necessary steps to add ag-Grid to an existing Angular project, and configure some of the essential features of it. 
We will show you some of the fundamentals of the grid (passing properties, using the API, etc). As a bonus, we will also tweak the grid's visual appearance using Sass variables.</p>

<h2>Add ag-Grid to Your Project</h2>

<p>For the purposes of this tutorial, we are going to scaffold an Angular app with <a href="https://cli.angular.io/">angular CLI</a>. 
Don't worry if your project has a different configuration. Ag-Grid and its Angular wrapper are distributed as NPM packages, which should work with any common Angular project module bundler setup. 
Let's follow the <a href="https://github.com/angular/angular-cli#installation">Angular CLI instructions</a> - run the following in your terminal:</p>

<snippet language="sh">
npm install -g @angular/cli
ng new my-app --style scss
cd my-app
ng serve
</snippet>

<div class="note">We are passing <code>--style scss</code> to the app scaffolding command so that we may customize the grid theme look through Sass variables.</div>

<p>If everything goes well, <code>ng serve</code> has started the web server. You can open your app at  <a href="http://localhost:4200" onclick="window.open(event.target.href); return false;">localhost:4200</a>.</p> 

<p>As a next step, let's add the ag-Grid NPM packages. run the following command in <code>my-app</code> (you may need a new instance of the terminal):</p>

<snippet language="sh">
npm install --save ag-grid ag-grid-angular
</snippet>

<p>After a few seconds of waiting, you should be good to go. Let's get to the actual coding! As a first step, let's add the ag-Grid Angular module to our app module (<code>src/app.module.ts</code>):</p>

<snippet language="ts">
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { AgGridModule } from 'ag-grid-angular';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, AgGridModule.withComponents([])],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
</snippet>

<div class="note">The <code>withComponents</code> call is necessary for the grid to be able to use Angular components as cells / headers - you can ignore it for now.</div>

<p>The next step is to add the ag-Grid styles - import them in <code>styles.scss</code>:</p>

<snippet language="scss">
@import "~ag-grid/dist/styles/ag-grid.css";
@import "~ag-grid/dist/styles/ag-theme-balham.css";
</snippet>

<p>The code above imports the grid "structure" stylesheet (<code>ag-grid.css</code>), and one of the available grid themes: (<code>ag-theme-balham.css</code>). 
The grid ships several different themes; pick one that matches your project design. You can customize it further with Sass variables, a technique which we will cover further down the road.</p>

<p>Next, let's declare the basic grid configuration. Edit <code>src/app.component.ts</code>:</p>

<snippet language="ts">
import { Component } from '@angular/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    title = 'app';

    columnDefs = [
        {headerName: 'Make', field: 'make' },
        {headerName: 'Model', field: 'model' },
        {headerName: 'Price', field: 'price'}
    ];

    rowData = [
        { make: 'Toyota', model: 'Celica', price: 35000 },
        { make: 'Ford', model: 'Mondeo', price: 32000 },
        { make: 'Porsche', model: 'Boxter', price: 72000 }
    ];
}
</snippet>

<p>The code above presents two essential configuration properties of the grid - <strong>the column definitions</strong> (<code>columnDefs</code>) and the data (<code>rowData</code>). In our case, the column definitions contain three columns; 
each column entry specifies the header label and the data field to be displayed in the body of the table.</p> 

<p>Finally, let's add the component definition to our template. Edit <code>app/app.component.html</code> and remove the scaffold code:</p>

<snippet language="html">
&lt;ag-grid-angular 
    style="width: 500px; height: 500px;" 
    class="ag-theme-balham"
    [rowData]="rowData" 
    [columnDefs]="columnDefs"
    &gt;
&lt;/ag-grid-angular&gt;
</snippet>

<p>This is the ag-grid component definition, with two property bindings - <code>rowData</code> and <code>columnDefs</code>. The component also accepts the standard DOM <code>style</code> and <code>class</code>. 
We have set the class to <code>ag-theme-balham</code>, which defines the grid theme. 
As you may have already noticed, the CSS class matches the name of CSS file we imported earlier.
</p>

<p>If everything works as expected, you should see a simple grid like the one on the screenshot:</p> 

<img class="img-fluid" src="../getting-started/step1.png" alt="ag-Grid hello world" />

<h2>Enable Sorting And Filtering</h2>

<p>So far, so good. But wouldn't it be nice to be able to sort the data to help us see which car is the least/most expensive? Well, enabling sorting in ag-Grid is actually quite simple - all you need to do is set the <code>enableSorting</code> property to the component.</p> 

<snippet language="html">
&lt;ag-grid-angular 
    style="width: 500px; height: 500px;" 
    class="ag-theme-balham"
    [enableSorting]="true"
    [rowData]="rowData" 
    [columnDefs]="columnDefs"
    &gt;
&lt;/ag-grid-angular&gt;
</snippet>

<p>After adding the property, you should be able to sort the grid by clicking on the column headers. Clicking on a header toggles through ascending, descending and no-sort.</p>

<p>Our application doesn't have too many rows, so it's fairly easy to find data. But it's easy to imagine how a real-world application may have hundreds (or even hundreds of thousands!) or rows, with many columns. In a data set like this filtering is your friend.</p>

<p>As with sorting, enabling filtering is as easy as setting the <code>enableFilter</code> property:</p>

<snippet language="html">
&lt;ag-grid-angular 
    style="width: 500px; height: 500px;" 
    class="ag-theme-balham"
    [enableSorting]="true"
    [enableFilter]="true"
    [rowData]="rowData" 
    [columnDefs]="columnDefs"
    &gt;
&lt;/ag-grid-angular&gt;
</snippet>

<p>With this property set, the grid will display a small column menu icon when you hover the header. Pressing it will display a popup with filtering UI which lets you choose the kind of filter and the text that you want to filter by.</p>

<img class="img-fluid" src="../getting-started/step2.png" alt="ag-Grid sorting and filtering" />

<h2>Fetch Remote Data</h2>

<p>Displaying hard-coded data in JavaScript is not going to get us very far. In the real world, most of the time, we are dealing with data that resides on a remote server. Thanks to Angular, implementing this is actually quite simple. 
Notice that the actual data fetching is performed outside of the grid component - We are using Angular's <a href="https://angular.io/guide/http">HttpClient</a> and an async pipe. As a first step, let's add the <code>HttpModule</code> to our app module:</p> 

<snippet language="ts">
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { AgGridModule } from 'ag-grid-angular';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, HttpClientModule, AgGridModule.withComponents([])],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
</snippet>

<p>Now, let's remove the hard-coded data and fetch one from a remote server. Edit the <code>src/app.component.ts</code> to this: </p>
<snippet language="ts">
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    title = 'app';

    columnDefs = [
        {headerName: 'Make', field: 'make' },
        {headerName: 'Model', field: 'model' },
        {headerName: 'Price', field: 'price'}
    ];

    rowData: any;

    constructor(private http: HttpClient) {

    }

    ngOnInit() {
        this.rowData = this.http.get('https://api.myjson.com/bins/15psn9');
    }
}
</snippet>

<p>The above code turns the <code>rowData</code> from a hard-coded array to an <code>Observable</code>. For the grid to work with it, we need to add an async pipe to the property:</p>

<snippet language="html">
&lt;ag-grid-angular 
    style="width: 500px; height: 500px;" 
    class="ag-theme-balham"
    [enableSorting]="true"
    [enableFilter]="true"
    [rowData]="rowData | async" 
    [columnDefs]="columnDefs"
    &gt;
&lt;/ag-grid-angular&gt;
</snippet>


<p>The remote data is the same as the one we initially had, so you should not notice any actual changes to the grid. However, you will see an additional HTTP request performed if you open your developer tools.</p>


<h2>Enable Selection</h2> 

<p>Being a programmer is a hectic job. Just when we thought that we are done with our assignment, the manager shows up with a fresh set of requirements! 
It turned out that we need to allow the user to select certain rows from the grid and to mark them as flagged in the system. 
We will leave the flag toggle state and persistence to the backend team. On our side, we should enable the selection and, afterwards, to obtain the selected records and pass them with an API call to a remote service endpoint.</p> 

<p>Fortunately, the above task is quite simple with ag-Grid. As you may have already guessed, it is just a matter of adding and changing couple of properties. Edit <code>src/app.component.ts</code> first:</p>

<snippet language="ts">
import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    title = 'app';

    columnDefs = [
        {headerName: 'make', field: 'make', checkboxSelection: true },
        {headerName: 'model', field: 'model' },
        {headerName: 'price', field: 'price' }
    ];

    rowData: any;

    constructor(private http: HttpClient) {

    }

    ngOnInit() {
        this.rowData = this.http.get('https://api.myjson.com/bins/15psn9');
    }
}
</snippet>

<p>Next, let's enable multiple row selection, so that the user can pick many rows:</p>

<snippet language="html">
&lt;ag-grid-angular 
    style="width: 500px; height: 500px;" 
    class="ag-theme-balham"
    [enableSorting]="true"
    [enableFilter]="true"
    [rowData]="rowData | async" 
    [columnDefs]="columnDefs"
    rowSelection="multiple"
    &gt;
&lt;/ag-grid-angular&gt;
</snippet>

<div class="note">We took a bit of a shortcut here, by not binding the property value. Without <code>[]</code>, the assignment will pass the attribute value as a string, which is fine for our purposes.</div>

<p>Great! Now the first column contains a checkbox that, when clicked, selects the row. The only thing we have to add is a button that gets the selected data and sends it to the server. To do this, we are going to use the ag-Grid API - we will access it through the component instance. </p> 

<snippet language="html">
&lt;ag-grid-angular 
    #agGrid
    style="width: 500px; height: 500px;" 
    class="ag-theme-balham"
    [enableSorting]="true"
    [enableFilter]="true"
    [rowData]="rowData | async" 
    [columnDefs]="columnDefs"
    rowSelection="multiple"
    &gt;
&lt;/ag-grid-angular&gt;
</snippet>

<p>Now let's make the instance accessible in our component:</p> 

<snippet language="ts">
import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AgGridNg2 } from 'ag-grid-angular';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    @ViewChild('agGrid') agGrid: AgGridNg2;

    title = 'app';

    columnDefs = [
        {headerName: 'Make', field: 'make', checkboxSelection: true },
        {headerName: 'Model', field: 'model' },
        {headerName: 'Price', field: 'price'}
    ];

    rowData: any;

    constructor(private http: HttpClient) {

    }

    ngOnInit() {
        this.rowData = this.http.get('https://api.myjson.com/bins/15psn9');
    }
}
</snippet>

<p>The only thing we have to add is a button that gets the selected data and sends it to the server. To do this, we need the following change:</p> 

<snippet language="html">
&lt;button (click)="getSelectedRows()"&lt;Get Selected Rows&lt;/button&gt;

&lt;ag-grid-angular 
    #agGrid
    style="width: 500px; height: 500px;" 
    class="ag-theme-balham"
    [enableSorting]="true"
    [enableFilter]="true"
    [rowData]="rowData | async" 
    [columnDefs]="columnDefs"
    rowSelection="multiple"
    &gt;
&lt;/ag-grid-angular&gt;
</snippet>

<snippet language="ts">
import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AgGridNg2 } from 'ag-grid-angular';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    @ViewChild('agGrid') agGrid: AgGridNg2;

    title = 'app';

    columnDefs = [
        {headerName: 'Make', field: 'make', checkboxSelection: true },
        {headerName: 'Model', field: 'model' },
        {headerName: 'Price', field: 'price'}
    ];

    rowData: any;

    constructor(private http: HttpClient) {

    }

    ngOnInit() {
        this.rowData = this.http.get('https://api.myjson.com/bins/15psn9');
    }

    getSelectedRows() {
        const selectedNodes = this.agGrid.api.getSelectedNodes();
        const selectedData = selectedNodes.map( node =&gt; node.data );
        const selectedDataStringPresentation = selectedData.map( node =&gt; node.make + ' ' + node.model).join(', ');
        alert(`Selected nodes: ${selectedDataStringPresentation}`);
    }
}
</snippet>

<p>Well, we cheated a bit. Calling <code>alert</code> is not exactly a call to our backend. 
Hopefully you will forgive us this shortcut for the sake of keeping the article short and simple. Of course, you can substitute that bit with a real-world application logic after you are done with the tutorial.</p> 

<h2>Grouping (enterprise)</h2>

<div class="note">Grouping is a feature exclusive to the enterprise version of ag-Grid.</div>

<p>In addition to filtering and sorting, grouping is another  effective way for the user to make sense out of large amounts of data. In our case, the data is not that much. Let's switch to a slightly larger data set:</p>

<snippet language="diff">
ngOnInit() {
-        this.rowData = this.http.get('https://api.myjson.com/bins/15psn9');
+        this.rowData = this.http.get('https://api.myjson.com/bins/ly7d1');
}
</snippet>

<p>Afterwards, let's enable the enterprise features of ag-grid. Install the additional package:</p>

<snippet language="sh">
npm install --save ag-grid-enterprise
</snippet>

<p>Then, add the import to <code>app.module.ts</code>:</p>

<snippet language="diff">
import { AgGridModule } from 'ag-grid-angular';
import { HttpClientModule } from '@angular/common/http';

+import 'ag-grid-enterprise';
</snippet>

<p>If everything is ok, you should see a message in the console that warns you about missing enterprise license. In addition to that, the grid got a few UI improvements - a custom context menu and fancier column menu popup - feel free to look around:</p>

<img class="img-fluid" src="../getting-started/step3.png" alt="ag-Grid final" />

<p>Now, let's enable grouping! Add an <code>autoGroupColumnDef</code> property and change the <code>columnDefs</code> to the following:</p>

<snippet language="ts">
export class AppComponent implements OnInit {
    @ViewChild('agGrid') agGrid: AgGridNg2;

    title = 'app';

    columnDefs = [
        {headerName: 'Make', field: 'make', rowGroupIndex: 0 },
        {headerName: 'Price', field: 'price'}
    ];

    autoGroupColumnDef = {
        headerName: 'Model',
        field: 'model',
        cellRenderer: 'agGroupCellRenderer',
        cellRendererParams: {
            checkbox: true
        }
    };

    rowData: any;

    constructor(private http: HttpClient) {

    }

    ngOnInit() {
        this.rowData = this.http.get('https://api.myjson.com/bins/ly7d1');
    }

    getSelectedRows() {
        const selectedNodes = this.agGrid.api.getSelectedNodes();
        const selectedData = selectedNodes.map( node =&lt; node.data );
        const selectedDataStringPresentation = selectedData.map( node =&lt; node.make + ' ' + node.model).join(', ');
        alert(`Selected nodes: ${selectedDataStringPresentation}`);
    }
}
</snippet>

<p>Add the the <code>autoGroupColumnDef</code> property to the template too:</p> 

<snippet language="diff">
class="ag-theme-balham"
+[autoGroupColumnDef]="autoGroupColumnDef"
[enableSorting]="true"
</snippet>

<p>There we go! The grid now groups the data by <code>make</code>, while listing the <code>model</code> field value when expanded. 
Notice that grouping works with checkboxes as well - the <code>groupSelectsChildren</code> property adds a group-level checkbox that selects/deselects all items in the group.</p>

<div class="note"> Don't worry if this step feels a bit overwhelming - the  grouping feature is very powerful and supports complex interaction scenarios which you might not need initially. 
The grouping documentation section contains plenty of real-world runnable examples that can get you started for your particular  case.</div>

<h2>Customize the Theme Look</h2>

<p>The last thing which we are going to do is to change the grid look and feel by modifying some of the theme's Sass variables.</p> 

<p>By default, ag-Grid ships a set of pre-built theme stylesheets. If we want to tweak the colors and the fonts of theme, we should add a Sass preprocessor to our project, 
override the theme variable values, and refer the ag-grid Sass files instead of the pre-built stylesheets so that the variable overrides are applied.</p>

<p>Thankfully, Angular CLI has done most of the heavy lifting for us. Remember that  we bootstrapped our project with <code>--style scss</code>? Everything we need to do now is to change the paths in <code>src/styles.scss</code>:</p>

<snippet language="scss">
$ag-icons-path: "../node_modules/ag-grid/src/styles/icons/";

@import "~ag-grid/src/styles/ag-grid.scss";
@import "~ag-grid/src/styles/ag-theme-balham.scss";
</snippet>

<p>Notice that we had to aid the Sass preprocessor a bit by setting the <code>$ag-icons-path</code> variable. This is a common gotcha with Sass, as external image paths are considered relative to the main file. 
In fact, by specifying the icons path, we also made our first theme override! We might change the entire theme icon set by changing the path in the variable to a directory containing our icon set.</p> 

<p>Let's do something simpler, though. We can override the alternating row background color to grayish blue. Add the following line:</p>

<snippet language="diff">
 $ag-icons-path: "../node_modules/ag-grid/src/styles/icons/";
+$odd-row-background-color: #CFD8DC;
</snippet>

<p>If everything is configured correctly, the second row of the grid will get slightly darker. Congratulations! 
You now know now bend the grid look to your will - there are a few dozens more Sass variables that let you control the font family and size, border color, 
header background color and even the amount of spacing in the cells and columns. The full Sass variable list is available in the themes documentation section.</p> 

<h2>Summary</h2> 

<p>With this tutorial, we managed to accomplish a lot. Starting from the humble beginnings of a three row / column setup, we now have a grid that supports sorting, filtering, binding to remote data, selection and even grouping! 
While doing so, we learned how to configure the grid, how to access its API object, and how to change the styling of the component.</p> 

<p>That's just scratching the surface, though. The grid has a lot more features to offer; the abilities to customize cells and headers with custom components allow for almost infinite possible configurations. </p>

<h2>Next Steps</h2> 

<p>You are hungry for more? Head over to the <a href="../angular-more-details/">Angular guides section</a> for more in-depth information about the angular flavor of ag-Grid.  To learn more about the features used in this tutorial, you can go through the following help articles:</p>

<ul>
    <li><a href="../javascript-grid-sorting/">Sorting</a></li>
    <li><a href="../javascript-grid-filtering/">Filtering</a></li>
    <li><a href="../javascript-grid-grouping/">Grouping</a></li>
    <li><a href="../javascript-grid-selection/">Selection</a></li>
    <li><a href="../javascript-grid-styling/#customizing-sass-variables">Customizing themes with Sass</a></li>
</ul>



<?php include '../getting-started/footer.php'; ?>
