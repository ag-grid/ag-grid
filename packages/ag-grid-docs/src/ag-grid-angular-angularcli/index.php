fi<?php
$pageTitle = "ag-Grid Reference: Building with Angular Cli";
$pageDescription = "ag-Grid is a feature-rich data grid supporting major JavaScript Frameworks. This page details how to build ag-Grid using Angular CLI.";
$pageKeyboards = "Angular CLI";
$pageGroup = "basics";
$angularParent = "checked";

include '../documentation-main/documentation_header.php';
?>

<h1 id="angular-building-with-webpack">Angular CLI</h1>

<h2>Building an ag-Grid Application with Angular CLI</h2>

<p class="lead">We walk through the main steps required when using ag-Grid, Angular and Angular CLI below, but please refer to
    <a href="https://github.com/ag-grid/ag-grid-angular-example">ag-grid-angular-example</a> on GitHub for a full working example of this.</p>

<p>We document the main steps required when using Angular-CLI below, but please refer to
    <a href="https://github.com/ag-grid/ag-grid-angular-example">ag-grid-angular-example</a> on GitHub for a full working
    example of this.</p>

<h2 id="pre-requisites">Pre-requisites</h2>
<p>
    This page assumes you already have Angular-CLI installed - if not please refer to the <a
            href="https://github.com/angular/angular-cli">Angular CLI Documentation</a> for steps on how to do so.
</p>

<h2 id="creating-a-angular-project-with-ag-grid">Creating a Angular Project with ag-Grid</h2>

<note>You can either create the project by hand, or check it out from our Angular Seed Repo in <a href="https://github.com/ag-grid/ag-grid-angular-seed">GitHub.</a></note>

<p>
    First we'll create a new project - lets call it <code>ag-grid-cli</code>:
</p>
<snippet language="sh">
ng new ag-grid-cli
cd ag-grid-cli</snippet>

<p>Let's update our dependencies - first let's install <code>ag-grid</code> and <code>ag-grid-angular</code>:</p>
<snippet language="sh">
npm install --save ag-grid-angular ag-grid-community
</snippet>

<p>We are also going to assume an Angular CLI version 1.0.0-rc.x and Angular versions  of 2.4.x for this example -
    you can use a higher (or lower) version here, but you'll need to ensure that you choose the corresponding version of
    Angular CLI if you do so.</p>

<p>Now let's create our main Application Component - this will be the component that creates the ag-Grid grid for
    us:</p>
<snippet language="sh">
ng generate component MyGridApplication # or my-grid-application</snippet>

<p>And a component that we'll use in our grid:</p>

<snippet language="sh">
ng generate component RedComponent  # or red-component</snippet>

<p>Based on the above commands, our application will have a selector of <code>app-my-grid-application></code> - you
    can change this of course, but we'll use the default here. Let's use this in our application:
</p>

<snippet language="html">
&lt;!-- src/app/app.component.html -->
 
&lt;app-my-grid-application&gt;&lt;/app-my-grid-application&gt;</snippet>

<p>Our grid component is going to be a simple renderer that styles its contents red:</p>
<snippet>
// src/app/red-component/red-component.component.ts
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
}</snippet>

<snippet language="html">
&lt;!-- src/app/red-component/red-component.component.html -->
&lt;span style="color: red"&gt;{{ params.value }}&lt;/span&gt;</snippet>

<p>For our Application component, we'll have the following:</p>

<snippet>
// src/app/my-grid-application/my-grid-application.component.ts
import {Component} from "@angular/core";
import {GridOptions} from "ag-grid-community";
import {RedComponentComponent} from "../red-component/red-component.component";

@Component({
    selector: 'app-my-grid-application',
    templateUrl: './my-grid-application.component.html'
})
export class MyGridApplicationComponent {
    private gridOptions: GridOptions;

    constructor() {
        this.gridOptions = &lt;GridOptions&gt;{};
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
}</snippet>

<snippet language="html">
&lt;!-- src/app/my-grid-application/my-grid-application.component.html -->
&lt;div style="width: 200px;"&gt;
    &lt;ag-grid-angular #agGrid style="width: 100%; height: 200px;" class="ag-theme-balham"
                 [gridOptions]="gridOptions"&gt;
    &lt;/ag-grid-angular&gt;
&lt;/div&gt;</snippet>

<p>Now we need to let Angular know about our new components, as well as the ag-Grid Module:</p>

<snippet>
// src/app/app.module.ts
import {BrowserModule} from "@angular/platform-browser";
import {NgModule} from "@angular/core";
import {AgGridModule} from "ag-grid-angular";
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
}</snippet>

<p>And finally, we need to update angular-cli.json to include the ag-Grid styles we want to include:</p>
<snippet>
// .angular-cli.json
"styles": [
    "../node_modules/ag-grid-community/dist/styles/ag-grid.css",
    "../node_modules/ag-grid-community/dist/styles/ag-theme-balham.css"
],</snippet>

<p>With these changes in place we can now build and run our application with:</p>

<snippet language="sh">
ng serve</snippet>

<p>The results of which will be:</p>

<img src="../images/angularcli_final.png" alt="Angular CLI Final" style="width: 500px">

<p>And that's it! Of course there is much more you can do with Angular CLI, but the above should illustrate how
    quick
    and easy it is to get up and running with Angular and ag-Grid in very few steps.</p>

<p>Please take a look at the <a href="../angular-more-details">More Details</a> section next for more detailed information on
    using Angular with ag-Grid.</p>

<?php include '../documentation-main/documentation_footer.php'; ?>
