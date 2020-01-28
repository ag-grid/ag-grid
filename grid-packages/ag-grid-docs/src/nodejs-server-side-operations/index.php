<?php
$pageTitle = "Server-side operations with GraphQL and ag-Grid";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. This is a guide on how to perform server-side operations with Oracle and ag-Grid.";
$pageKeyboards = "Server-side operations with GraphQL";
$pageGroup = "basics";
include '../documentation-main/documentation_header.php';
?>
    <h1>
        Server-side operations with Node.js
    </h1>

    <p class="lead">
        Learn how to perform server-side operations using Node.js with a complete reference implementation that uses
        the MySQL database.
    </p>

    <p>
        This guide is intended as a starting point when learning how to use the
        <a href="/javascript-grid-server-side-model/">Server-side Row Model</a>, as it provides a simple grid implementation
        that uses limited set of features and grid configurations.
    </p>

    <p>
        The sample Olympic Medals application is developed using a Node.js server that connects to a MySQL database and
        will demonstrate how data can be lazy-loaded as required, even when performing group, filter and sort
        operations when working with large datasets.
    </p>

    <p>
        The following screenshot shows what the finished application looks like:
    </p>

    <p><img src="nodejs-app.png" width="100%" height="60%" style="border: 1px solid grey"/></p>

    <note>
        The reference implementation covered in this guide is for demonstration purposes only. If you use
        this in production it comes with no warranty or support.
    </note>

    <p>
        The source code can be found here:
        <a href="https://github.com/ag-grid/ag-grid-server-side-nodejs-example">https://github.com/ag-grid/ag-grid-server-side-nodejs-example</a>.
    </p>

    <h2>Overview</h2>

    <p>
        In this Olympic Medals application, the server endpoint will be hosted using a web server comprised of
        <a href="https://nodejs.org/">Node.js</a> running <a href="https://expressjs.com/">Express.js</a>, that connects
        to a single <a href="https://www.mysql.com/">MySQL</a> datasource.
    </p>

    <p>
        An overview of technologies used in this guide is illustrated in the diagram below:
    </p>

    <p><img src="app-arch.png" width="100%" style="border: 1px solid grey"/></p>

    <p>
        We will now proceed and to install and run the application before going through the implementation details.
    </p>

    <h2 id="download-and-install">Download and Install</h2>

    <p>
        Clone the example project using:

        <snippet>
            git clone https://github.com/ag-grid/ag-grid-server-side-nodejs-example.git
        </snippet>

        Navigate into the project directory:

        <snippet>
            cd ag-grid-server-side-nodejs-example
        </snippet>

        Install project dependencies and build project using:

        <snippet>
            yarn install
        </snippet>
    </p>

    <h2 id="database-setup">Database Setup</h2>

    <p>
       Download and install the database as per the <a href="https://www.mysql.com/downloads/">MySql Download</a>
       documentation.
    </p>

    <p>
       Create a database with the name 'sample_data'. Then run the following script to create the table
       <code>olympic_winners</code> and populate it with data via the mysql command line:
    </p>

    <p>
        <snippet>
            mysql -u root -p -D sample_data < ./data/olympic_winners.sql
        </snippet>
    </p>

    <p>
        That's it. We are now ready to run and explore the application.
    </p>

    <h2 id="running-the-application">Running the application</h2>

    <p>
        To run the application execute the following from the command line:
    </p>

    <p>
        <snippet>
        yarn start
        </snippet>
    </p>

    <p>
        Then point your browser to <a href="http://localhost:4000/">http://localhost:4000/</a>
    </p>


<h2 id="grid-configuration">Client Configuration</h2>

<p>
    In order to keep this sample application as simple as possible, the grid configurations are kept to a minimum. The
    <code>gridOptions</code> required for our grid are shown below:
</p>

<snippet>

// client/index.js

const gridOptions = {

    rowModelType: 'serverSide'

    columnDefs: [
        {field: 'athlete'},
        {field: 'country', rowGroup: true, hide: true},
        {field: 'sport', rowGroup: true, hide: true},
        {field: 'year', filter: 'number', filterParams: {newRowsAction: 'keep'}},
        {field: 'gold', aggFunc: 'sum'},
        {field: 'silver', aggFunc: 'sum'},
        {field: 'bronze', aggFunc: 'sum'},
    ],

    defaultColDef: {
        sortable: true
    }
}
</snippet>

<p>
    In the code snippet above, the grid is configured to use the Server-side Row Model by setting: <code>gridOptions.rowModelType = 'serverSide'</code>.
</p>

<p>
    Sorting is enabled via <code>defaultColDef.sortable = true</code> property. A simple number filter is also added
    to the 'year' column. The example has <code>filterParams.newRowsAction = 'keep'</code> set to ensure that as new data is loaded
    the applied filters are kept - however since v21 of ag-Grid, newRowsAction defaults to 'keep' for Server Side Row Model
    so this property no longer needs to be set.
</p>

<p>
    To demonstrate <a href="/javascript-grid-server-side-model-grouping/">Row Grouping</a>, the 'country' and 'sport'
    columns have been configured with <code>rowGroup = true</code>. Finally, to ensure the medal values are aggregated
    up the group hierarchy, the value columns have been set up with an aggregation function: <code>aggFunc='sum'</code>.
</p>


<h2 id="server-side-datasource">Server-side Datasource</h2>

    <p>
        In order to fetch data for the Server-side Row Model we must implement the <code>IServerSideDatasource</code>,
        which contains a single method <code>getRows(params)</code> which accepts request params from the grid.
    </p>

    <p>
        Successful responses are then passed back to the grid via the <code>params.successCallback(rows, lastRow)</code>
        as shown below:
    </p>

<snippet>
// client/index.js

const datasource = {
    getRows(params) {
        console.log(JSON.stringify(params.request, null, 1));

        fetch('./olympicWinners/', {
            method: 'post',
            body: JSON.stringify(params.request),
            headers: {"Content-Type": "application/json; charset=utf-8"}
        })
        .then(httpResponse => httpResponse.json())
        .then(response => {
            params.successCallback(response.rows, response.lastRow);
        })
        .catch(error => {
            console.error(error);
            params.failCallback();
        })
    }
};

// register datasource with the grid
gridOptions.api.setServerSideDatasource(datasource);
</snippet>


<h2 id="server-endpoint">Server Endpoint</h2>

<p>
    Hosting our server endpoint <code>/olympicWinners</code> which accepts json requests is done with the help of
    the <code>express</code> and
    <code>body-parser</code> npm packages.
<p/>

<snippet>
// server/server.js

import webpack from 'webpack';
import webpackMiddleware from 'webpack-dev-middleware';
import webpackConfig from '../webpack.config.js';
import express from 'express';
import bodyParser from 'body-parser';

import OlympicWinnersService from './olympicWinnersService';

const app = express();
app.use(webpackMiddleware(webpack(webpackConfig)));

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.post('/olympicWinners', function (req, res) {
OlympicWinnersService.getData(req.body, (rows, lastRow) => {
    res.json({rows: rows, lastRow: lastRow});
    });
});

app.listen(4000, () => {
    console.log('Started on localhost:4000');
});
</snippet>

<p>
    Request are delegated to the <code>OlympicWinnersService</code> which contains all the server side application
    logic. The <code>getData()</code> method queries the MySQL database using the <code>mysql</code> npm package with
    the SQL returned by <code>buildSql()</code>.
</p>

<snippet>
// server/olympicWinnersService.js

import mysql from 'mysql';

class OlympicWinnersService {

    getData(request, resultsCallback) {
        const SQL = this.buildSql(request);

        connection.query(SQL, (error, results) => {
            const rowCount = this.getRowCount(request, results);
            const resultsForPage = this.cutResultsToPageSize(request, results);
            resultsCallback(resultsForPage, rowCount);
        });
    }

    buildSql(request) {
        const selectSql = this.createSelectSql(request);
        const fromSql = ' FROM sample_data.olympic_winners ';
        const whereSql = this.createWhereSql(request);
        const limitSql = this.createLimitSql(request);
        const orderBySql = this.createOrderBySql(request);
        const groupBySql = this.createGroupBySql(request);

        return selectSql + fromSql + whereSql + groupBySql + orderBySql + limitSql;
    }

    // helper methods ...
}
</snippet>

<p>
    The <code>buildSql()</code> method uses a number of helper methods to build up sql fragments used in the
    combined SQL which is returned. The implementation details of these helper methods are be omitted from this
    guide but can be examined in the project repository.
</p>

<h2 id="conclusion">Conclusion</h2>

<p>
    In this guide we presented a reference implementation for integrating the Server-side Row Model with a Node.js
    server connected to a MySQL database. This included all necessary configuration and install instructions.
</p>

<p>
    A high level overview was given to illustrate the problem this approach solves before providing details of how
    to achieve the following server-side operations:

    <ul>
        <li>Sorting</li>
        <li>Filtering</li>
        <li>Grouping</li>
        <li>Aggregation</li>
    </ul>
</p>

<?php include '../documentation-main/documentation_footer.php'; ?>