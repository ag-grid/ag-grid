<?php

$pageTitle = "ag-Grid Blog: Version 16 'Phoenix' Release";
$pageDescription = "ag-Grid v16.0.0 Phoenix is now released!";
$pageKeyboards = "ag-grid v16.0.0 Phoenix";
$socialUrl = "https://www.ag-grid.com/ag-grid-blog-16-0-0/";
$socialImage = "https://www.ag-grid.com/ag-grid-blog-16-0-0/img.svg";

include('../includes/mediaHeader.php');
?>

<div>

    <!-- <link rel="stylesheet" href="../documentation-main/documentation.css"> -->
    <h1>Introducing Version 16: Phoenix and Our New Website</h1>
    <p class="blog-author">Sophia Lazarova | 22nd January 2018</p>

    <div>
        <a href="https://twitter.com/share" class="twitter-share-button"
            data-url="https://www.ag-grid.com/ag-grid-blog-16-0-0/"
            data-text="ag-Grid v16 Phoenix" data-via="sophialazarova"
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

    <img src="cover.svg" class="large-cover-img img-fluid">

<div class="row">
    <div class="col-md-8">
    
        <p class="lead">
            <strong>ag-Grid Phoenix</strong> is Now Live and So is Our Brand New Website!
        </p>
        <p>The first days of the year are usually a start of a new page but for us they are an energetic continuation of a very successful year. 
        We are sliding into 2018 packed with lots of goodies and with a brand new website.</p>
        <p>The highlights of v16 include couple of your most wanted feature requests along with some sugar bits like bug fixes and minor features. Let's roll!</p>

        <h2>Row Drag and Drop</h2>

        <p>From <strong>v16.0.0</strong> you can not only drag columns but also rows.</p>

        <p><img src="rowdnd.gif" alt="" width="85%"/></p>

        <p>The <strong>row drag-and-drop</strong> has two modes:</p>
        <ul>
        <li><strong>Managed Dragging</strong> - The grid will rearrange rows as you drag them.</li>

        <li><strong>Unmanaged Dragging</strong> - The grid will not rearrange rows as you drag. Instead the application is responsible for responding to events fired by the grid and rows are rearranged by the application.</li>
        </ul>

        <p><strong>Row drag-and-drop</strong> is also available when groups are presented or tree data is used.</p>

        <p><img src="groupdnd.gif" alt="" width="85%"/></p>

        <p><img src="treedatadnd.gif" alt="" width="85%"/></p>

        <p>To find out more about <strong>row drag-and-drop</strong> refer to the <a href="../javascript-grid-row-dragging/">dedicated article</a> in our documentation.</p>

        <h2>Introducing Locked Position and Locked Visibility for Columns</h2>

        <p><strong>Phoenix</strong> adds <strong>locked position</strong> and <strong>locked visibility</strong> to the wide variety of features supported by <strong>ag-Grid</strong>.
        In order to use the new functionality you should use the following properties:</p>

        <ul>
        <li><strong>lockPosition</strong> - Locks columns to the first position in the grid. The locked column will always appear first. It cannot be dragged by the user, and can not be moved out of position by dragging other columns.</li>
        </ul>

        <p><img src="lockedposition.gif" alt="" width="85%"/></p>

        <ul>
        <li><strong>lockVisible</strong> - Stops individual columns from been made visible or hidden via the UI. If it's value is <strong>true</strong>, the column will not hide when it is dragged out of the grid, and columns dragged from the tool panel onto the grid will not become visible.</li>
        </ul>

        <p><img src="vislocked.gif" alt="" width="85%"/> </p>

        <p>Read more about columns movement on the <a href="../javascript-grid-column-moving/">dedicated article</a> in our documentation.</p>

        <h2>Bug Fixing and Smaller Features</h2>

        <p>Of course <strong>v16.0.0 Phoenix</strong> has a lot more to offer. There are multiple bug fixes and minor features introduced in this release. To find a full list of what's included in the current version and what's about to come next, check out the public  <a href="../ag-grid-pipeline/">pipeline</a> and our <a href="../change-log/changeLogIndex.php">change-log</a>. </p>

        <h2>Time For a Change</h2>

        <p>Evolution is a constant proccess of building small pieces above what you already have.
        But sometimes evolution requires a change in order to accomplish a higher goal.
        This is why we are making a step aside of our well-known look and taking a direction, matching the goals of an evolving company with a growing team. We are not just a successful open-source project anymore, we are a company ready to take over the world!</p>

        <p><img src="homepage.png" alt="" width="85%" /></p>
        <p><img src="docs.png" alt="" width="85%" /></p>

        <h2>Give it a Try and Share</h2>

        <p>Try out our new version and feel free to share your thoughts in the comments below.</p>

        <p>Happy coding with ag-Grid!</p>
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
                            data-url="https://www.ag-grid.com/ag-grid-blog-16-0-0/"
                            data-text="ag-Grid v16.0.0 Phoenix Released" data-via="ceolter"
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
