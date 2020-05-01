<?php
$pageTitle = "Angular Charts";
$pageDescription = "ag-Charts is a feature-rich Angular Charting Library. This page details how to get started using ag-Charts inside an Angular application.";
$pageKeywords = "Angular Charts";
$pageGroup = "basics";
include '../documentation-main/documentation_header.php';
?>

<h1>Angular Charts | Get Started with ag-Charts and Angular</h1>

<p class="lead" id="angular-charts">
    ag-Charts is an exciting new addition to the ag-Grid family, offering both integrated as well as standalone fully functional
    charting capabilities.
</p>

<?php include './intro.php'; ?>

<h2>Getting Started</h2>

<p>
    In this article we will walk you through the necessary steps to add ag-Charts to an existing Angular
    project and produce your first charts.
</p>

<h2 id="add-ag-charts-to-your-project">Add ag-Charts to Your Project</h2>

<p>
    For the purposes of this tutorial, we are going to scaffold an Angular app with the
    <a href="https://cli.angular.io/">Angular CLI</a>.
</p>

<p>
    Don't worry if your project has a different configuration - ag-Charts and its Angular wrapper are distributed as NPM
    packages and work with all common Angular project setups.
</p>

<p>
    Let's follow the <a href="https://github.com/angular/angular-cli#installation">Angular CLI instructions</a> and run
    the following in your terminal:
</p>

<?= createSnippet(<<<SNIPPET
npm install -g @angular/cli
ng new my-app --routing false
cd my-app
ng serve
SNIPPET
, 'sh') ?>

<p>
    If everything goes well, <code>ng serve</code> has started the web server. You can open your app at
    <a href="http://localhost:4200" target="_blank">localhost:4200</a>.
</p>

<p>
    As a next step, let's add the ag-Charts NPM packages. Run the following command in <code>my-app</code> (you may
    need a new instance of the terminal):
</p>

<?= createSnippet(<<<SNIPPET
npm install --save ag-charts-community ag-charts-angular
npm install # in certain circumstances npm will perform an "auto prune". This step ensures all expected dependencies are present
SNIPPET
, 'sh') ?>

<p>
    After a few seconds of waiting, you should be good to go. Let's get to the actual coding! As a first step, let's add
    the ag-Charts Angular module to our app module (<code>src/app/app.module.ts</code>):
</p>

<?= createSnippet(<<<SNIPPET
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AgChartsAngularModule } from 'ag-charts-angular';
import { AppComponent } from './app.component';

@NgModule({
    imports: [
        BrowserModule,
        AgChartsAngularModule
    ],
    declarations: [AppComponent],
    bootstrap: [AppComponent],
})
export class AppModule {
}
SNIPPET
, 'ts') ?>

<p>Next, let's declare the basic chart configuration. Edit <code>src/app.component.ts</code>:</p>

<?= createSnippet(<<<SNIPPET
import { Component } from '@angular/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html'
})
export class AppComponent {
    public options: any;

    data = [
        {
            quarter: 'Q1',
            spending: 450,
        },
        {
            quarter: 'Q2',
            spending: 560,
        },
        {
            quarter: 'Q3',
            spending: 600,
        },
        {
            quarter: 'Q4',
            spending: 700,
        },
    ];

    constructor() {
        this.options = {
            data: this.data,
            series: [{
                xKey: 'quarter',
                yKey: 'spending',
            }],
        };
    }
}
SNIPPET
, 'ts') ?>

<p>
    Here we'll provide the <code>options</code> we want to use for our chart, including the <code>series</code> to use
    to plot the data.
</p>

<p>
    The series <code>type</code> defaults to <code>'line'</code>, so the only series configuration we
    need to specify is to tell the series which keys to use to fetch the data to be
    plotted along the horizontal (x) and vertical (y) axes.
</p>

<p>
    Finally, let's add the component definition to our template. Edit <code>app/app.component.html</code> and remove the
    scaffold code:
</p>

<?= createSnippet(<<<SNIPPET
<ag-charts-angular
    style="position: absolute; top: 0; right: 0; bottom: 0; left: 0;"
    [options]="options">
</ag-charts-angular>
SNIPPET
, 'html') ?>

<p>
    The <code>series</code> property is an array because it is possible to supply multiple series (including mixed
    kinds!) into a single chart.
</p>

<p>
    The default <code>axes</code> configuration is a <code>category</code> axis on the bottom and <code>number</code>
    axis on the left of a chart, both of which are exactly what we need, so we don't need to supply these here.
</p>

<p>
    The chart also features a legend by default which shows the <code>yKey</code> the series is using, in our case
    <code>'spending'</code>.
</p>

<img alt="Line Chart" src="line-chart.png" style="margin-bottom: 0; width: 100%">

<h2>Customising the Legend</h2>

<p>
    If we don't want the legend to show the value of the <code>yKey</code> itself we can give it a name, for example
    <code>'Coffee Spending'</code>.
</p>

<p>
    This name is more descriptive but also longer, so let's position the legend on the bottom of the chart to make more
    space for the series:
</p>

<?= createSnippet(<<<SNIPPET
constructor() {
    this.options = {
        data: this.data,
        series: [{
            xKey: 'quarter',
            yKey: 'spending',
+           yName: 'Coffee Spending',
        }],
+       legend: {
+           position: 'bottom',
+       },
    };
}
SNIPPET
, 'diff') ?>

<img alt="Line Chart" src="line-chart-legend.png" style="margin-bottom: 0; width: 100%">

<h2>Basic Column Chart</h2>

<p>
    Now let's try something more interesting.
    Let us say you want to visualize how much is spent on coffee, milk and tea in your company each quarter and in total.
    Your data might look something like this:
</p>

<?= createSnippet(<<<SNIPPET
data = [
    {
        beverage: 'Coffee',
        Q1: 450,
        Q2: 560,
        Q3: 600,
        Q4: 700,
    },
    {
        beverage: 'Tea',
        Q1: 270,
        Q2: 380,
        Q3: 450,
        Q4: 520,
    },
    {
        beverage: 'Milk',
        Q1: 180,
        Q2: 170,
        Q3: 190,
        Q4: 200,
    },
];
SNIPPET
) ?>

<p>
    This time, let's choose another series type to plot the data: stacked columns.
    Here's the chart configuration we can use to do that:
</p>

<?= createSnippet(<<<SNIPPET
constructor() {
    this.options = {
        data: this.data,
        series: [{
            type: 'column',
            xKey: 'beverage',
            yKeys: ['Q1', 'Q2', 'Q3', 'Q4'],
        }],
    };
}
SNIPPET
) ?>

<p>
    Unlike <code>'line'</code> series charts, <code>'column'</code> series can have multiple <code>yKeys</code> which
    allow for stacking, in our case one block per quarter.</p>

<p>Chart tooltips are enabled by default so you can hover over a block to see its value.</p>

<img alt="Column Chart" src="beverage-expenses-no-captions.png" style="margin-bottom: 0px; width: 100%">

<h2>Labels and Titles</h2>

<p>
    We can enhance our chart by providing a label for each block segment. We can set a label's <code>fontSize</code>,
    <code>fontFamily</code> and other properties, but for now we'll just accept the default values:
</p>

<?= createSnippet(<<<SNIPPET
constructor() {
    this.options = {
        data: this.data,
        series: [{
            type: 'column',
            xKey: 'beverage',
            yKeys: ['Q1', 'Q2', 'Q3', 'Q4'],
+           label: {},
        }],
    };
}
SNIPPET
, 'diff') ?>

<img alt="Column Chart" src="beverage-expenses-labels.png" style="margin-bottom: 0; width: 100%">

<p>If we then want to add a title and subtitle to the chart, we can simply add this to our chart config:</p>

<?= createSnippet(<<<SNIPPET
constructor() {
    this.options = {
        data: this.data,
+       title: {
+           text: 'Beverage Expenses',
+       },
+       subtitle: {
+           text: 'per quarter',
+       },
        series: [{
            type: 'column',
            xKey: 'beverage',
            yKeys: ['Q1', 'Q2', 'Q3', 'Q4'],
            label: {},
        }],
    };
}
SNIPPET
, 'diff') ?>

<img alt="Column Chart" src="beverage-expenses-with-captions.png" style="margin-bottom: 0; width: 100%">

<p>
    Now that you've had a taste of what it's like to use ag-Charts, we encourage you to explore our documentation
    to learn more.
</p>

<h2>Next Up</h2>

<p>
    Continue to the next section to see the <a href="../javascript-charts-api/">API Reference</a>.
</p>

<style><?php include '../_assets/pages/copy-code.css'; ?></style>
<script src="../_assets/js/copy-code.js"></script>

<?php include '../documentation-main/documentation_footer.php'; ?>
