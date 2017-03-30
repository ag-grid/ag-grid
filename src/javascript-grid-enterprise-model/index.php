<?php
$key = "Enterprise";
$pageTitle = "ag-Grid New Enterprise Model";
$pageDescription = "ag-Grid is going bringing datagrids to the next level with it's Enterprise Data Model, allowing slicing and dicing of data driven by your UI.";
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
                    Lab Feature
                </h4>
                <p class="ng-scope">
                    Enterprise Row Model is currently in development, subject to change
                    and not all edge cases are coded for. The purpose of including this
                    feature in the latest release is to present the idea to our customers
                    and get feedback. Feel free to look, try it out, and give feedback.
                    However please do not plan a production release without first talking
                    to us so we know what dependencies we have.
                </p>
                <p>
                    Check out
                    <a href="https://www.youtube.com/watch?v=dRQtpULw6Hw">
                        <img src="../images/YouTubeSmall.png" style="position: relative; top: -2px;"/>
                        YouTube Movie
                    </a>
                    explaining what the Enterprise Row Model is.
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
    in Github at <a href="https://github.com/ceolter/ag-grid-enterprise-mysql-sample/">
    https://github.com/ceolter/ag-grid-enterprise-mysql-sample/</a> and you can also
    see it working on our
    <a href="https://www.youtube.com/watch?v=dRQtpULw6Hw">
        <img src="../images/YouTubeSmall.png" style="position: relative; top: -2px;"/>
        YouTube Movie
    </a>.
</p>

<p>
    The example puts all the olympic winners data into a MySQL database and creates SQL
    on the fly based on what the user is querying. This is a full end to end example of
    the type of slicing and dicing we want ag-Grid to be able to do in your enterprise
    applications.
</p>

<h3 id="pagination">Example - Pagination with Enterprise Row Model</h3>
<p>
    To enable pagination when using the enterprise row model, all you have to do is turning pagination on with
    <i>pagination=true</i>. Find below an example.
</p>

<show-example example="exampleEnterpriseSimpleJsDbPagination"></show-example>

<h3>What's Left To DO?</h3>

<p>
    If you are excited about using this new row model in production, then you will want to know
    what changes to expect before we mark it as a 'ready for production' feature. This following
    is a list of items we indent doing:
    <ol>
        <li><b>Infinite Scrolling:</b> The grid works great at handling large data, as long as
        each groups children is a small set. For example, if grouping by country, shop and
        widget, you could have 50 countries, 50 shops in each country, and 100 widgets in each
        shop. That means you will at most take 100 items back from the server in one call
        even thought there are 250,000 (50x50x100) widgets in total. However if the user
        decided to remove all grouping, and bring back all low level rows, then that is a
        problem as the grid will ask from 250,000 items.
        It is our plan to implement infinite scrolling (similar to the
        <a href="../javascript-grid-virtual-paging/">infinite scrolling row model</a>)
        for each level of the grouping tree, so each group node will effectively have it's
        own infinite scroll, so the grid will in theory be able to handle an infinite
        amount of data, no matter how many children a particular group has, and have this
            infinite amount of data sliced and diced using the Enterprise Row Model.
        </li>
        <li><b>Caching Expiring of Data:</b> As a follow on from implementing infinite
        scrolling, data will also need to be cached and purged. Purging is important
        so the user is able to continually open and close groups with the browser
        indefinitely filling it's memory.</li>
        <li><b>Server Side Support:</b> Above we presented a demo of using MySQL as a client
        side database for generating SQL on the fly to do dynamic slicing and dicing of
        data from a Relational SQL database. We could extend our server side implementations
        to cover many of the popular SQL and no-SQL databases, in both JavaScript (for those
        doing NodeJS servers) and Java (for those working in big enterprise, where Java is dominant
        for server side development).</li>
    </ol>
</p>

<h3>Feedback</h3>

<p>We have released this unfinished iteration of the Enterprise Row Model to get feedback. If you
have an opinion or ideas, please place comments below. If you think it's a good idea, please upvote
us on Reddit (or be the first person to create a Reddit post about it).</p>


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
               data-url="https://www.ag-grid.com/ag-grid-partners-with-webpack/"
               data-text="ag-Grid partners with webpack" data-via="ceolter"
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


<?php include '../documentation-main/documentation_footer.php';?>
