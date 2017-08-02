<?php

$pageTitle = "ag-Grid Weekly Update 1st August 2017";
$pageDescription = "ag-Grid Weekly Update 1st August 2017";
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
        margin-left: 15px;
        margin-bottom: 15px;
        font-size: 14px;
        font-style: italic;
        float: right;
        width: 500px;
    }
    h4 {
        margin-top: 40px;
    }

    hr {
    height: 1px;
    color: #9c3636;
    background-color: #9c3636;
    border: none;
    }

</style>

<div class="weekly-news-section">
    View the <a href="../">full list of updates</a> to see other progress reports.
</div>

<div class="container" style="margin-top: 50px;">

    <div class="row">

        <hr/>
        <h3>
            Welcome Petyo Ivanov
        </h3>
        <hr/>

        <p>
            We are delighted to welcome Petyo Ivanov to the team. Petyo joins having worked as Kendo UI Product Manager
            for Progress, which is very relevant experience for ag-Grid. He is currently looking at the ag-Grid themes,
            in particular improving our Material Design offering.
        </p>

        <hr/>
        <h3>
            Development Update
        </h3>
        <hr/>

        <p>
            Sean has completed his work to ensure that ag-Grid is compatible with React Fiber following its Beta release. 
            He is now turning his attention to getting RollupJS working with ag-Grid.
        </p>

        <p>
            Alberto is working on how components (cell renderer, filter etc) are registered with ag-Grid. In the
            future you will be able to register components and then refer to them by name. This will make using
            framework components easier to configure.
        </p>

        <p>
            Rob is looking at how <code>value getter</code>, <code>value setter</code>, <code>value formatter</code>
            and <code>value parser</code> and creating examples and enhancing the documentation.
        </p>

        <p>
            Niall is working on simplifying the documentation, including putting types onto all events (good for TypeScript)
            and listing all items in each event (good for everyone).
        </p>

        <p>
            Petyo, as above, is looking at the themes.
        </p>

        <div style="clear: both;"/>

        <hr/>
        <h3>Next Release</h3>
        <hr/>

        <p>
            We know we had a lot of breaking changes in our last release. So for the next one we are going to focus on
            fixing things rather than creating new features. Thus our next release will be a minor one. Our current
            date for the next release is 24th Aug.
        </p>

        <hr/>
        <h3>Customer Survey</h3>
        <hr/>

        <p>
            We have sent out a customer survey to all the users of ag-Grid Enterprise today. Please take a few minutes to reply
            and give us your feedback.
        </p>


        <hr/>
        <h3>Spread the Word</h3>
        <hr/>

            <p>
            As always, you can catch the latest information on Twitter. We will be launching our other social media sites soon, we'll share those once they are ready to go.
            </p>
        </div>
        

    </div>

    

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
                       data-url="https://www.ag-grid.com/weekly-update/20170801/"
                       data-text="ag-Grid Weekly Update #javascript #angularjs #react" data-via="ceolter"
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

</div>

<?php include_once("../../includes/footer.php"); ?>

</body>

<?php include_once("../../includes/analytics.php"); ?>

</html>