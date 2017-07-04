<?php

$pageTitle = "ag-Grid Weekly Update 4th July 2017";
$pageDescription = "ag-Grid Weekly Update 4th July 2017";
$pageKeyboards = "ag-Grid Weekly Update";

include('../../includes/mediaHeader.php');
?>

<!DOCTYPE html>
    
    <!-- Animate.css -->
    <link rel="stylesheet" href="css/animate.css">
    <!-- Icomoon Icon Fonts-->
    <link rel="stylesheet" href="css/icomoon.css">
    <!-- Simple Line Icons -->
    <link rel="stylesheet" href="css/simple-line-icons.css">
    <!-- Magnific Popup -->
    <link rel="stylesheet" href="css/magnific-popup.css">
    <!-- Theme Style -->
    <link rel="stylesheet" href="css/style.css">
    <!-- Modernizr JS -->
    <script src="js/modernizr-2.6.2.min.js"></script>
    <!-- FOR IE9 below -->
    <!--[if lt IE 9]>
    <script src="js/respond.min.js"></script>
    <![endif]-->

    </head>
    <body>

    <!-- jQuery -->
    <script src="js/jquery.min.js"></script>
    <!-- jQuery Easing -->
    <script src="js/jquery.easing.1.3.js"></script>
    <!-- Bootstrap -->
    <script src="js/bootstrap.min.js"></script>
    <!-- Waypoints -->
    <script src="js/jquery.waypoints.min.js"></script>
    <!-- Magnific Popup -->
    <script src="js/jquery.magnific-popup.min.js"></script>
    <!-- Main JS -->
    <script src="js/main.js"></script>

    
    </body>
</html>

<style>
    .weekly-news-paragraph {
        color: #767676;
        padding-bottom: 20px;
    }
    .weekly-news-paragraph-title {
        font-weight: bold;
        color: #767676;
        padding-bottom: 5px;
    }
    .weekly-news-section {
        overflow: hidden;
        border: 1px solid darkgrey;
        background-color: #eee;
        padding: 10px;
        margin: 30px 5px 5px 5px;
    }
    .weekly-news-title {
        font-size: 20px;
        color: #167ac6;
        float: left;
        padding-bottom: 10px;
    }
    .weekly-news-sub-title {
        float: right;
        color: #767676;
    }
    .weekly-news-image-right {
        margin-left: 10px;
        margin-bottom: 10px;
        font-size: 14px;
        font-style: italic;
        float: right;
        width: 400px;
    }
</style>

<div class="weekly-news-section">
    View the <a href="../">full list of weekly updates</a> to see other progress reports.
</div>

<div class="container" style="margin-top: 50px;">

    <div class="row">
        <div class="col-md-12">
            <h2>Weekly Update for July, 4th.</h2>
        </div>
    </div>

    <div class="row">
        <div class="col-md-10">

        <h3>Company Update</h3>

        <div class="weekly-news-image-right">
            <img src="./images/aggrid_npm_usage.png" style="width: 100%;"/>
            <br/>
            Usage of ag-Grid from our NPM downloads.
        </div>

            <p>
            Happy Independence Day to our American readers. We hope you enjoy your holiday. It's business as usual here at ag-Grid so here's our weekly update.
            </p>
            <h4>GitHub Stars</h4>
            <p>
            We are so close to hitting 3,000 GitHub stars! If you haven’t already given us a GitHub star, please make sure you do and help us smash our target.
            </p>

        <h3>The Latest from the Development Team</h3>
            <h4>Refreshing the Grid</h4>
            <p>
            Niall has rewritten how the Refresh works, giving it a much cleaner API for users, and in doing that, realised that putting in change detection would be a great idea, too!
            </p> 
            
            <h4>Change Detection</h4>
            <p>He’s now busy at work on a new change detection system. As your data changes in your grid, it will automatically find any cells that were impacted through aggregations or through valueGeters, recompute those cells and update *only* those cells in the DOM.
            </p>

            <p>Not only is there a brand new, cleaner Refresh API, you probably won't even need to call it, as the change detection and auto-refresh will take care of everything for you.
            </p>
            <h4>JIRA Update</h4>
            <p>
            JIRA update - we are down to 136 tickets so the steady progress continues. You can view the progress on our <a href="https://www.ag-grid.com/ag-grid-pipeline/">pipeline</a>
            </p>

            </p>

            <h4>Continuing with Accessibility</h4>

            <p>
                Rob is continuing his work on Accessibility as well as helping the team close off JIRA's.
            </p>

            <h4>Preparing for TypeScript 2.4</h4>

            <p>
                TypeScript 2.4 comes with some breaking changes, which breaks some of our ag-Grid
                interfaces (those feckers!). We will fix these so the next release of ag-Grid
                will work with TypeScript 2.4.
            </p>

            <h3>ag-Grid Frameworks Update</h3>
            <h4>Web Components</h4>
            <p>
                We have moved Web Components support in ag-Grid Core to a
                new stand-alone <a href="https://github.com/ceolter/ag-grid-webcomponent/">Github repository</a>. This brings it in line with our other supported frameworks.
            </p>

            <p>
            You can view our updated <a href="https://www.ag-grid.com/best-web-component-data-grid/">documentation</a> to read more. We have also published the <a href="https://www.webcomponents.org/element/ceolter/ag-grid-webcomponent/">Web Component</a> to the Web Component Registry.
            </p>
            <h4>Polymer</h4>
            <p>
            Building on this work, we are turning our focus to support for Polymer. We will provide support for this in the same as our other frameworks.
            </p>

        <h3>Customer Experience</h3>
            <p>
            The team have been planning and working on our social media, so expect to see us appear more in your Twitter feeds! We’ll be keeping you in the loop about what we’re getting up to and keeping you up-to-date on our new features and updates. We’ve got some really interesting stuff to share with you, so stay tuned.
            </p>

        <h3>Next Release</h3>
            <p>
                We are targeting our next release for Friday 14th July. Fingers crossed no upsets and we hit the date.
            </p>

        <h3>Help Us Out!</h3>

            <p>
                Spread the news on ag-Grid, use the share buttons below! We like your tweets and Reddit mentions are great :)
            </p>
        </div>

    </div>

    <hr/>

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
                   data-url="https://www.ag-grid.com/weekly-update/20170627/"
                   data-text="ag-Grid Weekly Update 28th #javascript #angularjs #react" data-via="ceolter"
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

<div id="disqus_thread"></div>
    <script type="text/javascript">
        /* * * CONFIGURATION VARIABLES * * */
        var disqus_shortname = 'angulargrid';

        /* * * DON'T EDIT BELOW THIS LINE * * */
        (function() {
            var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
            dsq.src = '//' + disqus_shortname + '.disqus.com/embed.js';
            (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
        })();
    </script>
    <noscript>Please enable JavaScript to view the <a href="https://disqus.com/?ref_noscript" rel="nofollow">comments powered by Disqus.</a></noscript>

    <hr/>
</div>



</div>

</div>

<?php include_once("../../includes/mediafooter.php"); ?>

</body>

</html>