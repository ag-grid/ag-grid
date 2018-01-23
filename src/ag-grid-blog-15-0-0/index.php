<?php

$pageTitle = "ag-Grid Blog: Version 15 Release";
$pageDescription = "ag-Grid v15.0.0 is now released!";
$pageKeyboards = "ag-grid v15.0.0";
$socialUrl = "https://www.ag-grid.com/ag-grid-blog-15-0-0/";
$socialImage = "https://www.ag-grid.com/ag-grid-blog-15-0-0/img15-0-0.png";

include('../includes/mediaHeader.php');
?>

<div>

    <!-- <link rel="stylesheet" href="../documentation-main/documentation.css"> -->
    <h1>Happy New ag-Grid v15.0.0</h1>
    <p class="blog-author">Sophia Lazarova | 13th December 2017</p>

    <div>
        <a href="https://twitter.com/share" class="twitter-share-button"
            data-url="https://www.ag-grid.com/ag-grid-blog-15-0-0/"
            data-text="ag-Grid v15.0.0 Christmas" data-via="sophialazarova"
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

    <img src="cover15-0-0.png" class="large-cover-img img-fluid">

<div class="row">
    <div class="col-md-8">
    
<p class="lead">
    Winter is finally here and it's packed with snow, Christmas spirit and the new version of ag-Grid!
</p>
        
        <p>The end of the year is traditionally a time for retrospectives, this is why our last release for 2017 is dedicated to cleaning our bug backlog. Of course, we  also have a few Christmas surprises with <b>v15.0.0</b>!</p>
        
        <h2>Stay up to Date with Our Work</h2>
        
        <p><strong>Have you ever wondered what we are about to include in our next release?</strong></p>
        
        <p>No more wondering! Now you can be up to date with every decision. As of this release, we introduce the <b>ag-Grid pipeline</b> which makes public all the items on our roadmap with their current status. </p>
        
        <img src="pipeline.png" alt="pipeline" width="85%" />
        
        <p>You can find the <a href="../ag-grid-pipeline/">pipeline</a> page on our website.</p>
        
        <h2>A Fresh Start</h2>
        
        <p>2018 is knocking on our door and we are about to start it with a clean bug backlog (or almost clean)!</p>
        
        
        <p><b>v15.0.0</b> comes with a basket full of bug fixes which cover the recent few releases. Feel free to check out our <a href="../ag-grid-pipeline/">pipeline</a> or the <a href="../change-log/changeLogIndex.php">change-log</a> for the complete list of the fixed bugs.</p>
        
        <h2>Overlay Component</h2>
        
        <p>This component allows you to add your own overlays above the grid. You can use the built-in overlays or simply create your own to suit your needs.</p>
        
        <img src="overlay.png" alt="overlay" width="85%" />
        
        <p>Find more about the <a href="../javascript-grid-overlay-component/">overlay component</a> in our online documentation.</p>
        
        <h2>Register Components by Name</h2>
        
        <p>As of <b>v15.0.0</b> you can register your custom components both by <strong>name</strong> and by <strong>direct reference</strong>. Registration by name is a commonly used technique which allows you to reuse your components and minimizes code repetition. </p>
        
        <p>You can find detailed information about the <a href="../javascript-grid-components/">component registration</a> in our documentation.</p>
        
        <h2>Give it a Try and Share</h2>
        
        <p>Try out our new version and feel free to share your thoughts in the comments below.</p>
        
        <p>You can download <b>ag-Grid</b> by:</p>
        
        <ul class="content">
        <li><b>npm install ag-grid</b></li>
        
        <li><b>bower install ag-grid</b></li>
        </ul>
        
        <p><b>Happy coding with ag-Grid!</b></p>

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
                           data-url="https://www.ag-grid.com/ag-grid-blog-15-0-0/"
                           data-text="ag-Grid v15.0.0 Released" data-via="ceolter"
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
