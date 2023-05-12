---
title: "Get Started with AG Charts"
---

<style>
    .gatsby-resp-image-wrapper {
        margin-left: 0 !important;
        margin-right: 0 !important;
        margin-bottom: 1rem;
    }
    .gatsby-resp-image-image {
        box-shadow: none !important;
    }

    .code-tab pre {
        margin-top: 0;
    }

    .code-tab .nav-item {
        margin-bottom: 0 !important;
    }
</style>

AG Charts is a powerful standalone component with no dependencies. The charts factory API can be used to seamlessly create and update data visualizations independently of the grid.

<section class="code-tab mb-3">
<div class="card">
<div class="card-header">Quick Look Code Example</div>
<div class="card-body">
<ul class="nav nav-tabs">
<li class="nav-item">
<a  class="nav-link active" id="component-tab" data-toggle="tab" href="#component" role="tab" aria-controls="component" aria-selected="true">

<framework-specific-section frameworks="javascript">
<p>main.js</p>
</framework-specific-section>

<framework-specific-section frameworks="angular">
<p>app.component.ts</p>
</framework-specific-section>

<framework-specific-section frameworks="react">
<p>index.js</p>
</framework-specific-section>

<framework-specific-section frameworks="vue">
<p>App.vue</p>
</framework-specific-section>

</a>
</li>

<framework-specific-section frameworks="angular">
<li class="nav-item">
    <a class="nav-link" id="module-tab" data-toggle="tab" href="#module" role="tab" aria-controls="module" aria-selected="false">
        <p>app.module.ts</p>
    </a>
</li>
</framework-specific-section>

<li class="nav-item">
<a class="nav-link" id="template-tab" data-toggle="tab" href="#template" role="tab" aria-controls="template" aria-selected="false">

<framework-specific-section frameworks="javascript">
<p>index.html</p>
</framework-specific-section>

<framework-specific-section frameworks="angular">
<p>app.component.html</p>
</framework-specific-section>

<framework-specific-section frameworks="react">
<p>index.html</p>
</framework-specific-section>

<framework-specific-section frameworks="vue">
<p>main.js</p>
</framework-specific-section>

</a>
</li>
</ul>
<div class="tab-content">
<div class="tab-pane show active" id="component" role="tabpanel" aria-labelledby="component-tab">

<framework-specific-section frameworks="javascript">
<snippet transform={false}>
| var data = [
|     {
|         beverage: 'Coffee',
|         Q1: 700,
|         Q2: 600,
|         Q3: 560,
|         Q4: 450
|     },
|     {
|         beverage: 'Tea',
|         Q1: 520,
|         Q2: 450,
|         Q3: 380,
|         Q4: 270
|     },
|     {
|         beverage: 'Milk',
|         Q1: 200,
|         Q2: 190,
|         Q3: 170,
|         Q4: 180
|     },
| ];
|
| var options = {
|     container: document.querySelector('#myChart'),
|     data: data,
|     title: {
|         text: 'Beverage Expenses'
|     },
|     subtitle: {
|         text: 'per quarter'
|     },
|     footnote: {
|         text: 'Based on a sample size of 200 respondents'
|     },
|     padding: {
|         top: 40,
|         right: 40,
|         bottom: 40,
|         left: 40
|     },
|     series: [
|         { type: 'column', xKey: 'beverage', yKey: 'Q1', stacked: true },
|         { type: 'column', xKey: 'beverage', yKey: 'Q2', stacked: true },
|         { type: 'column', xKey: 'beverage', yKey: 'Q3', stacked: true },
|         { type: 'column', xKey: 'beverage', yKey: 'Q4', stacked: true },
|     ],
|     legend: {
|         spacing: 40
|     },
| };
|
| agCharts.AgChart.create(options);
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="angular">
<snippet language="jsx" transform={false}>
|import { Component } from '@angular/core';
|import { AgChartOptions } from 'ag-charts-community';
|
|@Component({
|    selector: 'my-app',
|    templateUrl: './app.component.html'
|})
|export class AppComponent {
|     public options: AgChartOptions;
|
|     beverageSpending = [
|         {
|             beverage: 'Coffee',
|             Q1: 700,
|             Q2: 600,
|             Q3: 560,
|             Q4: 450
|         },
|         {
|             beverage: 'Tea',
|             Q1: 520,
|             Q2: 450,
|             Q3: 380,
|             Q4: 270
|         },
|         {
|             beverage: 'Milk',
|             Q1: 200,
|             Q2: 190,
|             Q3: 170,
|             Q4: 180
|         },
|     ];
|     constructor() {
|         this.options = {
|             data: this.beverageSpending,
|             title: {
|                 text: 'Beverage Expenses',
|             },
|             subtitle: {
|                 text: 'per quarter',
|             },
|             footnote: {
|                 text: 'Based on a sample size of 200 respondents',
|             },
|             series: [
|                 { type: 'column', xKey: 'beverage', yKey: 'Q1', stacked: true },
|                 { type: 'column', xKey: 'beverage', yKey: 'Q2', stacked: true },
|                 { type: 'column', xKey: 'beverage', yKey: 'Q3', stacked: true },
|                 { type: 'column', xKey: 'beverage', yKey: 'Q4', stacked: true },
|             ],
|         };
|     }
| }
</snippet>

</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet language="jsx" transform={false}>
| import React, { Component } from 'react';
| import { AgChartsReact } from 'ag-charts-react';
|
| export default class ChartExample extends Component {
|     data = [
|         {
|             beverage: 'Coffee',
|             Q1: 700,
|             Q2: 600,
|             Q3: 560,
|             Q4: 450
|         },
|         {
|             beverage: 'Tea',
|             Q1: 520,
|             Q2: 450,
|             Q3: 380,
|             Q4: 270
|         },
|         {
|             beverage: 'Milk',
|             Q1: 200,
|             Q2: 190,
|             Q3: 170,
|             Q4: 180
|         },
|     ];
|
|     constructor(props) {
|         super(props);
|
|         this.state = {
|             options: {
|                 data: this.data,
|                 title: { text: 'Beverage Expenses' },
|                 subtitle: { text: 'per quarter' },
|                 footnote: { text: 'Based on a sample size of 200 respondents' },
|                 padding: {
|                     top: 40,
|                     right: 40,
|                     bottom: 40,
|                     left: 40,
|                 },
|                 series: [
|                     { type: 'column', xKey: 'beverage', yKey: 'Q1', stacked: true },
|                     { type: 'column', xKey: 'beverage', yKey: 'Q2', stacked: true },
|                     { type: 'column', xKey: 'beverage', yKey: 'Q3', stacked: true },
|                     { type: 'column', xKey: 'beverage', yKey: 'Q4', stacked: true },
|                 ],
|                 legend: { spacing: 40 },
|             },
|         };
|     }
|
|     render() {
|         return &lt;AgChartsReact options={this.state.options} />;
|     }
| }
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="vue">
<snippet language="html" transform={false}>
| &lt;template>
|    &lt;ag-charts-vue :options="options">&lt;/ag-charts-vue>
| &lt;/template>
|
| &lt;script>
|     import { AgChartsVue } from "ag-charts-vue3";
|
|     export default {
|         name: 'App',
|         components: {
|             AgChartsVue,
|         },
|         data: function () {
|             return {
|                 options: {
|                     data: [
|                       {
|                         beverage: 'Coffee',
|                         Q1: 700,
|                         Q2: 600,
|                         Q3: 560,
|                         Q4: 450
|                       },
|                       {
|                         beverage: 'Tea',
|                         Q1: 520,
|                         Q2: 450,
|                         Q3: 380,
|                         Q4: 270
|                       },
|                       {
|                         beverage: 'Milk',
|                         Q1: 200,
|                         Q2: 190,
|                         Q3: 170,
|                         Q4: 180
|                       },
|                     ],
|                     title: {
|                       text: 'Beverage Expenses',
|                     },
|                     subtitle: {
|                       text: 'per quarter',
|                     },
|                     footnote: {
|                       text: 'Based on a sample size of 200 respondents',
|                     },
|                     padding: {
|                       top: 40,
|                       right: 40,
|                       bottom: 40,
|                       left: 40,
|                     },
|                     series: [
|                       { type: 'column', xKey: 'beverage', yKey: 'Q1', stacked: true },
|                       { type: 'column', xKey: 'beverage', yKey: 'Q2', stacked: true },
|                       { type: 'column', xKey: 'beverage', yKey: 'Q3', stacked: true },
|                       { type: 'column', xKey: 'beverage', yKey: 'Q4', stacked: true },
|                     ],
|                     legend: { spacing: 40 },
|                 },
|             };
|         },
|     };
| &lt;/script>
|
| &lt;style>
| &lt;/style>
</snippet>
</framework-specific-section>

</div>

<framework-specific-section frameworks="angular">
<div class="tab-pane" id="module" role="tabpanel" aria-labelledby="module-tab">

<snippet language="jsx" transform={false}>
|import { BrowserModule } from '@angular/platform-browser';
|import { NgModule } from '@angular/core';
|import { AgChartsAngularModule } from 'ag-charts-angular';
|import { AppComponent } from './app.component';
|
|@NgModule({
|     imports: [
|         BrowserModule,
|         AgChartsAngularModule
|     ],
|     declarations: [AppComponent],
|     bootstrap: [AppComponent],
|})
|export class AppModule {
|}
</snippet>

</div>

</framework-specific-section>

<div class="tab-pane" id="template" role="tabpanel" aria-labelledby="template-tab">

<framework-specific-section frameworks="javascript">
<snippet language="html" transform={false}>
| &lt;!DOCTYPE html>
| &lt;html lang="en">
|     &lt;head>
|         &lt;title>AG Charts Basic Example&lt;/title>
|         &lt;script src="https://cdn.jsdelivr.net/npm/ag-charts-community/dist/ag-charts-community.min.js">
|         &lt;/script>
|     &lt;/head>
|     &lt;body>
|         &lt;div id="myChart" style="position: absolute; top: 0; right: 0; bottom: 0; left: 0;">&lt;/div>
|         &lt;script src="main.js">&lt;/script>
|     &lt;/body>
| &lt;/html>
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="angular">
<snippet language="html" transform={false}>
| &lt;ag-charts-angular
|     style="position: absolute; top: 0; right: 0; bottom: 0; left: 0;"
|     [options]="options">
| &lt;/ag-charts-angular>
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet language="html" transform={false}>
|&lt;div id="root">&lt;/div>
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="vue">
<snippet language="jsx" transform={false}>
|import { createApp } from 'vue'
|import App from './App.vue'
|
|createApp(App).mount('#app')
|
</snippet>
</framework-specific-section>

</div>
</div>
</div>
<div class="text-right" style="margin-top: -1.5rem;">

<framework-specific-section frameworks="javascript">
<a class="btn btn-dark mb-2 mr-3" href="https://plnkr.co/edit/4RA1NMI4unVHfRaV?preview" target="_blank">
    Open in <img src="../../images/resources/charts-getting-started/plunker_icon.svg" alt="Open in Plunker" style="width: 2.5rem" /> Plunker
</a>
</framework-specific-section>

<framework-specific-section frameworks="angular">
<a class="btn btn-dark mb-2 mr-3" href="https://stackblitz.com/edit/ag-charts-angular-hello-world-gjjfpt" target="_blank">
    Open in <img src="../../images/resources/charts-getting-started/stackBlitz_icon.svg" alt="Open in StackBlitz" style="height: 2.5rem"/> StackBlitz
</a>
</framework-specific-section>

<framework-specific-section frameworks="react">
<a class="btn btn-dark mb-2 mr-3" href="https://stackblitz.com/edit/ag-charts-react-hello-world-yduhy" target="_blank">
    Open in <img src="../../images/resources/charts-getting-started/stackBlitz_icon.svg" alt="Open in StackBlitz" style="height: 2.5rem"/> StackBlitz
</a>
</framework-specific-section>


<framework-specific-section frameworks="vue">
<a class="btn btn-dark mb-2 mr-3" href="https://codesandbox.io/s/ag-charts-vue-hello-world-cfoehv" target="_blank">
    Open in <img src="../../images/resources/charts-getting-started/codesandbox_icon.svg" alt="Open in StackBlitz" style="height: 2.5rem"/> CodeSandbox
</a>
</framework-specific-section>

</div>
</div>
</section>

<framework-specific-section frameworks="vue">
<note>
The "Quick Look Code" above is different to the code that runs in Stackblitz - this is because Stackblitz doesn't support .vue files at this time.
</note>
</framework-specific-section>

## Getting Started

<framework-specific-section frameworks="javascript">
In this article we will walk through the necessary steps to add AG Charts to an existing JavaScript project and produce your first chart.

<h2>Your First Chart</h2>

Let's say you want to visualise how much you spend on coffee each quarter and that you have the following data:

<snippet transform={false}>
| var data = [
|     {
|         quarter: 'Q1',
|         spending: 700,
|     },
|     {
|         quarter: 'Q2',
|         spending: 600,
|     },
|     {
|         quarter: 'Q3',
|         spending: 560,
|     },
|     {
|         quarter: 'Q4',
|         spending: 450,
|     },
| ];
</snippet>

To render it we can use this simple chart factory configuration:

<snippet transform={false}>
| agCharts.AgChart.create({
|     data: data,
|     container: document.querySelector('#myChart'),
|     series: [{
|         xKey: 'quarter',
|         yKey: 'spending',
|     }],
| });
</snippet>

Here we pass in the `data` we want to render, the `container` element for the chart (our chart won't be attached to the DOM without it) and the `series` to use to plot the data.

The series `type` defaults to `'line'` so the only series configuration we need to specify is which keys to use to fetch the data to be plotted along the horizontal (x) and vertical (y) axes.

</framework-specific-section>

<framework-specific-section frameworks="angular">
In this article we will walk through the necessary steps to add AG Charts to an existing Angular project and produce your first charts.

<h2>Add AG Charts to Your Project</h2>

For the purposes of this tutorial, we are going to scaffold an Angular app with the [Angular CLI](https://cli.angular.io/).

Don't worry if your project has a different configuration - AG Charts and its Angular wrapper are distributed as NPM packages and work with all common Angular project setups.

Let's follow the [Angular CLI instructions](https://github.com/angular/angular-cli#installation) and run the following in your terminal:

<snippet language="bash" transform={false}>
| npm install -g @angular/cli
|ng new my-app --routing false
|cd my-app
|ng serve
</snippet>

If everything goes well, `ng serve` has started the web server. You can open your app at <a href="http://localhost:4200" target="_blank">localhost:4200</a>.

As a next step, let's add the AG Charts NPM packages. If you are not using the latest version of Angular check the [compatibility table](#compatible-versions) below. Run the following command in `my-app` (you may need a new instance of the terminal):

<snippet language="bash" transform={false}>
| npm install --save ag-charts-community ag-charts-angular
|npm install # in certain circumstances npm will perform an "auto prune". This step ensures all expected dependencies are present
</snippet>

After a few seconds of waiting, you should be good to go. Let's get to the actual coding! As a first step, let's add the AG Charts Angular module to our app module (`src/app/app.module.ts`):

<snippet language="ts" transform={false}>
|import { BrowserModule } from '@angular/platform-browser';
|import { NgModule } from '@angular/core';
|import { AgChartsAngularModule } from 'ag-charts-angular';
|import { AppComponent } from './app.component';
|
|@NgModule({
|     imports: [
|         BrowserModule,
|         AgChartsAngularModule
|     ],
|     declarations: [AppComponent],
|     bootstrap: [AppComponent],
|})
|export class AppModule {}
</snippet>

Next, let's declare the basic chart configuration. Edit `src/app.component.ts`:

<snippet language="ts" transform={false}>
|import { Component } from '@angular/core';
|
|@Component({
|     selector: 'app-root',
|     templateUrl: './app.component.html'
|})
|export class AppComponent {
|     public options: any;
|
|     data = [
|         {
|             quarter: 'Q1',
|             spending: 700,
|         },
|         {
|             quarter: 'Q2',
|             spending: 600,
|         },
|         {
|             quarter: 'Q3',
|             spending: 560,
|         },
|         {
|             quarter: 'Q4',
|             spending: 450,
|         },
|     ];
|
|     constructor() {
|         this.options = {
|             data: this.data,
|             series: [{
|                 xKey: 'quarter',
|                 yKey: 'spending',
|             }],
|         };
|     }
| }
</snippet>

Here we'll provide the `options` we want to use for our chart, including the `series` to use to plot the data.

The series `type` defaults to `'line'`, so the only series configuration we need to specify is to tell the series which keys to use to fetch the data to be plotted along the horizontal (x) and vertical (y) axes.

Finally, let's add the component definition to our template. Edit `app/app.component.html` and remove the scaffold code:

<snippet language="html" transform={false}>
| &lt;ag-charts-angular
|     style="position: absolute; top: 0; right: 0; bottom: 0; left: 0;"
|     [options]="options">
| &lt;/ag-charts-angular>
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="react">
In this article we will walk through the necessary steps to add AG Charts to an existing React project and produce your first charts.

<h2> Add AG Charts to Your Project</h2>

For the purposes of this tutorial, we are going to scaffold a React app with [create-react-app](https://github.com/facebook/create-react-app).

Don't worry if your project has a different configuration - AG Charts and the React wrapper are distributed as NPM packages, which should work with any common React project module bundler setup.

Let's follow the [create-react-app instructions](https://github.com/facebook/create-react-app#quick-overview) and run the following commands in your terminal:

<snippet language="bash" transform={false}>
| npx create-react-app my-app
| cd my-app
| npm start
</snippet>

If everything goes well, `npm start` has started the web server and conveniently opened a browser pointing to <a href="http://localhost:3000" target="_blank">localhost:3000</a>.

As a next step, let's add the AG Charts NPM packages. Run the following command in `my-app` (you may need a new instance of the terminal):

<snippet language="bash" transform={false}>
| npm install --save ag-charts-community ag-charts-react
</snippet>

After a few seconds of waiting, you should be good to go. Let's get to the actual coding! Open `src/App.js` in your favourite text editor and change its contents to the following:

<snippet language="jsx" transform={false}>
|import React, { Component } from 'react';
|import { AgChartsReact } from 'ag-charts-react';
|
|export default class ChartExample extends Component {
|     data = [
|         {
|             quarter: 'Q1',
|             spending: 700,
|         },
|         {
|             quarter: 'Q2',
|             spending: 600,
|         },
|         {
|             quarter: 'Q3',
|             spending: 560,
|         },
|         {
|             quarter: 'Q4',
|             spending: 450,
|         },
|     ];
|
|     constructor(props) {
|         super(props);
|
|         this.state = {
|             options: {
|                 data: this.data,
|                 series: [{
|                     xKey: 'quarter',
|                     yKey: 'spending',
|                 }],
|             },
|         };
|     }
|
|     render() {
|         return &lt;AgChartsReact options={this.state.options} />;
|     }
| }
</snippet>

Here we'll provide the `options` we want to use for our chart, including the `series` to use to plot the data.

The series `type` defaults to `'line'` so the only series configuration we need to specify is to tell the series which keys to use to fetch the data to be plotted along the horizontal (x) and vertical (y) axes.

</framework-specific-section>

<framework-specific-section frameworks="vue">
In this article we will walk through the necessary steps to add AG Charts to an existing Vue project and produce your first charts.

<h2>Add AG Charts to Your Project</h2>

For the purposes of this tutorial, we are going to scaffold an Vue app with the [Vue CLI](https://cli.vuejs.org/).

Don't worry if your project has a different configuration. AG Charts and its Vue wrapper are distributed as NPM packages and work with any common Vue project setup.

Let's follow the [Vue CLI instructions](https://cli.vuejs.org/) and run the following in your terminal:

<snippet language="bash" transform={false}>
|npm install -g @vue/cli
|vue create my-project
|
</snippet>

When prompted choose `default (babel, eslint)`:

![Select Default Features](vue-cli-step.png)

We're now ready to start our application:

<snippet language="bash" transform={false}>
|cd my-project
|npm run serve
|
</snippet>

If everything goes well, `npm run serve` has started the web server. You can open the default app at <a href="http://localhost:8080" target="_blank">localhost:8080</a>.

Let's add the AG Charts NPM packages. Run the following command in `my-project` (you may need a new instance of the terminal):

<snippet language="bash" transform={false}>
| npm install --save ag-charts-community ag-charts-vue3 vue-property-decorator
</snippet>

After a few seconds of waiting, you should be good to go. Let's get to the actual coding! As a first step, let's add the AG Charts module. As this will be a simple example we can delete the `src/components` directory. Our example application will live in `src/App.vue`.

Let's add the component definition to our template. Edit `src/App.vue` and replace the scaffold code:

<snippet language="html" transform={false}>
| &lt;template>
|   &lt;div id="app">
|       &lt;ag-charts-vue :options="options">&lt;/ag-charts-vue>
|   &lt;/div>
| &lt;/template>
</snippet>

Next, let's declare the basic charts configuration. Edit `src/App.vue`:

<snippet language="html" transform={false}>
| &lt;script>
|   import { AgChartsVue } from 'ag-charts-vue3';
|
|   export default {
|     name: 'App',
|     components: {
|       AgChartsVue,)
|     },
|     data() {
|       return {
|         options: {
|           data: [
|             {
|                   quarter: 'Q1',
|                   spending: 700,
|             },
|             {
|                   quarter: 'Q2',
|                   spending: 600,
|             },
|             {
|                   quarter: 'Q3',
|                   spending: 560,
|             },
|             {
|                   quarter: 'Q4',
|                   spending: 450,
|             },
|           ],
|           series: [{
|             xKey: 'quarter',
|             yKey: 'spending',
|           }],
|         },
|       };
|     },
|   };
| &lt;/script>
</snippet>
&nbsp;
Here we'll provide the `options` we want to use for our chart, including the `series` to use to plot the data.
&nbsp;
The series `type` defaults to `'line'` so the only series configuration we need to specify is to tell the series which keys to use to fetch the data to be plotted along the horizontal (x) and vertical (y) axes.</p>
</framework-specific-section>

The `series` property is an array because it is possible to supply multiple series (including mixed kinds!) into a single chart.

The default `axes` configuration is a `category` axis on the bottom and `number` axis on the left of a chart, both of which are exactly what we need in this case, so we don't need to supply these here.

## Legend

By default, the chart displays a legend when there is more than one series present. To enable the legend for a chart with a single series, set `legend.enabled` to `true`.

The chart legend uses the `yKey` for the series, which in this case is `'spending'`. This can be renamed using the `yName` property.

<framework-specific-section frameworks="javascript">
<snippet language="diff" transform={false}>
| agCharts.AgChart.create({
|     data: data,
|     container: document.querySelector('#myChart'),
|     series: [{
|         xKey: 'quarter',
|         yKey: 'spending',
|+        yName: 'Coffee Spending',
|     }],
|+    legend: {
|+        enabled: true,
|+   },
| });
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="angular">
<snippet language="diff" transform={false}>
| constructor() {
|     this.options = {
|         data: this.data,
|         series: [{
|             xKey: 'quarter',
|             yKey: 'spending',
|+            yName: 'Coffee Spending',
|         }],
|+        legend: {
|+            enabled: true,
|+        },
|     };
| }
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet language="diff" transform={false}>
| constructor(props) {
|     super(props);
|
|     this.state = {
|         options: {
|             data: this.data,
|             series: [{
|                 xKey: 'quarter',
|                 yKey: 'spending',
|+                yName: 'Coffee Spending',
|             }],
|+            legend: {
|+                enabled: true,
|+            },
|         }
|     }
| }
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="vue">
<snippet language="diff" transform={false}>
| data() {
|   return {
|     options: {
|       data: [
|         {
|           quarter: 'Q1',
|           spending: 700,
|         },
|         {
|           quarter: 'Q2',
|           spending: 600,
|         },
|         {
|           quarter: 'Q3',
|           spending: 560,
|         },
|         {
|           quarter: 'Q4',
|           spending: 450,
|         },
|       ],
|       series: [{
|         xKey: 'quarter',
|         yKey: 'spending',
|+        yName: 'Coffee Spending',
|       }],
|+      legend: {
|+        enabled: true,
|+      },
|     },
|   };
| }
</snippet>
</framework-specific-section>

![Line chart with legend](line-chart-legend.png)

## Basic Column Chart

Now let's try something more interesting. Let's say you want to visualise how much is spent on coffee, milk and tea in your company each quarter and in total. Your data might look something like this:

<snippet transform={false}>
| var data = [
|     {
|         beverage: 'Coffee',
|         Q1: 700,
|         Q2: 600,
|         Q3: 560,
|         Q4: 450
|     },
|     {
|         beverage: 'Tea',
|         Q1: 520,
|         Q2: 450,
|         Q3: 380,
|         Q4: 270
|     },
|     {
|         beverage: 'Milk',
|         Q1: 200,
|         Q2: 190,
|         Q3: 170,
|         Q4: 180
|     },
| ];
</snippet>

<framework-specific-section frameworks="javascript">

This time, let's choose another series type to plot the data: stacked columns. Here's the chart factory configuration we can use to do
that:

<snippet transform={false}>
| agCharts.AgChart.create({
|     data: data,
|     container: document.querySelector('#myChart'),
|     series: [
|         { type: 'column', xKey: 'beverage', yKey: 'Q1', stacked: true },
|         { type: 'column', xKey: 'beverage', yKey: 'Q2', stacked: true },
|         { type: 'column', xKey: 'beverage', yKey: 'Q3', stacked: true },
|         { type: 'column', xKey: 'beverage', yKey: 'Q4', stacked: true },
|     ],
| });
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="frameworks">
This time, let's choose another series type to plot the data: stacked columns. Here's the chart configuration we can use to do that:
</framework-specific-section>

<framework-specific-section frameworks="angular">
<snippet language="ts" transform={false}>
| constructor() {
|     this.options = {
|         data: this.data,
|         series: [
|             { type: 'column', xKey: 'beverage', yKey: 'Q1', stacked: true },
|             { type: 'column', xKey: 'beverage', yKey: 'Q2', stacked: true },
|             { type: 'column', xKey: 'beverage', yKey: 'Q3', stacked: true },
|             { type: 'column', xKey: 'beverage', yKey: 'Q4', stacked: true },
|         ],
|     };
| }
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform={false}>
| constructor(props) {
|     super(props);
|
|     this.state = {
|         options: {
|             data: this.data,
|             series: [
|                 { type: 'column', xKey: 'beverage', yKey: 'Q1', stacked: true },
|                 { type: 'column', xKey: 'beverage', yKey: 'Q2', stacked: true },
|                 { type: 'column', xKey: 'beverage', yKey: 'Q3', stacked: true },
|                 { type: 'column', xKey: 'beverage', yKey: 'Q4', stacked: true },
|             ],
|         }
|     }
| }
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="vue">
<snippet transform={false}>
| data() {
|   return {
|     options: {
|       data: [
|         {
|           beverage: 'Coffee',
|           Q1: 700,
|           Q2: 600,
|           Q3: 560,
|           Q4: 450
|         },
|         {
|           beverage: 'Tea',
|           Q1: 520,
|           Q2: 450,
|           Q3: 380,
|           Q4: 270
|         },
|         {
|           beverage: 'Milk',
|           Q1: 200,
|           Q2: 190,
|           Q3: 170,
|           Q4: 180
|         },
|       ],
|       series: [
|           { type: 'column', xKey: 'beverage', yKey: 'Q1', stacked: true },
|           { type: 'column', xKey: 'beverage', yKey: 'Q2', stacked: true },
|           { type: 'column', xKey: 'beverage', yKey: 'Q3', stacked: true },
|           { type: 'column', xKey: 'beverage', yKey: 'Q4', stacked: true },
|       ],
|     },
|   };
| }
</snippet>
</framework-specific-section>

Chart tooltips are enabled by default so you can hover over a block to see its value.

![Column chart](beverage-expenses-no-labels.png)

## Labels and Titles

We can enhance our chart by providing a label for each block segment. We can set a label's `fontSize`, `fontFamily` and other properties, but for now we'll just accept the default values:

<framework-specific-section frameworks="javascript">

<snippet language="diff" transform={false}>
|agCharts.AgChart.create({
|     data: data,
|     container: document.querySelector('#myChart'),
|     series: [
|         {
|             type: 'column',
|             xKey: 'beverage',
|             yKey: 'Q1',
|             stacked: true,
|+            label: {},
|         },
|         {
|             type: 'column',
|             xKey: 'beverage',
|             yKey: 'Q2',
|             stacked: true,
|+            label: {},
|         },
|         {
|             type: 'column',
|             xKey: 'beverage',
|             yKey: 'Q3',
|             stacked: true,
|+            label: {},
|         },
|         {
|             type: 'column',
|             xKey: 'beverage',
|             yKey: 'Q4',
|             stacked: true,
|+            label: {},
|         },
|     ],
| });
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="angular">
<snippet language="diff" transform={false}>
| constructor() {
|     this.options = {
|         data: this.data,
|         series: [
|             {
|                 type: 'column',
|                 xKey: 'beverage',
|                 yKey: 'Q1',
|                 stacked: true,
|+                label: {},
|             },
|             {
|                 type: 'column',
|                 xKey: 'beverage',
|                 yKey: 'Q2',
|                 stacked: true,
|+                label: {},
|             },
|             {
|                 type: 'column',
|                 xKey: 'beverage',
|                 yKey: 'Q3',
|                 stacked: true,
|+                label: {},
|             },
|             {
|                 type: 'column',
|                 xKey: 'beverage',
|                 yKey: 'Q4',
|                 stacked: true,
|+                label: {},
|             },
|         ],
|     };
| }
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet language="diff" transform={false}>
| constructor(props) {
|     super(props);
|
|     this.state = {
|         options: {
|             data: this.data,
|             series: [
|                 {
|                     type: 'column',
|                     xKey: 'beverage',
|                     yKey: 'Q1',
|                     stacked: true,
|+                    label: {},
|                 },
|                 {
|                     type: 'column',
|                     xKey: 'beverage',
|                     yKey: 'Q2',
|                     stacked: true,
|+                    label: {},
|                 },
|                 {
|                     type: 'column',
|                     xKey: 'beverage',
|                     yKey: 'Q3',
|                     stacked: true,
|+                    label: {},
|                 },
|                 {
|                     type: 'column',
|                     xKey: 'beverage',
|                     yKey: 'Q4',
|                     stacked: true,
|+                    label: {},
|                 },
|             ],
|         }
|     }
| }
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="vue">
<snippet language="diff" transform={false}>
| data() {
|   return {
|     options: {
|       data: [
|         {
|           beverage: 'Coffee',
|           Q1: 700,
|           Q2: 600,
|           Q3: 560,
|           Q4: 450
|         },
|         {
|           beverage: 'Tea',
|           Q1: 520,
|           Q2: 450,
|           Q3: 380,
|           Q4: 270
|         },
|         {
|           beverage: 'Milk',
|           Q1: 200,
|           Q2: 190,
|           Q3: 170,
|           Q4: 180
|         },
|       ],
|       series: [
|         {
|           type: 'column',
|           xKey: 'beverage',
|           yKey: 'Q1',
|           stacked: true,
|+          label: {},
|         },
|         {
|           type: 'column',
|           xKey: 'beverage',
|           yKey: 'Q2',
|           stacked: true,
|+          label: {},
|         },
|         {
|           type: 'column',
|           xKey: 'beverage',
|           yKey: 'Q3',
|           stacked: true,
|+          label: {},
|         },
|         {
|           type: 'column',
|           xKey: 'beverage',
|           yKey: 'Q4',
|           stacked: true,
|+          label: {},
|         },
|       ],
|     },
|   };
| }
</snippet>
</framework-specific-section>

![Column chart with labels](beverage-expenses-labels.png)

If we then want to add a title and subtitle to the chart, we can simply add this to our chart config:

<framework-specific-section frameworks="javascript">
<snippet language="diff" transform={false}>
| agCharts.AgChart.create({
|     data: data,
|     container: document.querySelector('#myChart'),
|+    title: {
|+        text: 'Beverage Expenses',
|+    },
|+    subtitle: {
|+        text: 'per quarter',
|+    },
|+    footnote: {
|+        text: 'Based on a sample size of 200 respondents',
|+    },
|     series: [
|         {
|             type: 'column',
|             xKey: 'beverage',
|             yKey: 'Q1',
|             stacked: true,
|             label: {},
|         },
|         {
|             type: 'column',
|             xKey: 'beverage',
|             yKey: 'Q2',
|             stacked: true,
|             label: {},
|         },
|         {
|             type: 'column',
|             xKey: 'beverage',
|             yKey: 'Q3',
|             stacked: true,
|             label: {},
|         },
|         {
|             type: 'column',
|             xKey: 'beverage',
|             yKey: 'Q4',
|             stacked: true,
|             label: {},
|         },
|     ],
| });
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="angular">
<snippet language="diff" transform={false}>
| constructor() {
|     this.options = {
|         data: this.data,
|+        title: {
|+            text: 'Beverage Expenses',
|+        },
|+        subtitle: {
|+            text: 'per quarter',
|+        },
|+        footnote: {
|+            text: 'Based on a sample size of 200 respondents',
|+        },
|         series: [
|             {
|                 type: 'column',
|                 xKey: 'beverage',
|                 yKey: 'Q1',
|                 stacked: true,
|                 label: {},
|             },
|             {
|                 type: 'column',
|                 xKey: 'beverage',
|                 yKey: 'Q2',
|                 stacked: true,
|                 label: {},
|             },
|             {
|                 type: 'column',
|                 xKey: 'beverage',
|                 yKey: 'Q3',
|                 stacked: true,
|                 label: {},
|             },
|             {
|                 type: 'column',
|                 xKey: 'beverage',
|                 yKey: 'Q4',
|                 stacked: true,
|                 label: {},
|             },
|         ],
|     };
| }
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet language="diff" transform={false}>
| constructor(props) {
|     super(props);
|
|     this.state = {
|         options: {
|             data: this.data,
|+            title: {
|+                text: 'Beverage Expenses',
|+            },
|+            subtitle: {
|+                text: 'per quarter',
|+            },
|+            footnote: {
|+                text: 'Based on a sample size of 200 respondents',
|+            },
|             series: [
|                 {
|                     type: 'column',
|                     xKey: 'beverage',
|                     yKey: 'Q1',
|                     stacked: true,
|                     label: {},
|                 },
|                 {
|                     type: 'column',
|                     xKey: 'beverage',
|                     yKey: 'Q2',
|                     stacked: true,
|                     label: {},
|                 },
|                 {
|                     type: 'column',
|                     xKey: 'beverage',
|                     yKey: 'Q3',
|                     stacked: true,
|                     label: {},
|                 },
|                 {
|                     type: 'column',
|                     xKey: 'beverage',
|                     yKey: 'Q4',
|                     stacked: true,
|                     label: {},
|                 },
|             ],
|         }
|     }
| }
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="vue">
<snippet language="diff" transform={false}>
| data() {
|   return {
|     options: {
|       data: [
|         {
|           beverage: 'Coffee',
|           Q1: 700,
|           Q2: 600,
|           Q3: 560,
|           Q4: 450
|         },
|         {
|           beverage: 'Tea',
|           Q1: 520,
|           Q2: 450,
|           Q3: 380,
|           Q4: 270
|         },
|         {
|           beverage: 'Milk',
|           Q1: 200,
|           Q2: 190,
|           Q3: 170,
|           Q4: 180
|         },
|       ],
|+      title: {
|+        text: 'Beverage Expenses',
|+      },
|+      subtitle: {
|+        text: 'per quarter',
|+      },
|+      footnote: {
|+        text: 'Based on a sample size of 200 respondents',
|+      },
|       series: [
|         {
|           type: 'column',
|           xKey: 'beverage',
|           yKey: 'Q1',
|           stacked: true,
|           label: {},
|         },
|         {
|           type: 'column',
|           xKey: 'beverage',
|           yKey: 'Q2',
|           stacked: true,
|           label: {},
|         },
|         {
|           type: 'column',
|           xKey: 'beverage',
|           yKey: 'Q3',
|           stacked: true,
|           label: {},
|         },
|         {
|           type: 'column',
|           xKey: 'beverage',
|           yKey: 'Q4',
|           stacked: true,
|           label: {},
|         },
|       ],
|     },
|   };
| }
</snippet>
</framework-specific-section>

![Column chart with captions](beverage-expenses-captions.png)


<framework-specific-section frameworks="javascript">

<h2>Install AG Charts with NPM</h2>

To install AG Charts and update your package.json file run:

<snippet language="bash" transform={false}>
| npm install --save ag-charts-community
</snippet>

Then `import` the module as follows:

<snippet transform={false}>
| import * as agCharts from 'ag-charts-community';
</snippet>

Creating charts is done using the `agCharts.AgChart` factory as shown in the example above, i.e.

<snippet transform={false}>
| agCharts.AgChart.create(options);
</snippet>
</framework-specific-section>


<framework-specific-section frameworks="angular">
<h2>Compatible Versions</h2>

The table below gives the ranges of compatible versions of AG Charts with Angular versions.

<note>
AG Charts Legacy is only required for apps on Angular v8-11 that wish to use AG Charts v6+. See [AG Grid Legacy](/angular-compatibility/#ag-grid-legacy) for more details about our legacy packages.
</note>

| Angular | AG Charts | AG Charts Package   |
|---------| --------- | --------------------|
| 8 - 11  | 2 - 5     | ag-charts-angular   |
 | 8 - 11  | 6+        | ag-charts-angular-legacy   |
 | 12+     | 6+        | ag-charts-angular   |

</framework-specific-section>


Now that you've had a taste of what it's like to use AG Charts, we encourage you to explore our documentation to learn more.