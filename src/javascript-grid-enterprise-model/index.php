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

<show-example example="exampleEnterpriseSimpleJsDb"></show-example>

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
