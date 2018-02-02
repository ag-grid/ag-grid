<?php

$pageTitle = "ag-Grid Blog: The Best HTML5 Grid for Streaming Updates";
$pageDescription = "Demonstrates ag-Grid processing large amounts of streaming data updates.";
$pageKeyboards = "javascript datagrid streaming updates";
$socialUrl = "https://www.ag-grid.com/ag-grid-the-best-html5-grid-for-streaming-updates/";
$socialImage = "https://www.ag-grid.com/ag-grid-the-best-html5-grid-for-streaming-updates/TheFastestGrid.png";

include('../includes/mediaHeader.php');
?>

<div>

    <!-- <link rel="stylesheet" href="../documentation-main/documentation.css"> -->
    <h1>ag-Grid - The Best HTML5 Grid for Streaming Updates</h1>
    <p class="blog-author">Niall Crosby | 1st February 2018</p>

    <div>
        <a href="https://twitter.com/share" class="twitter-share-button"
            data-url="https://www.ag-grid.com/ag-grid-the-best-html5-grid-for-streaming-updates/"
            data-text="The Best HTML5 Grid for Streaming Updates"
            data-via="ceolter"
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

<div class="row">
    <div class="col-md-8">

        <p class="lead">
            ag-Grid can process over <b>150,000 updates per second</b>.
            Together with the latest browsers
            and ag-Grid's cutting edge algorithms, let me introduce you to the
            fastest JavaScript datagrid in the world!!!
        </p>

        <h2>The Test</h2>

        <p>
            Before going into all the detail, here is the test running in all it's glory.
            You are invited to open the test in a new tab an play around with it. The test
            starts up with a load test for processing 1,000 updates every second.
        </p>

        <?= example('Load and Stress Test of ag-Grid', 'load-and-stress-test', 'vanilla', array('enterprise' => true)) ?>

        <h2>Test Results</h2>

        <p>
            These test were done with the following hardware / software:
            <ul>
                <li>Dell XPS 15" 9550</li>
                <li>Intel Core i7-6700HQ with 32GB Memory</li>
                <li>Windows 10 Pro 64-bit</li>
                <li>Chrome Browser full screen on 1920 x 1080 resolution</li>
            </ul>
        </p>

        <p>
            The test results are as follows:
            <ul>
                <li>
                    <b>Stress Test</b>: The test passes 1,000 messages immediately to the grid
                    with 100 record updates in each message. This means 100,000 record updates to the grid.
                    It took the grid 562ms to process the 100,000 updates, which means a speed
                    of <b>177,935 record updates per second</b>.
                </li>
                <li>
                    <b>Load Test</b>: The test passes 10 messages every second to the grid.
                    Each message contains 100 record updates. This means the grid is processing
                    1,000 updates every second. This is not intended to stress the system,
                    rather it shows how the grid manages a relatively large amount of updates.
                    <b>While the load test is running the grid is still fully responsive</b>.
                </li>
            </ul>
        </p>

        <h2>Why Streaming Large Updates is Important</h2>

        <p>
            Finance applications hold ticker grids as the 'holy grail' of grid applications.
            Ticker grids are the data grids that show movements in financial data. For
            example streaming up to date prices or market movements.
        </p>

        <p>
            Typically the amount of data in these data grids is smaller and the amount of
            updates is less frequent than that in the demo here. For example if a grid has
            one million records then it is useless - no user is going to scroll down through
            one millions records. An application that presents one millions records to the
            end user in a flat list is a badly designed application. Likewise data updates
            should be infrequent enough that they can be consumed by a human. If a piece of
            data is changing 10 times every second, then it is useless.
        </p>

        <p>
            So the use case presented in this demo (over 10,000 records with over 1,000
            record updates per second) is either an unlikely situation or an edge case situation.
            So the demo can be seen as ag-Grid demonstrating it is more powerful than you
            will probably ever need with data updates - it can manage and update data faster than
            humans are able to consume.
        </p>

        <h2>More Than Just Updates</h2>

        <p>
            The demo is doing more than cell updates. Here are some other things to look out
            for where ag-Grid is going above and beyond what other grids do.
        </p>

        <ul>
            <li>
                <h4>Grouping, Pivoting or Flat</h4>

                <p>
                    The data is initially <b>grouped</b> by three columns: <b>Product</b>, <b>Portfolio</b>
                    and <b>Book</b>. You can change what columns are grouped and pivoted on by dragging
                    the columns around. Alternatively you can hit the Flat, Group and Pivot buttons
                    to set the columns to some predefined settings (the Group predefined setting is the
                    configuration the demo initially appears in).
                </p>

                <p style="text-align: center;">
                    <b>
                        Animated Gif - Grouping, Pivoting or Flat Under Load
                    </b>
                    <img class="lazy-load" data-src="./flatGroupPivot.gif" style="border: 1px solid grey; padding: 5px; margin: 10px;"/>
                </p>

                <p>
                    Updates are made at the lowest level only. The values displayed at the grouped level
                    are aggregations of the underlying values. When a value changes, the grid does
                    'dirty path selection' to work out what aggregated values need to be updated and
                    updates just those.
                </p>

                <p>
                    One thing to try on the demo is to start the load test and then drag the columns around
                    to play with different group and pivot combinations. Notice that this can all be done
                    while the grid is processing the feed of data updates.
                </p>
            </li>
            <li>
                <h4>Sorting</h4>

                <p>
                    If you click on a column the data is sorted. If you then start a load test while
                    the grid is sorted the rows will move in real time as the data changes the sorting
                    order. In the animated gif below the column 'Current' is sorted.
                </p>

                <p style="text-align: center;">
                    <b>
                        Animated Gif - Soring Under Load
                    </b>
                    <img class="lazy-load" data-src="./sorting.gif" style="border: 1px solid grey; padding: 5px; margin: 10px;"/>
                </p>

                <p>
                    The animated gif's frame rate doesn't show how smooth the animation actually is,
                    so try the sorting yourself in the demo.
                    The grid uses the GPU (graphics hardware) for moving the rows between sorts by making
                    use of <a href="https://en.wikipedia.org/wiki/2D_computer_graphics">2D Graphics</a>,
                    <a href="https://www.w3schools.com/cssref/css3_pr_transform.asp">CSS Transform</a>
                    and <a href="https://www.w3schools.com/css/css3_transitions.asp">CSS Transitions</a>.
                    These together create very smooth animations as the rows move.
                </p>
            </li>
            <li>
                <h3>Range Selection</h3>

                <p>
                    ag-Grid allows you to do range selections like in Excel.
                    In the demo, try dragging the mouse over a selection of cells.
                    On the bottom right of the grid information appears with aggregations
                    (sum, average e.t.c.) of the values in the selected range.
                </p>

                <p style="text-align: center;">
                    <b>
                        Animated Gif - Range Selection Under Load
                    </b>
                    <img src="./rangeSelection.gif" style="border: 1px solid grey; padding: 5px; margin: 10px;"/>
                </p>

                <p>
                    If you select a range while the load test is running, the aggregations will
                    update in real time with the changing data.
                </p>
            </li>
        </ul>

        <h2>Why No Canvas</h2>

        <p>
            There are other JavaScript data grids available that claim to be fast
            because they are written using the HTML
            <a href="https://en.wikipedia.org/wiki/Canvas_element">Canvas</a> element.
            The canvas element allows for rendering using the 2D graphics library.
            It is a low level procedural model. If you use a grid that uses canvas
            then you should be aware that:
            <ul>
                <li>
                    Styling cannot be done inside the canvas using CSS.
                    The look and feel will be difficult to sync with the rest of your application.
                </li>
                <li>
                    It brings Canvas and 2D drawing API technologies into the application
                    stack. This means you will require developers with more skills than
                    standard JavaScript / HTML / CSS.
                </li>
                <li>
                    Customising the grid would be difficult, it is not possible to merge
                    HTML and Canvas together. For example if you want to customise the contents
                    of a cell, it must be doing using 2D drawing API rather than simple
                    HTML or an Angular or React component (all of which is possible with ag-Grid).
                </li>
            </ul>
        </p>

        <p>
            So to sum up canvas grids - they are not necessary. The example on this page demonstrates
            that standard HTML elements can achieve the performance required. Given ag-Grid can
            do the job with plain HTML then why would you want all the disadvantages of Canvas?
        </p>

        <h2>Grouping Updates in Messages</h2>

        <p>
            In a streaming environment, events are normally received across the network.
            This would typically be done using web sockets when the application
            is running in the browser.
        </p>

        <p>
            Each event would contain one or more record updates. If many updates are streaming
            in, it would make sense for the source of events to batch the events up - eg rather than
            sending 10,000 events every second across the network with one update each, the source
            could send an event every 20ms which would equate to 50 messages with 200 updates each
            (giving still 10,000 updates per second).
        </p>

        <p>
            The batching of events like this will not degrade the user experience as data changing
            every 20ms is past the speed our brains can process data, so more frequent updates would
            be simply lost on the human brain. However there is benefit
            to the computer network in batching as it will lesson congestion on the network.
        </p>

        <p>
            In the Load Test and Stress Test each message has 100 record updates. To change this and
            see how it impacts performance then change the demo...
        </p>

        <h2>Changing the Demo</h2>

        <p>
            You can change the parameters of the test to see how the grid performs under
            what your application's requirements are. To do this open the
            example in Plunker. You can edit directly in Plunker, or download the project from
            Plunker to your local machine and edit locally. Open up the file <code>worker.js</code>
            and edit the parameters at the top of the file.
        </p>

        <h2>Grid API</h2>

        <p>
            Users of ag-Grid might wonder if there are any tricks used to get the grid to work
            this fast. There are no tricks. The only item to take note of is the use of
            <a href="../javascript-grid-data-update/#batch-transactions">Batch Transactions</a>
            with the grid API <code>batchUpdateRowData()</code>.
        </p>

        <h2>Conclusion</h2>

        <p>
            ag-Grid can handle the performance required by modern day enterprise applications.
            In addition to the performance, it also includes many features that are not available
            in other grids.
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
                            data-url="https://www.ag-grid.com/ag-grid-the-best-html5-grid-for-streaming-updates/"
                            data-text="The Best HTML5 Grid for Streaming Updates"
                            data-via="ceolter"
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
    include '../blog-authors/niall.php';
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
