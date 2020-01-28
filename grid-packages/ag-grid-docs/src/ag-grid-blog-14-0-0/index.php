<?php
$pageTitle = "ag-Grid Blog: Version 14 Release";
$pageDescription = "ag-Grid v14 'Halloween' is now released with features including enhanced tree data, unbalanced grouping, enhanced Angular and React examples and many more features and bug fixes.";
$pageKeyboards = "ag-grid new features halloween";
$socialUrl = "https://www.ag-grid.com/ag-grid-blog-14-0-0/";
$socialImage = "https://www.ag-grid.com/ag-grid-blog-14-0-0/v14.png";

// because we are not one level deep (like most other pages) we set the root folder
$rootFolder = '..';

include('../includes/mediaHeader.php');
?>

<style>
    .feature-image {
        border: 1px solid #ddd;
        float: right;
        margin-left: 20px;
        margin-bottom: 20px;
    }
    h2 {
        margin-top: 40px;
    }
</style>


<h1>ag-Grid v14 'Halloween' Released</h1>


<div class="row">
    <div class="col-md-8">

        <img style="float: left; margin-right: 20px; margin-bottom: 20px;" src="./v14-200.png"/>
<!--        <img src="./v14-200.png"/>-->

        <p>
            Although ag-Grid is the best JavaScript data grid in the world, it doesn't mean the
            development team at ag-Grid are finished. We will not be found asleep at the wheel!!!
            Over the month of October the core team has been busy with v14 of ag-Grid codenamed
            "Halloween". We are excited with this release as it is packed full of new features,
            enhancements and bug releases. Let me take you through some of the highlights...
        </p>

        <h2>Revamped Feature: Tree Data</h2>

        <img class="feature-image" src="../../javascript-grid-features/images/treeData.gif"/>

        <p>
            <a href="../../javascript-grid-tree-data/">Tree Data</a> is for when you provide data to the grid
            with a hierarchical structure. This can be used for things such as a file explorer or displaying
            a person hierarchy.
        </p>
        <p>
            The grid could already
            do hierarchical tree data, however the implementation had some short comings as it didn't work
            with all other grid features. To fix this we have rewritten from scratch the
            <a href="../../javascript-grid-tree-data/">Tree Data</a> so that it now does support all grid features
            including:
        </p>
            <ul class="content">
                <li>
                    Support for <a href="../../javascript-grid-data-update/">data updates</a>,
                    including <a href="../../javascript-grid-data-update/#transactions">transactions</a>
                    and <a href="../../javascript-grid-data-update/#delta-row-data">delta updates</a>
                    (so works with React Redux).
                </li>
                <li>
                    Support for group level filtering.
                </li>
                <li>
                    Support for aggregations.
                </li>
            </ul>

        <h2>New Feature: Unbalanced Grouping</h2>

        <img class="feature-image" src="./unbalancedTree.gif"/>

        <p>
            ag-Grid allows grouping of data based on columns values. For example if your data had a 'country'
            column, you could group the data by country. In ag-Grid we call this
            <a href="../../javascript-grid-grouping">Row Grouping</a>.
        </p>
        <p>
            We have taken this a step further
            and allowed for 'missing values' in the row data. In the example to the right you can see
            we are grouping by 'country' and 'state', but not all countries have states, so data is rolled
            up in to 'state, then country' where possible, and then just to 'country' where there is
            not state.
        </p>

        <h2>New Feature: Asynchronous Components for React Fiber</h2>

        <p>
            If you are a React fan, then you will be excited to lean that ag-Grid v14 comes with full
            support for Asynchronous Components. This was an implementation change for ag-Grid only,
            you don't need to do anything, it means when the time comes for React Fiber to be released
            with Asynchronous Components, ag-Grid is ready.
        </p>

        <h2>Angular & React in Documentation Examples</h2>

        <img class="feature-image" src="./exampleRunner.gif"/>

        <p>
            Now all the examples in the documentation are in Angular and React as well as plain
            JavaScript. This is to support 90% of our community where Angular, React and plain JavaScript
            account for almost all ag-Grid users.
        </p>

        <p>
            Select the framework you want to see the examples in on the top right of each example.
            As before, you can open any of these examples in plunker for further editing.
        </p>

        <h2>New Feature: Header Templates</h2>

        <p>
            You can now provide <a href="../../javascript-grid-column-header/#header-template">custom HTML templates</a>
            to customise how the column headers look. This means you now have two choices for customising the headers:
            <ol>
                <li><a href="../../javascript-grid-column-header/#header-template">Header HTML Templates</a>:
                    To reuse the default header functionality, but just tweak how the HTML looks.</li>
                <li><a href="../../javascript-grid-header-rendering/">Header Components</a>: To reuse the default header functionality, but just tweat how the HTML looks.</li>
            </ol>
            Header Components is existing functinality, only Header HTML Templates is new in v14.
        </p>

        <h2>New Feature: Async Loading of Set Filter Values</h2>

        <p>
            If you are providing values for the <a href="../../javascript-grid-filter-set/">Set Filter</a>, you
            can now lazy load the values asynchronously after the filter is shown for the first time.
        </p>
        <p>
            This will be useful to those with a large number of columns where you don't want to load all the values
            for all the column filters at the start as this may be to inefficient.
        </p>

        <h2>Enhancement: Delta Updates Row Order</h2>

        <p>
            Now <a href="../../javascript-grid-data-update/#delta-row-data">Delta Updates</a> maintain row order.
            That means if you are keeping data in a React Redux store, then the order of the rows in the grid
            will match the order of the rows in your Redux store, even after you change the order in the store.
        </p>

        <h2>Lots More...</h2>

        <p>
            There are plenty of other smaller enhancements and bug fixes that didn't make this press release.
            For the full list of changes see the <a href="../change-log/changeLogIndex.php">Change Log</a>.
        </p>

        <h2>And Share!!!</h2>

        <p>
            Sharing is caring! So please take the time to share the news of ag-Grid v14 Halloween.
        </p>

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
                           data-url="https://www.ag-grid.com/ag-grid-performance-hacks/"
                           data-text="Squeezing the Browser - JavaScript Performance Hacks in ag-Grid #javascript" data-via="ceolter"
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
<?php include '../blog-authors/niall.php'; ?>
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
