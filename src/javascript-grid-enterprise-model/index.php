<?php
$key = "Quick Filter";
$pageTitle = "JavaScript Grid Enterprise Model";
$pageDescription = "the most advanced row model for ag-Grid is the Enterprise row model, allowing server side grouping and aggregation.";
$pageKeyboards = "ag-Grid Enterprise Row Model";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h2 id="enterpriseRowModel">
    <img src="../images/enterprise_50.png" title="Enterprise Feature"/>
    Enterprise Row Model
</h2>

<div class="note">
    <table>
        <tbody><tr>
            <td style="vertical-align: top;">
                <img src="../images/lab.png" title="Enterprise Lab" style="padding: 10px;">
            </td>
            <td style="padding-left: 10px;">
                <h4 class="ng-scope">
                    Lab Feature - Not For Production
                </h4>
                <p class="ng-scope">
                    Enterprise Row Model is currently in development, subject to change
                    and not all edge cases are coded for. The purpose of including this
                    feature in the latest release is to present the idea to our customers
                    and get feedback. Feel free to look, try it out, and give feedback.
                    However please do not plan a production release without first talking
                    to us so we know what dependencies we have.
                </p>
            </td>
        </tr>
        </tbody></table>
</div>

<h3>Introduction</h3>

<p>
    The default row model for ag-Grid, the <b>In Memory</b> row model, will do grouping and
    aggregation for you if you give it all the data. If the data will not fit in the browser
    because it is to large, then you can use either <b>Infinite Scrolling</b> row model or
    <b>Viewport</b> row model. However these row models cannot do grouping or aggregation.
</p>

<p>
    The <b>Enterprise Row Model</b> presents the ability to have grouping and aggregation
    on large datasets by delegating the aggregation to the server and lazy loading
    the groups.
</p>

<p>
    Some users might simply see it as lazy loading group data from the server. Eg
    if you have a managers database table, you can display a list of all managers,
    then then click 'expand' on the manager and the grid will then request
    to get the 'employees' for that manager.
</p>

<p>
    Or a more advanced use case would be to allow the user to slice and dice a large
    dataset and have the backend generate SQL (or equivalent if not using a SQL
    store) to create the result. This would be similar to how current data analysis
    tools work, a mini-Business Intelligence experience.
</p>

<h3>How it Works</h3>

<p>
    You provide the grid with a datasource. The interface for the datasource is as follows:
</p>

<pre><span class="codeComment">// datasource for enterprise row model</span>
interface IEnterpriseDatasource {

    <span class="codeComment">// just one method, to get the rows</span>
    getRows(params: IEnterpriseGetRowsParams): void;
}
</pre>

<p>
    The getRows takes the following parameters:
</p>

<pre>interface IEnterpriseGetRowsParams {

    <span class="codeComment">// details for the request</span>
    request: IEnterpriseGetRowsRequest;

    <span class="codeComment">// success callback, pass the rows back the grid asked for</span>
    successCallback(rowsThisPage: any[]): void;

    <span class="codeComment">// fail callback, tell the grid the call failed so it can adjust it's state</span>
    failCallback(): void;
}
</pre>

<p>
    The request, with details about what the grid needs, has the following structure:
</p>

<pre>interface IEnterpriseGetRowsRequest {

    <span class="codeComment">// details for the request</span>
    rowGroupCols: ColumnVO[];

    <span class="codeComment">// columns that have aggregations on them</span>
    valueCols: ColumnVO[];

    <span class="codeComment">// what groups the user is viewing</span>
    groupKeys: string[];

    <span class="codeComment">// if filtering, what the filter model is</span>
    filterModel: any;

    <span class="codeComment">// if sorting, what the sort model is</span>
    sortModel: any;
}

<span class="codeComment">// we pass a VO (Value Object) of the column and not the column itself,</span>
<span class="codeComment">// so the data can be converted to JSON and passed to server side</span>
export interface ColumnVO {
    id: string;
    displayName: string;
    field: string;
    aggFunc: string;
}
</pre>

<p>
    All the interfaces above is a lot to take in. The best thing to do is look at the examples below
    and debug through them with teh web console and observed what is passed back as you interact
    with the grid.
</p>

<h3>Example - Predefined Master Detail - Mocked Server</h3>

<p>
    Below shows an example of predefined master / detail using the olympic winners.
    It is pre-defined as we set the grid with a particular grouping, and then
    our datasource knows that the grid will either be asking for the top level
    nodes OR the grid will be looking for the lower level nodes for a country.
</p>

<p>
    In your application, your server side would know where to get the data based
    on what the user is looking for, eg if using a relational database, it could go
    to the 'countries' table to get the list of countries and then the 'winners'
    table to get the details as the user expands the group.
</p>

<p>
    In the example, the work your server would do is mocked for demonstrations
    purposes (as the online examples are self contained and do not contact any
    servers).
</p>

<show-example example="exampleEnterpriseSimpleJsDb"></show-example>

<h3>Example - Slice and Dice - Mocked Server</h3>

<p>
    Below shows an example of slicing and dicing the olympic winners. The user
    has full control over what they aggregate over by dragging the columns to the
    group drop zone. For example, in the example below, you can remove the grouping
    on 'country' and group by 'year' instead, or you can group by both.
</p>

<p>
    For your application, your server side would need to understand the requests
    from the client. Typically this would be used in a reporting scenario, where the
    server side would build SQL (or the SQL equivalent if using a no-SQL data store)
    and run it against the data store.
</p>

<p>
    The example below mocks a data store for demonstration purposes.
</p>

<show-example example="exampleEnterpriseSliceAndDiceJsDb"></show-example>

<h3>Example - Slice and Dice - Real Server</h3>

<p>
    It is not possible to put up a full end to end example our the documentation
    website, as we cannot host servers on our website, and even if we did, you would
    not be able to run it locally. Instead we have put a full end to end example
    in Github at <a ></a>
</p>

<h4>What's Left</h4>

<p>
    Before we believe the enterprise row model is ready for production, we want to solve
    the following problems:
    <ol>
        <li><b>Infinite Scrolling:</b> The grid works great at handling large data, as long as
        each groups children isn't small set. For example, if grouping by country, shop and
        widget, you could have 50 countries, 50 shops in each country, and 100 widgets in each
        shop. That means you will at most take 100 items back from the server in one call
        even thought there are 250,000 (50x50x100) widgets in total. However if the user
        decided to remove all grouping, and bring back all low levels rows, then that is a
        problem. It is our plan to implement infinite scrolling (similar to the
        <a href="../javascript-grid-virtual-paging/">infinite scrolling row model</a>)
        for each level of the grouping tree, so each group node will effectively have it's
        own infinite scroll, so the grid will in theory be able to handle an infinite
        amount of data, no matter how many children a particular group has.
        </li>
        <li><b>Caching Expiring of Data:</b> As a follow on from implementing infinite
        scrolling, data will also need to be cached and purged. Purging is important
        so the user is able to continually open and close groups with the browser
        indefinitely filling it's memory.</li>
        <li><b>Server Side Support:</b> Above we presented a demo of using MySQL as a client
        side database for generating SQL on the fly to do dynamic slicing and dicing of
        data from a Relational SQL database. We could extend our server side implementations
        to cover many of the popular SQL and no-SQL databases, in both JavaScript (for those
        doing NodeJS servers) and Java (for those working in finance, where Java is dominant
        for server side development).</li>
        <li></li>
    </ol>
</p>

<p>
    SQL for creating table in MySQL:
    <pre>create table olympic_winners (
    athlete varchar(20),
    age int,
    country varchar(20),
    country_group varchar(2),
    year int,
    date varchar(20),
    sport varchar(20),
    gold int,
    silver int,
    bronze int,
    total int
);</pre>

    Data was then exported from ag-Grid using <a href="../javascript-grid-export/">CSV Export</a> example
    and imported into MySQL database using <a href="https://www.mysql.com/products/workbench/">MySQL Workbench</a>.
    Enable PHP MySQL extension (uncomment mysql lines in php.ini).
</p>

<?php include '../documentation-main/documentation_footer.php';?>
