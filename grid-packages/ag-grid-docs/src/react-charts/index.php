<?php
$pageTitle = "React Charts";
$pageDescription = "ag-Charts is a feature-rich React Charting Library. This page details how to get started using ag-Charts inside an React application.";
$pageKeywords = "Angular Datacharts";
$pageGroup = "basics";
include '../documentation-main/documentation_header.php';
?>
<script src="../_assets/js/copy-code.js"></script>
<style><?php include '../_assets/pages/get-started.css'; ?></style>
<div>
    <h1>React Charts | Get Started with ag-Charts and React</h1>

    <p class="lead" id="react-charts">
        ag-Charts is an exciting new addition to the ag-Charts family, offering both integrated as well as standalone
        fully functional
        charting capabilities.
    </p>

    <?php
    include './intro.php';
    ?>

    <h2>Getting Started</h2>
    <p>
        In this article we will walk you through the necessary steps to add ag-Charts to an existing JavaScript
        project and configure some of the essential features of it.
    </p>


    <h2 id="add-ag-charts-to-your-project">Add ag-Charts to Your Project</h2>
    <p>For the purposes of this tutorial, we are going to scaffold a react app with <a
                href="https://github.com/facebook/create-react-app">create-react-app</a>.
        Don't worry if your project has a different configuration. ag-Charts and the React wrapper are distributed as
        NPM packages, which should work with any common React project module bundler setup.
        Let's follow the <a href="https://github.com/facebook/create-react-app#quick-overview">create-react-app
            instructions</a> - run the following commands in your terminal:</p>
    <section>
        <button class="btn copy-code-button" onclick="copyCode(event)">Copy Code</button>
        <snippet language="sh">
            npx create-react-app my-app
            cd my-app
            npm start
        </snippet>
    </section>
    <div class="note"><a href="https://medium.com/@maybekatz/introducing-npx-an-npm-package-runner-55f7d4bd282b"
                         rel="nofollow">npx</a> comes with npm 5.2+ and higher, see <a
                href="https://gist.github.com/gaearon/4064d3c23a77c74a3614c498a8bb1c5f">instructions for older npm
            versions</a></div>
    <p>If everything goes well, <code>npm start</code> has started the web server and conveniently opened a browser
        pointing to <a href="http://localhost:3000">localhost:3000</a>.</p>
    <p>As a next step, let's add the ag-Charts NPM packages. run the following command in <code>my-app</code> (you may
        need a new instance of the terminal):</p>
    <section>
        <button class="btn copy-code-button" onclick="copyCode(event)" id="install-ag-react">Copy Code</button>
        <snippet language="sh">
            npm install --save ag-charts-community ag-charts-react
        </snippet>
    </section>
    <p>After a few seconds of waiting, you should be good to go. Let's get to the actual coding! Open
        <code>src/App.js</code> in your favorite text editor and change its contents to the following:</p>
    <section>
        <button class="btn copy-code-button" onclick="copyCode(event)">Copy Code</button>
        <pre class="language-jsx" ng-non-bindable>
<code>import React, {Component} from 'react';
import {render} from 'react-dom';
import {AgChartsReact} from 'ag-charts-react';

class ChartExample extends Component {
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

    constructor(props) {
        super(props);

        this.state = {
            options: {
                data: data,
                series: [{
                    xKey: 'quarter',
                    yKey: 'spending'
                }]
            },
        };
    }

    render() {
        return <AgChartsReact options={this.state.options}/>;
    }
}</code>
        </pre>
    </section>

    <p>Here we'll provide <code>options</code> charts configuration we want to use for our chart and the <code>series</code> to use to plot the data.</p>

    <p>
        The series <code>type</code> defaults to <code>'line'</code> so the only series configuration we
        need to specify are the ones that tell the series which keys to use to fetch the data to be
        plotted along the horizontal (x) and vertical (y) axes.</p>

    <p>The <code>series</code> property is an array
        because it is possible to supply multiple series (and of different kind too!) into a single chart.</p>

    <p>The default <code>axes</code> configuration is a <code>category</code> axis
        on the bottom and <code>number</code> axis on the left of a chart, - both of which are exactly what we need so we
        dont need to supply these here.</p>

    <p>The chart also features a legend by default which shows the <code>yKey</code> the series is using - in our case
        the the amount spent.
    </p>

    <p>With all this in place we should now see: </p>

    <p>
        <img alt="Line Chart" src="line-chart.png" style="margin-bottom: 0; width: 100%">
    </p>

    <h2>Customising the Legend</h2>
    <p>
        If we don't want the legend to show the value of the <code>yKey</code> itself we can give it a name - for example <code>'Coffee Spending'</code>.</p>

    <p>This name is more descriptive but it's also longer, so let's position the legend on the bottom of the chart to make more space for the series:</p>
<snippet language="diff">
constructor(props) {
    super(props);

    this.state = {
        options: {
            data: data,
            series: [{
                xKey: 'quarter',
                yKey: 'spending'
+               yName: 'Coffee Spending'
            }],
+           legend: {
+               position: 'bottom'
+           }
        };
    }
}
</snippet>

<p>
    <img alt="Line Chart" src="line-chart-legend.png" style="margin-bottom: 0; width: 100%">
</p>

<h2>Basic Column Chart</h2>

<p>
    Now let's try something more interesting.
    Let us say you want to visualize how much is spent on coffee, milk and tea in your company each quarter and in total.
    Your data might look something like this:
</p>

<snippet language="ts">
beverageSpending = [
    {
        beverage: 'Coffee',
        Q1: 450,
        Q2: 560,
        Q3: 600,
        Q4: 700
    },
    {
        beverage: 'Tea',
        Q1: 270,
        Q2: 380,
        Q3: 450,
        Q4: 520
    },
    {
        beverage: 'Milk',
        Q1: 180,
        Q2: 170,
        Q3: 190,
        Q4: 200
    },
];
</snippet>

<p>This time, let's choose another series type to plot the data: stacked columns.
    Here's the chart configuration we can use to do that:
</p>

<snippet language="ts">
constructor(props) {
    super(props);

    this.state = {
        options: {
        data: this.beverageSpending,
        series: [{
            type: 'column',
            xKey: 'beverage',
            yKeys: ['Q1', 'Q2', 'Q3', 'Q4']
        }]
    }
}
</snippet>


<p>
    Unlike <code>'line'</code> series charts, <code>'column'</code> series can have multiple <code>yKeys</code> which allow for stacking - in our case one block per quarter.</p>

<p>Chart tooltips are enabled by default so you can hover a block to see its value.</p>

<p>
    <img alt="Column Chart" src="beverage-expenses-no-captions.png" style="margin-bottom: 0px; width: 100%">
</p>

<h2>Labels & Titles</h2>

<p>We can enhance our chart by providing a label for each block segment. We can a label's <code>fontSize</code>, <code>fontFamily</code> and other properties,
    but for now we'll just accept the default values:
</p>

<snippet language="diff">
constructor(props) {
    super(props);

    this.state = {
        options: {
        data: this.beverageSpending,
        series: [{
            type: 'column',
            xKey: 'beverage',
            yKeys: ['Q1', 'Q2', 'Q3', 'Q4']
+           label: {}
        }]
    }
}
</snippet>

<p>
    <img alt="Column Chart" src="beverage-expenses-labels.png" style="margin-bottom: 0; width: 100%">
</p>

<p>If we then want to add title and subtitle captions to the chart, we can simply add this to our chart config:</p>

<snippet language="diff">
constructor(props) {
    super(props);

    this.state = {
        options: {
        data: this.beverageSpending,
+       title: {
+           text: 'Beverage Expenses'
+       },
+       subtitle: {
+           text: 'per quarter'
+       },
        series: [{
            type: 'column',
            xKey: 'beverage',
            yKeys: ['Q1', 'Q2', 'Q3', 'Q4']
            label: {}
        }]
    }
}
</snippet>

<p>
    <img alt="Column Chart" src="beverage-expenses-with-captions.png" style="margin-bottom: 0; width: 100%">
</p>

<p>
Now that you've had a taste of what it's like to use ag-Charts, we encourage you to explore our documentation
for specific chart types to learn more.
</p>

</div>

<?php include '../documentation-main/documentation_footer.php'; ?>
