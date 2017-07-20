<?php

$pageTitle = "React datagrid";
$pageDescription = "Bulding a React DataGrid Redux and ag-Grid";
$pageKeyboards = "react datagrid redux";

include('../includes/mediaHeader.php');
?>

<link rel="stylesheet" href="../documentation-main/documentation.css">
<script src="../documentation-main/documentation.js"></script>

<div class="row">
    <div class="col-md-4" style="padding-top: 20px;">
        <img style="vertical-align: baseline" src="../images/react_large.png"/>
        <img style="vertical-align: baseline" src="../images/logo/SVG_ag_grid_bright-bg.svg" width="200px"/>
    </div>
    <div class="col-md-8" style="padding-top: 40px;">
        <h1 style="margin-top: 0">Building a React Datagrid</h1>
        <h2 style="margin-top: 0">Using Redux and ag-Grid</h2>
    </div>

    <div class="row" ng-app="documentation">
        <div class="col-md-9">

            <h2>Motivation</h2>

            <p>
                <a href="https://www.ag-grid.com">ag-Grid</a> is <span style="font-style: italic">The Best Grid in the world!</span>
                <a href="https://facebook.github.io/react/">React</a> is one of the best frameworks in the world!
                <a href="http://redux.js.org/docs/introduction/">Redux</a> and <a href="https://facebook.github.io/react/">React</a> were made for each other.
                This blog goes through how to use all three of these frameworks together for a brilliant developer experience!
            </p>

            <note>A live working example of ag-Grid with React and Redux can be found <a
                        href="https://www.ag-grid.com/example-react-redux">here.</a></note>

            <h2>Introduction</h2>

            <p><a href="https://facebook.github.io/react/">React</a> is a great framework offering a powerful but simple way to write your applications.
                <a href="http://redux.js.org/docs/introduction/">Redux</a> offers a
                great way to decouple your Component state while making it easier to keep your data immutable.</p>

            <p>
                <a href="https://www.ag-grid.com">ag-Grid</a> is not written in
                <a href="https://facebook.github.io/react/">React</a> - this makes
                <a href="https://www.ag-grid.com">ag-Grid</a> both powerful and flexible in that we can support all
                major frameworks. <a href="https://www.ag-grid.com">ag-Grid</a> can also work with immutable stores,
                so although <a href="https://www.ag-grid.com">ag-Grid</a> doesn't use
                <a href="http://redux.js.org/docs/introduction/">Redux</a> internally, it is fully able to work
                with your <a href="https://facebook.github.io/react/">React</a> /
                <a href="http://redux.js.org/docs/introduction/">Redux</a> application seamlessly.
                Let me show you how...
            </p>

            <h3>Our Application</h3>

            <note>The completed code for this blog can be found <a href="https://github.com/seanlandsman/ag-grid-react-redux-blog">here.</a></note>

            <p>In order to focus on the concepts being discussed our application is deliberately simple.</p>

            <p>We will have a simple <code>Service</code> that will simulate a backend service providing updates to the grid,
                and a simple <code>Grid</code> that will display the resulting data. In between the two we'll have a Redux
                <code>store</code> to act as a bridge between <code>Service</code> and <code>Grid</code>.</p>

            <img src="../images/react-redux.png" style="width: 100%">

            <p>We'll start off with our <a href="https://github.com/ceolter/ag-grid-react-seed">ag-Grid React</a> Seed project to get us up and running with a simple skeleton application:</p>

<pre>
git clone https://github.com/ceolter/ag-grid-react-seed.git
cd ag-grid-react-seed
npm install
</pre>
            <p>If we now run <code>npm start</code> we'll be presented with a simple Grid:</p>

            <img src="../images/react-seed.png" style="width: 100%;margin-bottom: 15px">

            <p>With this in place, let's install the Redux dependencies:</p>

            <pre>npm i redux react-redux</pre>

            <p>Our application is going to a simple Stock Ticker application - we'll display 3 Stocks and their
                corresponding live price.</p>

            <h3>The Service</h3>
            <p>First let's start with our <code>GridDataService</code>:</p>

<pre>
<span class="codeComment">// src/GridDataService.js </span>
export default class GridDataService {
    constructor(dispatch) {
        this.dispatch = dispatch;

        this.rowData = [
            {symbol: "AAPL", name: "Apple Corp", price: 154.99},
            {symbol: "GOOG", name: "Google", price: 983.41},
            {symbol: "MSFT", name: "Microsoft", price: 71.95}
        ];
    }

    start() {
        setInterval(() => {
            this.applyPriceUpdateToRandomRow();

            this.dispatch({
                type: 'ROW_DATA_CHANGED',
                rowData: this.rowData.slice(0)
            })
        }, 1500);
    }

    applyPriceUpdateToRandomRow() {
        let swingPositive = Math.random() >= 0.5; // if the price is going up or down

        let rowIndexToUpdate = Math.floor(Math.random() * 3);
        let rowToUpdate = this.rowData[rowIndexToUpdate];
        let currentPrice = rowToUpdate.price;
        let swing = currentPrice / 10; // max of 10% swing

        let newPrice = currentPrice + (swingPositive ? 1 : -1) * swing;
        rowToUpdate.price = newPrice;
    }
}
</pre>

            <p>The service manages the data - it has the current data and makes it available via <a href="http://redux.js.org/docs/introduction/">Redux</a>. In this example
            we have 3 rows of data (one each for Apple, Google and Microsoft) which the service periodically updates to
            simulate live price changes.</p>

            <p>The service is provided with the Redux stores <code>dispatch</code> (see later) which is uses to publish the
            data changes.</p>

            <h3>Bootstrapping The Application</h3>

            <p>We'll create the <code>Redux Store</code> and the <code>GridDataService</code> in our entry file
                <code>src/index.js</code>:</p>

<pre>
<span class="codeComment">// src/index.js </span>
'use strict';

import React from "react";
import {render} from "react-dom";
import {Provider} from "react-redux";
import {createStore} from "redux";

// pull in the ag-grid styles we're interested in
import "ag-grid-root/dist/styles/ag-grid.css";
import "ag-grid-root/dist/styles/theme-fresh.css";

// only necessary if you're using ag-Grid-Enterprise features
// import "ag-grid-enterprise";

// our application
import SimpleGridExample from "./SimpleGridExample";
import GridDataService from "./GridDataService";

// a simple reducer
let gridDataReducer = (state = {rowData: []}, action) => {
    switch (action.type) {
        case 'ROW_DATA_CHANGED':
            return {
                ...state,
                rowData: action.rowData,
            };
        default:
            return state;
    }
};

// create the Redux store
let store = createStore(gridDataReducer);

// instantiate our Service and pass in the Redux store dispatch method
let gridDataService = new GridDataService(store.dispatch);

// wait for the dom to be ready, then render our application
document.addEventListener('DOMContentLoaded', () => {
    render(
        // make our application redux aware
        &lt;Provider store={store}>
            &lt;SimpleGridExample/>
        &lt;/Provider>,
        document.querySelector('#app')
    );

    // kick off our service updates
    gridDataService.start();
});
</pre>

            <p>Here we do a number of bootstrap tasks:</p>

            <ul>
                <li>Import our <code>GridDataService</code></li>
                <li>Create a simple Redux reducer <code>gridDataReducer</code></li>
                <li>Create the Redux Store</li>
                <li>Instantiate our <code>GridDataService</code> and make the Redux stores dispatch method available to it</li>
                <li>Render our application</li>
                <li>Start our service updates</li>
            </ul>

            <h3>The Application</h3>

            <p>We'll modify the seed <code>SimpleGridExample</code> in the following ways:</p>

            <ul>
                <li>Delete <code>createRowData</code> - the application will now receive it's data from the Redux store</li>
                <li>Modify <code>createColumnDefs</code> to reference the new data structure (two columns: "name" and "price")</li>
                <li>In our Grid properties, refer to <code>this.props.rowData</code> - this will be populated by Redux</li>
            </ul>

            <p>The <code>GridDataService</code> now looks like this:</p>

<pre>
import React, {Component} from "react";
import {AgGridReact} from "ag-grid-react";
import {connect} from "react-redux";

class SimpleGridExample extends Component {
    constructor(props) {
        super(props);

        this.state = {
            columnDefs: this.createColumnDefs()
        }
    }

    onGridReady(params) {
        this.gridApi = params.api;
        this.columnApi = params.columnApi;

        this.gridApi.sizeColumnsToFit();
    }

    createColumnDefs() {
        return [
            {headerName: "Company", field: "name"},
            {headerName: "Price", field: "price", cellFormatter: (params) => params.value.toFixed(2)}
        ];
    }

    render() {
        let containerStyle = {
            height: 115,
            width: 500
        };

        return (
            &lt;div style={containerStyle} className="ag-fresh">
                &lt;h1>Simple ag-Grid React Example&lt;/h1>
                &lt;AgGridReact
                    // properties
                    columnDefs={this.state.columnDefs}
                    rowData={this.props.rowData}

                    // events
                    onGridReady={this.onGridReady}>
                &lt;/AgGridReact>
            &lt;/div>
        )
    }
}

// pull off row data changes
export default connect(
    (state) => {
        return {
            rowData: state.rowData
        }
    }
)(SimpleGridExample);
</pre>

            <p>With a fairly small number of changes to the seed project we now have a <a href="https://facebook.github.io/react/">React</a> application using both
                <a href="http://redux.js.org/docs/introduction/">Redux</a> and <a href="https://www.ag-grid.com">ag-Grid</a> - fantastic!</p>

            <img src="../images/react-redux-blog-app.png" style="width: 100%">

            <p>With this running you'll see the prices updating - this looks great. There is one catch here though...the entire
            grid row data will be re-rendered if we leave the application like this, even though only a single row will be updated
            at a time.</p>

            <h3>The Secret Sauce</h3>

            <p>By making use of the new <code>deltaRowDataMode</code> in <a href="https://www.ag-grid.com">ag-Grid</a>, we can ensure that we only re-render the data
            that has actually changed.</p>

            <p>To do this all we need to do is specify that we want to make use of <code>deltaRowDataMode</code>, and
            provide a unique key to <a href="https://www.ag-grid.com">ag-Grid</a> so that it can determine what has changed, if anything. We do this by providing
            the <code>getRowNodeId</code> callback. In our case, each row can be uniquely identified by it's <code>symbol</code>:</p>

<pre>
&lt;AgGridReact
    // properties
    columnDefs={this.state.columnDefs}
    rowData={this.props.rowData}

    deltaRowDataMode
    getRowNodeId={(data) => data.symbol}

    // events
    onGridReady={this.onGridReady}>
&lt;/AgGridReact>
</pre>

            <p>Visually, the application appears no different with these changes, but performance has dramatically been improved.
            This would be evident in a larger application, especially one with a large amount of row data.</p>

            <div style="background-color: #eee; padding: 5px; display: inline-block;">

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
                               data-url="https://www.ag-grid.com/ag-grid-react-datagrid/"
                               data-text="Building a React Datagrid Using Redux and ag-Grid" data-via="seanlandsman"
                               data-size="large">Tweet</a>
                            <script>!function (d, s, id) {
                                    var js, fjs = d.getElementsByTagName(s)[0],
                                        p = /^http:/.test(d.location) ? 'http' : 'https';
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
        <div class="col-md-3">

            <div>
                <a href="https://twitter.com/share" class="twitter-share-button"
                   data-url="https://www.ag-grid.com/ag-grid-react-datagrid/"
                   data-text="Building a React Datagrid Using Redux and ag-Grid" data-via="seanlandsman"
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

            <div style="font-size: 14px; background-color: #dddddd; padding: 15px;">

                <p><img src="../images/sean.png"/></p>
                <p style="font-weight: bold;">
                    Sean Landsman
                </p>
                <p>
                    Sean was the first person that Niall asked to join the team. Sean ensures that we can keep the
                    agnostic in ag-Grid... he is responsible for integrating with all of our supported frameworks. Many
                    of customers will be familiar with Sean as he is very active in our user forums supporting the needs
                    of our customers. He has also recently given a number of talks at conferences where his calm manner
                    belies his years of experience.
                </p>
                <p>
                    Lead Developer - Frameworks
                </p>

                <div>
                    <br/>
                    <a href="https://www.linkedin.com/in/sean-landsman-9780092"><img src="../images/linked-in.png"/></a>
                    <br/>
                    <br/>
                    <a href="https://twitter.com/seanlandsman" class="twitter-follow-button" data-show-count="false"
                       data-size="large">@seanlandsman</a>
                    <script>!function (d, s, id) {
                            var js, fjs = d.getElementsByTagName(s)[0],
                                p = /^http:/.test(d.location) ? 'http' : 'https';
                            if (!d.getElementById(id)) {
                                js = d.createElement(s);
                                js.id = id;
                                js.src = p + '://platform.twitter.com/widgets.js';
                                fjs.parentNode.insertBefore(js, fjs);
                            }
                        }(document, 'script', 'twitter-wjs');</script>
                </div>

            </div>

        </div>
    </div>


    <hr/>

    <div id="disqus_thread"></div>
    <script type="text/javascript">
        /* * * CONFIGURATION VARIABLES * * */
        var disqus_shortname = 'aggrid';

        /* * * DON'T EDIT BELOW THIS LINE * * */
        (function () {
            var dsq = document.createElement('script');
            dsq.type = 'text/javascript';
            dsq.async = true;
            dsq.src = '//' + disqus_shortname + '.disqus.com/embed.js';
            (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
        })();
    </script>
    <noscript>Please enable JavaScript to view the <a href="https://disqus.com/?ref_noscript" rel="nofollow">comments
            powered by Disqus.</a></noscript>
    <hr/>

    <footer class="license">
        © ag-Grid Ltd. 2015-2017
    </footer>

<?php
include('../includes/mediaFooter.php');
?>
