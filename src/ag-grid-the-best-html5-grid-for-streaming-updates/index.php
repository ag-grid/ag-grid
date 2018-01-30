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

        </p>

        <h2></h2>

        <?= example('Load and Stress Test of ag-Grid', 'load-and-stress-test', 'vanilla') ?>

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
