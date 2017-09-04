<?php

$pageTitle = "Blog: Building the worlds fastest JavaScript Data Grid";
$pageDescription = "Explanation on how ag-Grid renders so fast.";
$pageKeyboards = "big data javascript browser";

include('../includes/mediaHeader.php');
?>

<div class="row">
    <div class="col-md-12" style="padding-top: 20px; padding-bottom: 20px;">
        <h1>Hacks to building the worlds fastest JavaScript Data Grid</h1>
    </div>
</div>

<div class="row">
    <div class="col-md-9">

        <h3>Make It Faster</h3>

        <p>
            ag-Grid gives excellent performance making data intensive applications possible even in browsers
            like Internet Explorer. In this blog I present the key design patterns used in ag-Grid which allow
            the grid to render so fast. This will be of interest to users of ag-Grid as if you are aware of
            these designs, you can code your application to make best use of them. Or if you are a competitor
            of ag-Grid then you can take some of these designs into your own grid - it's lonely at the top,
            it would be more fun if some competitors challenged us a little!
        </p>

        <h3>Hack 1 - Row Virtualisation</h3>

        <p>
            Row virtualisation means only rendering rows that are visible on the screen. For example, if the
            grid has 10,000 rows but only 40 can fit inside the screen, the grid will only render 40 rows (each
            row represented by a DIV element). As the user scrolls up and down, the grid will create new
            DIV elements for the newly visible rows.
        </p>

        <p>
            If the grid was to render 10,000 rows, it would probably crash the browser.
            Row virtualisation allows the display of a very large number of rows by only rendering what is
            currently visible to the user.
        </p>

        <p>
            To see row virtualisation in action go to an ag-Grid demo and open the browser developer
            tools and observe the rows in the dom changing as you scroll up and down inside the grid.
        </p>

        <h3>Hack 2 - Column Virtualisation</h3>

        <p>
            Column virtualisation does for columns what row virtualisation does for rows. In other words,
            column virtualisation only renders the columns that are currently visible and the grid will render
            more columns as the user scrolls horizontally.
        </p>

        <p>
            Column virtualisation allows the grid to display large numbers of columns without degrading the
            performance of the grid.
        </p>

        <h3>Tweaking Performance</h3>

        <p>rowBuffer</p>

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
                           data-url="https://www.ag-grid.com/ag-grid-big-data-small-browser/"
                           data-text="JavaScript Big Data in a Small Browser #javascript #angularjs #react" data-via="ceolter"
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
    <div class="col-md-3">

        <img src="../images/ag-Grid2-200.png" style="display: inline-block; padding-bottom: 20px;"/>

        <div>
            <a href="https://twitter.com/share" class="twitter-share-button" data-url="https://www.ag-grid.com/ag-grid-angular-connect-2016/"
               data-text="We're Gonna Need a Bigger Boat - ag-Grid Sponsors Angular Connect 2016" data-via="ceolter" data-size="large">Tweet</a>
            <script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');</script>
        </div>

        <div style="font-size: 14px; background-color: #dddddd; padding: 15px;">

            <p>
                <img src="/niall.png"/>
            </p>
            <p>
                About Me
            </p>
            <p>
                I have been writing software all my life! Starting with Assembly, C++ and MFC,
                moving onto full stack Java / JSP / GWT and now focusing on full stack
                Java / Javascript.
            </p>
            <p>
                Founder, Technical Lead and CEO of ag-Grid LTD.
            </p>

            <div>
                <br/>
                <a href="http://uk.linkedin.com/in/niallcrosby"><img src="/images/linked-in.png"/></a>
                <br/>
                <br/>
                <a href="https://twitter.com/ceolter" class="twitter-follow-button" data-show-count="false" data-size="large">@ceolter</a>
                <script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');</script>
            </div>

        </div>

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

<footer class="license">
    © ag-Grid Ltd. 2015-2017
</footer>

<?php
include('../includes/mediaFooter.php');
?>
