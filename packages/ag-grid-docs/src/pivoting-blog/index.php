<?php

$pageTitle = "ag-Grid Blog: How to Add JavaScript Pivot Tables to your App";
$pageDescription = "Make the most of your data by using pivot tables to create summaries and reports.";
$pageKeyboards = "The power of pivot tables";
$socialUrl = "https://www.ag-grid.com/pivoting-blog/";
$socialImage = "https://www.ag-grid.com/pivoting-blog/img-pivot.png";

include('../includes/mediaHeader.php');
?>



    <!-- <link rel="stylesheet" href="../documentation-main/documentation.css"> -->
    <h1>Become a data guru with ag-Grid and JavaScript pivot tables</h1>
    <p class="blog-author">Sophia Lazarova | 14th November 2017</p>

    <div>
        <a href="https://twitter.com/share" class="twitter-share-button"
            data-url="https://www.ag-grid.com/ag-grid-blog-14-2-0/"
            data-text="ag-Grid v14.2.0" data-via="sophialazarova"
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

            <img src="cover-pivot.png" class="large-cover-img" alt="Pivot Table" />

<div class="row">
<div class="col-md-8">

<p class="lead">Data is not to be stored but to be understood! By adding pivot tables to your JavaScript application, you can empower your users to make the most of their data. This article gives an insight on pivot tables, their common usage and their integration with JavaScript applications.</p>

<p>For your users, working with big amounts of data has never been easy. Data without insight is worthless, we end up wondering what to do with our pile of rows and records. Fear not, there is an easy way to handle your data without being a data scientist or database guru.</p>

<h2>In Theory</h2>

<p>For most people, pivot table is a fancy word, widely used among the Excel spreadsheet lovers. And if you are like me, you have probably Googled the meaning at least once. Well, turns out pivot tables are a really powerful feature that gives the user insight into their data. Their purpose is to summarize large amounts of data by applying operations such as averaging, sorting and grouping.
As a result a pile of rows and data can quicly become a well-shaped and beautifully stuctured report.</p>

<h2>In Practice</h2>
<p>You are still not sure what's the actual purpose of the pivot tables? No worries, an example is worth a thousand words!
Let's have a look at the following example and see how we can use pivot tables.</p>

<p><strong>Plot</strong>: We have a dataset with participants in different games. The participants are located in different countries and have different yearly and monthly winnings. This data is part of a bigger dataset but we will use only some of the attributes:</p>

<ul class="content">
<li>Name</li>

<li>Country</li>

<li>Total Winnings</li>

<li>Monthly Breakdown(winnings for each month)</li>
</ul>

<p><strong>Task</strong>: Finding the total winnings for each country.</p>

<img src="initial-grid.png" alt="pipeline" width="85%"/>

<p></p>
<h4>Pivot Tables to the Rescue</h4>

<p>To solve our task we will use the magic power of pivoting in <strong>ag-Grid</strong>. So in order to find the total winnings for each country we need to find all participant from a country and sum their winnings. Easy, right?</p>

<p>First we need to enter 'Pivot Mode' or in other words - start a pivot table.</p>

<p><img src="pivot-mode-on.gif" alt="pivot mode on" width="85%" /></p>

<p>Entering 'Pivot Mode' gives us an empty table and some additional sections.
Important here are these two sections:</p>
<ul class="content">
<li><p><strong>Row Groups</strong> - holds the attributes by which we want to group our data. We can add attributes to this section simply by dragging them.</p></li>
<li><p><strong>Values</strong> - holds the attributes of which we want to have aggregated values. Attibutes can be included by dragging.</p></li>
</ul>
<p><img src="sections.png" alt="pipeline" width="35%"/></p>
<p></p>
<h5>Grouping</h5>

<p>Let's start by presenting a list of all coutries with participants.</p>
<p>Since we want to find the winnings of each country we should group our data by 'Country'.</p>

<p><img src="grouping.gif" alt="grouping" width="85%"  /></p>

<p>Piece of cake!</p>

<h5>Aggregation</h5>

<p>Aggregation is used for presenting sum, average, min, etc. values of attributes with numeric values. We will use aggregation to get the sum of the winnings for each country.</p>

<p><img src="aggr.gif" alt="aggregation" width="85%"  /></p>

<h4>Oh well, looks like we are ready!</h4>

<p>Now we have all the countries with their corresponding total winnings.
Beautiful, isn't it? In just a few clicks we have a summarized report of our complexed data.</p>

<p>We can also aggregate our data by different values.
Have in mind that the default aggregation value is <strong>SUM</strong>.</p>

<p><img src="final.gif" alt="aggregaion values" width="85%" /></p>

<p>Just as easy we can get summary not only of the total winnings but of the monthly breakdown.</p>

<img src="final.png" alt="pipeline" width="85%"/>

<p></p>
<h2>Talk technie to me!</h2>
<p>It is clear now what pivot tables are and how we can use them, but there is still one unsolved question - how do we enable them in our JavaScript application?</p>
<p>As you already know we don't need to build pivot table from scratch, we can simply use the capabilities of <strong>ag-Grid.</strong></p>
<p>Pivoting is, no doubt, one of the top features of <strong>ag-Grid Enterprise</strong>. Make sure you are using <strong>ag-Grid Enterprise</strong>
in order to use pivoting and other high profile goods. You can find <strong>ag-Grid</strong> and <strong>ag-Grid Enterprise</strong> on npm and bower. If you have any difficulties you can refer to <a href="../javascript-grid-getting-started/">our getting started articles.</a></p>
<p> Once you are packed with <strong>ag-Grid Enterprise</strong>, you should simply edit the column definitions and add the <code>enablePivot</code> property with value <code>true</code>.
<snippet language="sh">
this.columnDefs = [
            {headerName: "Make", field: "make", enablePivot: true},
            {headerName: "Model", field: "model", cellRendererFramework: RedComponentComponent, enablePivot: true},
            {headerName: "Price", field: "price", enablePivot: true}
        ];
</snippet>

<p>This is a simple example of enabling pivoting in <strong>ag-Grid</strong>. Of course, <strong>ag-Grid</strong> has more advanced settings for pivoting in complecated scenarios.
To find out more about pivoting, read the <a href="../javascript-grid-pivoting/">dedicated article</a> in our documentation.</p>

<h2 id="conclusion">Conclusion</h2>

<p>Congrats, you are a master of the advanced reports now! </p>
<p>Pivot tables are a powerful tool which is fairly simple to use once you know it's tricks.

<p>You can try this by yourself right away, using the <a href="../example.php">ag-Grid demo</a>.
If you are in a mood for writing code you can download ag-Grid and build your own grid with pivoting.</p>

<ul class="content">
<li><strong>npm install ag-grid-community</strong></li>

<li><strong>bower install ag-grid-community</strong></li>
</ul>

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
    data-url="https://www.ag-grid.com/ag-grid-blog-14-2-0/"
    data-text="ag-Grid v14.2.0 Released" data-via="ceolter"
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
