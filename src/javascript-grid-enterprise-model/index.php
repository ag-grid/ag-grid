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
