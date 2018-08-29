<?php

$pageTitle = "ag-Grid Blog: Meet the Best React Grid";
$pageDescription = "Get started with React and ag-Grid";
$pageKeyboards = "ag-grid React grid datagrid";
$socialUrl = "https://www.ag-grid.com/best-react-data-grid/";
$socialImage = "https://www.ag-grid.com/best-react-data-grid/img.svg";

include('../includes/mediaHeader.php');
?>

<div>

    <!-- <link rel="stylesheet" href="../documentation-main/documentation.css"> -->
    <h1>Meet the Best React Grid</h1>
    <p class="blog-author">Sophia Lazarova | 27nd February 2018</p>

    <div>
        <a href="https://twitter.com/share" class="twitter-share-button"
            data-url="https://www.ag-grid.com/best-react-data-grid/"
            data-text="The Best React Data Grid" data-via="sophialazarova"
            data-size="large">Tweet</a>
        <script>!function (d, s, id) {
                var js, fjs = d.getElementsByTagName(s)[0], p = /^http:/.test(d.location) ? 'http' : 'https';
                if (!d.getElementById(id)) {
                    js = d.createElement(s);
                    js.id = id;
                    js.src = p + '://platform.twitter.com/widgets.js';
                    fjs.parentNode.insertBefore(js, fjs);
                }
            }(document, 'script', 'twitter-wjs');</script>
    </div>

    <img src="cover.svg" class="large-cover-img img-fluid">

    <div class="row">
        <div class="col-md-8">
    
            <p class="lead">
                <strong>You love React? ag-Grid loves it too! Build your first React ag-Grid application and get on track with the best React grid.</strong>
            </p>
            <p>In this blog post we will dive in the React world and build an application with ag-Grid. We will gradually explore different features and capabilities of the grid while building our app.</p>

            <p>Pack your React tools, get your hands on the keyboards and let's get started!</p>

            <h2>Hello React!</h2>

            <p>To set up a basic React application we will use the React-Create-App. If haven't already installed it you can do it with the following command:</p>

            <pre><code class="language-bash">    npm install -g create-react-app</code></pre>

            <p>Next we simply create and start our React application:</p>

            <pre><code class="language-bash"> 
    create-react-app ag-grid-app
    cd ag-grid-app
    npm start
            </code></pre>

            <h2>Install ag-Grid</h2>

            <p>Time to install ag-Grid in our React application. The way to do this is with the ag-Grid npm packages.
            To install ag-Grid run the following command:</p>

            <pre><code class="language-bash">    npm install --save ag-grid-community ag-grid-react</code></pre>

            <p>You might have noticed that we are installing two packages. In order to use ag-Grid with React we need to install not only the ag-grid package but also ag-grid-react which contains the actual React component.</p>

            <h3>ag-Grid Enterprise</h3>

            <p>To use the enterprise features of the grid you need to install also ag-grid-enterprise.</p>

            <pre><code class="language-bash">   npm install --save ag-grid-enterprise</code></pre>

            <p>The Enterprise dependency has to be made available before any Grid related component, so consider importing it in your React bootstrap file (index.js) before kicking off the actual application:</p>

            <pre><code class="language-javascript">
    import 'ag-grid-enterprise';
    ReactDOM.render(&lt;GridExample /&gt;, document.getElementById('root'));
            </code></pre>

            <p>Since the React Component wraps the functionality of ag-Grid, there will be no difference between core ag-Grid and React ag-Grid when it comes to features.</p>

            <h2>Grid Component</h2>

            <p>Navigate to the ag-grid-app/src directory. You will see that the template project contains a bit more files than we need.
            Mark and delete the following files:</p>

            <ul>
            <li>App.js</li>

            <li>App.css</li>

            <li>App.test.js</li>

            <li>logo.svg</li>
            </ul>

            <p>Create a new file called gridExample.jsx. This will be our ag-Grid configuration. Before implementing our component don't forget to add the relevant imports:</p>

            <pre><code class="language-javascript">
    import React, { Component } from 'react';
    import {AgGridReact} from 'ag-grid-react';
    </code></pre>

    <p>So let's start implementing our component!
    Create a class called GridExample, extending Component, which has the following structure:</p>

    <pre><code class="language-javascript">
    class GridExample extends Component {

        constructor(props) {
            super(props);
        }

        render() {
        }
    }
    export default GridExample;
            </code></pre>

            <h3>Configuring the AgGridReact component</h3>

            <p>The AgGridReact component needs to be displayed in a container which will define the dimensions and the theme of the grid.
            In order to show a basic grid we need only to provide columnDefs and rowData to the AgGridReact component.</p>

            <pre><code class="language-javascript">
    render() {
        let containerStyle = {
            height: 600
        };

        return (
            &lt;div style={containerStyle} className="ag-theme-fresh"&gt;
                &lt;AgGridReact
                    columnDefs={this.state.columnDefs}
                    rowData={this.state.rowData}&gt;
                &lt;/AgGridReact&gt;
            &lt;/div&gt;
        );  
    }
            </code></pre>

            <p>As you may have noticed we are using the ag-theme-fresh to style the grid. Have in mind that you need to import the .css file for the theme before using it. If you fail to import the .css files, the grid will appear unstyled. Import the following styles in <em>gridExample.jsx</em>:</p>

            <pre><code class="language-javascript">
    import "../node_modules/ag-grid/dist/styles/ag-grid.css";
    import "../node_modules/ag-grid/dist/styles/ag-theme-fresh.css";
            </code></pre>

            <p>Now we need to define the columnDefs and rowData variables in the constructor of the class.</p>

            <pre><code class="language-javascript">
    constructor(props) {
        super(props);

        this.state = {
            columnDefs: [
                {headerName: "Make", field: "make"},
                {headerName: "Model", field: "model"},
                {headerName: "Price", field: "price"}
                ],
            rowData: [
                {make: "Toyota", model: "Celica", price: 35000},
                {make: "Ford", model: "Mondeo", price: 32000},
                {make: "Porsche", model: "Boxter", price: 72000}
            ]
        }
    }
            </code></pre>

            <p>Okay, we are ready with our grid component!
            Now open the index.js file, import our GridExample component and render it.</p>

            <pre><code class="language-javascript">
    import GridExample from './GridExample';

    ReactDOM.render(&lt;GridExample /&gt;, document.getElementById('root'));
    registerServiceWorker();
            </code></pre>

            <p>Ready for a test run! Open your terminal and run the app with the following command:</p>

            <pre><code class="language-javascript">    npm start</code></pre>

            <p>This should be the result so far.</p>

            <p><img src="./seed.png" alt="" /></p>

            <h2>Sorting &amp; Filtering</h2>

            <p>Time to add a little bit more functionality to our grid. Since grids usually hold big amounts of data, it is crucial to provide effective navigation through the grid entries. This is where operations like filtering and sorting come in handy.</p>

            <p>ag-Grid has a flexible and intuitive API which exposes the capabilities of the grid in an easy to use manner.
            In order to enable filtering and sorting you need to set the properties enableFilter and enableSort to true.</p>

            <pre><code class="language-javascript">
    &lt;AgGridReact
        columnDefs={this.state.columnDefs}
        rowData={this.state.rowData}
        enableFilter='true'
        enableSorting='true'&gt;
    &lt;/AgGridReact&gt;
            </code></pre>

            <p><img src="./react-filter.gif" alt="" /></p>

            <p><img src="./react-sorting.gif" alt="" /></p>

            <p>We can also add a floating filter which will provide faster filtering. To do that additionaly set the <code>floatingFilter</code> property to true.</p>

            <pre>
            <code class="language-javascript">
    &lt;AgGridReact
        columnDefs={this.state.columnDefs}
        rowData={this.state.rowData}
        enableFilter='true'
        enableSorting='true'
        floatingFilter='true'&gt;
    &lt;/AgGridReact&gt;
            </code>
            </pre>

            <p>Let's enable the floating filter for the Model column. Simply provide to the column definition of Model a filter type to be used: </p>

            <pre><code class="language-javascript">    {headerName: "Model", field: "model", filter: "agTextColumnFilter"}</code></pre>

            <p>To find out more about filtering and advanced techniques visit the <a href="../javascript-grid-filtering/">dedicated article</a> in our documentation.</p>

            <h2>Take it to the Next Level: Fetching Remote Data</h2>

            <p>So far we have created a basic grid with hardcoded data. Now it's time to extend our app into more realistic scenario and fetch our data from a remote JSON.</p>

            <p>You can find the JSON file that is used in this tutorial <a href="https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/olympicWinners.json">here</a>.
            The JSON contains data about olympic winners in different sports. Every entry is specified with the following fields:</p>

            <ul>
            <li>Athelete</li>

            <li>Age</li>

            <li>Country</li>

            <li>Year</li>

            <li>Date</li>

            <li>Sport</li>

            <li>Gold</li>

            <li>Silver</li>

            <li>Bronze</li>

            <li>Total</li>
            </ul>

            <h3>Column Definitions</h3>

            <p>Before fetching the data we need to update the column definitions since we will be working with a different data set. We should also remove the hardcoded data from the <code>rowData</code> array.
            Edit the <code>columnDefs</code> and <code>rowData</code> properties as shown below.</p>

            <pre><code class="language-javascript">
    this.state = {
    columnDefs: [
        {headerName: "Athlete", field: "athlete"},
        {headerName: "Age", field: "age"},
        {headerName: "Country", field: "country"},
        {headerName: "Year", field: "year"},
        {headerName: "Date", field: "date"},
        {headerName: "Sport", field: "sport"},
        {headerName: "Gold", field: "gold"},
        {headerName: "Silver", field: "silver"},
        {headerName: "Bronze", field: "bronze"},
        {headerName: "Total", field: "total"}
        ],
    rowData: []
    }
            </code></pre>

            <h3>Fetching Data</h3>

            <p>We are going to execute the fetch call in the <code>componentDidMount</code> lifecycle method provided by React. The fetched data is assinged to the <code>rowData</code> property which feeds the grid.</p>

            <pre><code class="language-javascript">
    componentDidMount() {
        fetch('https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/olympicWinners.json')
        .then(result=&gt;result.json())
        .then(rowData=&gt;this.setState({rowData}))
    }
            </code></pre>

            <p>Now refresh your application!</p>

            <p><img src="fetch-data.png" width="100%" /></p>

            <h2>A Glimpse of the Enterprise Features</h2>

            <p>We just got ourselves a datagrid showing a remotely fetched dataset. 
            Let's take a tour around the Enterprise features of ag-Grid and add to our app some more functionality.</p>

            <p><em>A quick reminder: If you haven't installed and imported ag-grid-enterprise, now it's the time to do it.</em></p>

            <pre><code class="language-bash">    npm install --save ag-grid-enterprise</code></pre>

            <pre><code class="language-javascript">
    import 'ag-grid-enterprise';

    ReactDOM.render(&lt;GridExample /&gt;, document.getElementById('root'));
            </code></pre>

            <h3>Grouping &amp; Aggregation</h3>

            <p>An usual practice when creating reports is to present accumulated values over multiple entries. The combination of grouping and aggregation can be used exactly to present accumulated values which are not visible in first sight.</p>

            <p>In order to enable row grouping for a specific column you should set the <code>enableRowGroup</code> property of that column to true.
            The <code>enableRowGroup</code> property allows a column to be used in row grouping by altering it's state in the tool panel.</p>

            <p>To enable aggregation just set the <code>enableValue</code> property of the target column to true.
            The <code>enableValue</code> property allows a specific column to be aggregated.</p>

            <pre><code class="language-javascript">
    this.state = {
    columnDefs: [
        {headerName: "Athlete", field: "athlete"},
        {headerName: "Age", field: "age"},
        {headerName: "Country", field: "country", enableRowGroup:true},
        {headerName: "Year", field: "year"},
        {headerName: "Date", field: "date"},
        {headerName: "Sport", field: "sport"},
        {headerName: "Gold", field: "gold", enableValue: true},
        {headerName: "Silver", field: "silver", enableValue: true},
        {headerName: "Bronze", field: "bronze", enableValue: true},
        {headerName: "Total", field: "total", enableValue: true}
        ],
    rowData: []
    }
            </code></pre>

            <p>That was it! Now let's refresh the application and try out our new functionality.</p>

            <p><img src="grouping-react.gif" alt="" /></p>

            <p><img src="aggr-react.gif" alt="" /></p>

            <p>You have a choice when it comes to aggregation functions. You can choose to apply one of our built-in functions or create a custom one.</p>

            <p><img src="aggr-func.png" alt="" /></p>

            <p>To find further information about <em>aggregation</em> visit the <a href="../javascript-grid-aggregation/">dedicated article</a> in our documentation.</p>

            <h2>A Little Colour</h2>

            <p>Let's sprinkle a little colour here and there on our grid!</p>

            <p>For most of the styling you can use the <a href="../javascript-grid-styling/">predefined themes</a>, however sometimes it's necessary to highlight some cells or rows. 
            We are going to highlight the cells containing the number of medals (gold, silver and bronze). For every type of medal we will define a different color scale depending on the number of won medals.</p>

            <p>This should be the end result.
            <img src="colour-scale.png" width="100%" /></p>

            <p>Create a .css file named <em>gridExample.css</em> and import it in the <em>gridExample.jsx</em> file.</p>

            <pre><code class="language-javascript">    import './gridExample.css';</code></pre>

            <p>In case you are in a mood for picking colours feel free to define your own styles otherwise copy the following styles in the .css file.</p>

            <pre><code class="language-css">
    .gold-top {
        background-color: #fffb06;
    }

    .gold-middle {
        background-color: #fffd79;
    }

    .gold-low {
        background-color: #feffb9;
    }

    .silver-top {
        background-color: #cccccc;
    }

    .silver-low {
        background-color: #e9e9e9;
    }

    .bronze-top {
        background-color: #e2a56c;
    }

    .bronze-low {
        background-color: #f8be8e;
    }
            </code></pre>

            <p>We will use the <code>classStyleRules</code> to style the cells. These rules are provided as a JavaScript map where the keys are the class names and the values are expressions. If the expression is evaluated to true, the class gets used.</p>

            <p>Add the following style rules into your column definitions.</p>

            <pre><code class="language-javascript">
    columnDefs: [
            {headerName: "Athlete", field: "athlete"},
            {headerName: "Age", field: "age"},
            {headerName: "Country", field: "country", enableRowGroup:true},
            {headerName: "Year", field: "year"},
            {headerName: "Date", field: "date"},
            {headerName: "Sport", field: "sport"},
            {headerName: "Gold", field: "gold", enableValue: true, 
            cellClassRules: {
                'gold-top': function(params) { return params.value &gt;= 4},
                'gold-middle': function(params) { return params.value &gt;= 2 &amp;&amp; params.value &lt; 4},
                'gold-low': function(params) { return params.value &lt; 2}}           
            },
            {headerName: "Silver", field: "silver", enableValue: true, 
            cellClassRules: {
                'silver-top': function(params) { return params.value &gt;= 2 &amp;&amp; params.value &lt; 4},
                'silver-low': function(params) { return params.value &lt; 2}},
            },
            {headerName: "Bronze", field: "bronze", enableValue: true,
            cellClassRules: {
                'bronze-top': function(params) { return params.value &gt;= 2 &amp;&amp; params.value &lt; 4},
                'bronze-low': function(params) { return params.value &lt; 2}}
            },
            {headerName: "Total", field: "total", enableValue: true}
            ]
            </code></pre>

            <p>We are defining only two style rules for Bronze and Silver because their maximum count is 3 and third value is absolete.</p>

            <p>Refresh the application and check out the result!</p>

            <p>Since we have a .css file for our component let's move the style for the size of the div that wraps the grid.</p>

            <pre><code class="language-css">
    .container {
        height: 800px;
    }
            </code></pre>

            <pre><code class="language-html">    &lt;div className="container ag-theme-fresh"&gt;</code></pre>

            <p>Find out more about the styling of <strong>ag-Grid</strong>! Check out the <a href="../javascript-grid-cell-styles/">Cell Styling</a> and <a href="../javascript-grid-row-styles/">Row Styling</a> articles in our documentation.
            You might be also interested in working with <a href="../javascript-grid-components/">Components</a>. They allow full customization of various parts of the grid.</p>

            <h2>Conclusion &amp; Resorces</h2>

            <p>Congrats, you are ready to start coding on your own with React and ag-Grid!</p>

            <p>Find the full code of the tutorial here.</p>

            <p>You can continue extending the application by adding different capabilities and features. Visit our <a href="../documentation-main/documentation.php">documentation</a> for feature reference and further assistance.
            In case you have difficulties using React and ag-Grid you can visit the <a href="../best-react-data-grid/">React Getting Started</a> section on our website.
            You can also find various React examples <a href="../javascript-grid-examples/">here</a>.</p>
    
            <p>May the force be with you, happy coding and don't forget to share in case this post was useful to you!</p>
            <div style="background-color: #eee; padding: 10px; display: inline-block;">

                <div style="margin-bottom: 5px;">If you liked this article then please share</div>

                <table style="background-color: #eee;">
                    <tr>
                        <td>
                            <script type="text/javascript" src="//www.redditstatic.com/button/button1.js"></script>
                        </td>
                        <td>
                            &nbsp;&nbsp;&nbsp;
                        </td>
                        <td>
                            <a href="https://twitter.com/share" class="twitter-share-button"
                                data-url="https://www.ag-grid.com/ag-grid-blog-16-0-0/"
                                data-text="ag-Grid v16.0.0 Phoenix Released" data-via="ceolter"
                                data-size="large">Tweet</a>
                            <script>!function (d, s, id) {
                                    var js, fjs = d.getElementsByTagName(s)[0], p = /^http:/.test(d.location) ? 'http' : 'https';
                                    if (!d.getElementById(id)) {
                                        js = d.createElement(s);
                                        js.id = id;
                                        js.src = p + '://platform.twitter.com/widgets.js';
                                        fjs.parentNode.insertBefore(js, fjs);
                                    }
                                }(document, 'script', 'twitter-wjs');</script>
                        </td>
                    </tr>
            </table>
        </div>
    </div>

<?php 
    include '../blog-authors/sophia.php';
?>

</div>
    

</div>


<hr/>

<div id="disqus_thread"></div>
<script type="text/javascript">
    /* * * CONFIGURATION VARIABLES * * */
    var disqus_shortname = 'aggrid';

    /* * * DON'T EDIT BELOW THIS LINE * * */
    (function() {
        var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
        dsq.src = '//' + disqus_shortname + '.disqus.com/embed.js';
        (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
    })();
</script>
<noscript>Please enable JavaScript to view the <a href="https://disqus.com/?ref_noscript" rel="nofollow">comments powered by Disqus.</a></noscript>
<hr/>

<?php
include('../includes/mediaFooter.php');
?>
