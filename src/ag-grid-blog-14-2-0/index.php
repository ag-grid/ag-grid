<?php

$pageTitle = "ag-Grid Blog: Version 14.2.0 Release";
$pageDescription = "ag-Grid v14.2.0 is now released! New version comes with improved set of themes, master-detail view and bug fixes.";
$pageKeyboards = "ag-grid new features v14.2.0";
$socialUrl = "https://www.ag-grid.com/ag-grid-blog-14-2-0/";
$socialImage = "https://www.ag-grid.com/ag-grid-blog-14-2-0/cover.jpg";

include('../includes/mediaHeader.php');
?>



    <!-- <link rel="stylesheet" href="../documentation-main/documentation.css"> -->
    <h1>What's New in ag-Grid v14.2.0</h1>
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

            <img src="cover-img.jpg" class="large-cover-img">

<div class="row">

            <div class="col-md-8">

            <p class="lead">ag-Grid 14.2.0 is live and kicking! We are excited to share the goodies and the perks coming with the new release.</p>

            <p>Our new release comes packed with exciting, new features providing even more flexibility and freedom. We are proud to introduce you our improved themes and master-detail along with few bug fixes. Let's dive!  </p>

            <h2>One Step Closer to Perfection</h2>

            <p>Version 14.2.0 comes with set of five improved and polished themes:</p>

            <p><img src="themes.jpg" alt="themes" width='80%'/></p>

            <ul class="content">
            <li>Fresh (<code>ag-theme-fresh</code>)</li>

            <li>Dark (<code>ag-theme-dark</code>)</li>

            <li>Blue (<code>ag-theme-blue</code>)</li>

            <li>Material (<code>ag-theme-material</code>)</li>

            <li>Bootstrap (<code>ag-theme-bootstrap</code>)</li>
            </ul>

            <p>The new themes use a different architecture which provides means for easier customization. The improved implementation also introduces customization with <strong>Sass variables</strong>. 
            And that's not all, the new set has a number of visual improvements which contribute to the professional look of the grid.</p>

            <p>You can find more details <a href="../javascript-grid-styling/" title="Themes">in our documentation</a>.</p>

            <h2>Master-Detail</h2>

            <p><img src="master-detail.png" alt="master-detail" width='80%'/></p>

            <p>No more full-width rows and flower nodes hacks to achieve the <strong>master-detail</strong> effect. Version 14.2.0 arrives with <strong>master-detail</strong> as a feature, coming out of the box and available for customization with simple property changes.</p>

            <p>Find implementation details and samples in the dedicated <a href="../javascript-grid-master-detail/" title="Master Detail">documentation page</a>.</p>

            <h2>Fixed Bugs and Improvements</h2>

            <p>For full list of all bug fixes and enhancements coming with this version check the <a href="../change-log/changeLogIndex.php" title="change-log">change-log</a> published on our website.</p>

            <h2>Give it a Try and Share</h2>

            <p>Try out our new version and feel free to share your thoughts in the comments below.</p>

            <p>You can download <strong>ag-Grid</strong> by:</p>

            <ul class="content">
            <li><strong>npm install ag-grid</strong></li>

            <li><strong>bower install ag-grid</strong></li>
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

<footer class="license">
    © ag-Grid Ltd. 2015-2017
</footer>

<?php
include('../includes/mediaFooter.php');
?>
