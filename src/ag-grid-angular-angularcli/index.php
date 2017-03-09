<?php
header("HTTP/1.1 301 Moved Permanently");
header("Location: https://www.ag-grid.com/javascript-grid-getting-started/?framework=angular");
?>

<?php
/*$key = "Angular CLI";
$pageTitle = "Angular Datagrid using Angular CLI";
$pageDescription = "Demonstrate the best Angular datagrid using Angular CLI.";
$pageKeyboards = "Angular Grid Angular CLI";
$pageGroup = "basics";
include '../documentation-main/documentation_header.php';
*/?><!--

<div>

    <h1 id="angular-building-with-angular-cli">Angular - Building with Angular CLI</h1>

    <p>We document the main steps required when using Angular-CLI below, but please refer to
        <a href="https://github.com/ceolter/ag-grid-angular-example">ag-grid-angular-example</a> on GitHub for a full working
        example of this.</p>

    <h2 id="pre-requisites">Pre-requisites</h2>
    <p>
        This page assumes you already have Angular-CLI installed - if not please refer to the <a
                href="https://github.com/angular/angular-cli">Angular CLI Documentation</a> for steps on how to do so.
    </p>

    <p>The information documents a quick example and highlights the important steps to get ag-Grid working with Angular
        CLI,
        but does not go into the specifics of using ag-Grid or using Angular components within the grid.</p>

    <p>For this please refer the <a href="/best-anguar-2-data-grid">Angular</a> documentation for overall information
        about how to configure and use ag-Grid with Angular, as well as more detailed documentation around specifics
        like <a href="../javascript-grid-cell-rendering/#ng2CellRendering">cellRenderers</a>,
        <a href="../javascript-grid-cell-editing/#ng2CellEditing">cellEditors</a> and
        <a href="../javascript-grid-filtering/#ng2Filtering">filters</a> using Angular.
    </p>

    <h2 id="creating-a-angular-project-with-ag-grid">Creating a Angular Project with ag-Grid</h2>
    <p>
        First we'll create a new project - lets call it <code>ag-grid-test</code>:
    </p>
    <pre>ng new ag-grid-test
cd ag-grid-test</pre>

    <p>Let's update our dependencies - first let's install <code>ag-grid</code> and <code>ag-grid-angular</code>:</p>
    <pre>
npm i ag-grid --save
npm i ag-grid-angular --save</pre>

    <p>We are also going to assume an Angular version of 2.3.1 for this example - you can use a higher (or lower)
        version here,
        but you'll need to ensure that you choose the corresponding version of Angular CLI if you do so.</p>

    <p>The package dependencies should look something like this:</p>
    <pre>
"dependencies": {
    "@angular/common": "^2.3.1",
    "@angular/compiler": "^2.3.1",
    "@angular/core": "^2.3.1",
    "@angular/forms": "^2.3.1",
    "@angular/http": "^2.3.1",
    "@angular/platform-browser": "^2.3.1",
    "@angular/platform-browser-dynamic": "^2.3.1",
    "ag-grid": "^8.1.0",
    "ag-grid-angular": "^8.1.0",
    "core-js": "^2.4.1",
    "rxjs": "5.0.0-beta.12",
    "ts-helpers": "^1.1.1",
    "zone.js": "0.7.x"
}</pre>

    <p>Note that we've removed <code>@angular/router</code> as we don't need it for our example.</p>

    <p>Let's clear the dependencies installed when we created the project and install our new ones:</p>
    <pre>rm -rf node_modules/*
npm install</pre>

    <p>Now let's create our main Application Component - this will be the component that creates the ag-Grid grid for
        us:</p>
    <pre>ng generate component MyGridApplication <span class="codeComment">// or my-grid-application</span></pre>

    <p>And a component that we'll use in our grid:</p>
    <pre>ng generate component RedComponent  <span class="codeComment">// or red-component</span></pre>

    <p>Based on the above commands, our application will have a selector of <code>app-my-grid-application></code> - you
        can change this of course, but we'll use the default here. Let's use this in our application:
    <pre>
<span class="codeComment">// src/app/app.component.html</span>
&lt;app-my-grid-application&gt;&lt;/app-my-grid-application&gt;</pre>

    <p>Our grid component is going to be a simple renderer that styles it's contents red:</p>
    <pre ng-non-bindable>
<span class="codeComment">// src/app/red-component/red-component.component.ts</span>
import {Component} from "@angular/core";

@Component({
    selector: 'app-red-component',
    templateUrl: './red-component.component.html'
})
export class RedComponentComponent {
    private params: any;

    agInit(params: any): void {
        this.params = params;
    }
}

<span class="codeComment">// src/app/red-component/red-component.component.html</span>
&lt;span style="color: red"&gt;{{ params.value }}&lt;/span&gt;
</pre>

    <p>For our Application component, we'll have the following:</p>
    <pre>
<span class="codeComment">// src/app/my-grid-application/my-grid-application.component.ts</span>
import {Component} from "@angular/core";
import {GridOptions} from "ag-grid";
import {RedComponentComponent} from "../red-component/red-component.component";

@Component({
    selector: 'app-my-grid-application',
    templateUrl: './my-grid-application.component.html'
})
export class MyGridApplicationComponent {
    private gridOptions: GridOptions;

    constructor() {
        this.gridOptions = <GridOptions>{};
        this.gridOptions.columnDefs = [
            {
                headerName: "ID",
                field: "id",
                width: 100
            },
            {
                headerName: "Value",
                field: "value",
                cellRendererFramework: RedComponentComponent,
                width: 100
            },

        ];
        this.gridOptions.rowData = [
            {id: 5, value: 10},
            {id: 10, value: 15},
            {id: 15, value: 20}
        ]
    }
}

<span class="codeComment">// src/app/my-grid-application/my-grid-application.component.html</span>
&lt;div style="width: 200px;"&gt;
    &lt;ag-grid-angular #agGrid style="width: 100%; height: 200px;" class="ag-fresh"
                 [gridOptions]="gridOptions"&gt;
    &lt;/ag-grid-angular&gt;
&lt;/div&gt;
</pre>

    <p>Now we need to let Angular know about our new components, as well as the ag-Grid Module:</p>

    <pre>
import {BrowserModule} from "@angular/platform-browser";
import {NgModule} from "@angular/core";
import {AgGridModule} from "ag-grid-angular/main";
import {AppComponent} from "./app.component";
import {MyGridApplicationComponent} from "./my-grid-application/my-grid-application.component";
import {RedComponentComponent} from "./red-component/red-component.component";

@NgModule({
    declarations: [
        AppComponent,
        MyGridApplicationComponent,
        RedComponentComponent
    ],
    imports: [
        BrowserModule,
        AgGridModule.withComponents(
            [RedComponentComponent]
        )
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {
}    </pre>


    <p>And finally, we need to update angular-cli.json to include the ag-Grid styles we want to include:</p>
    <pre>
"styles": [
    "../node_modules/ag-grid/dist/styles/ag-grid.css",
    "../node_modules/ag-grid/dist/styles/theme-fresh.css"
],
</pre>

    <p>With these changes in place we can now build and run our application with:</p>

    <pre>ng serve</pre>

    <p>The results of which will be:</p>

    <img src="../images/angularcli_final.png" style="width: 200px">

    <p>And that's it! Of course there is much more you can do with Angular CLI, but the above should illustrate how
        quick
        and easy it is to get up and running with Angular and ag-Grid in very few steps.</p>

    <p>
        All the above items are specific to either Angular or Angular-CLI. The above is intended to point
        you in the right direction. If you need more information on this, please see the documentation
        for those projects.
    </p>

</div>

--><?php /*include '../documentation-main/documentation_footer.php'; */?>
