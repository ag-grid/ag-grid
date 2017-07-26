<?php

$pageTitle = "ag-Grid Weekly Update 18th July 2017";
$pageDescription = "ag-Grid Weekly Update 18th July 2017";
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
    View the <a href="../">full list of weekly updates</a> to see other progress reports.
</div>

<div class="container" style="margin-top: 50px;">

    <div class="row">
        <div class="col-md-12">
            <h2>Version 12 released – New Documentation – React Fibre Support</h2>
        </div>
    </div>

    <div class="row">

        <hr/>
        <h3>
            The Latest from the Development Team
        </h3>
        <hr/>

        <p>
            Last Friday we released v12 with Polymer Support, Column Spanning and Enterprise Row Height and other items.
        </p>

        <h4>Trying to Simplify</h4>

        <p>
            We continue to try and simplify the documentation. In particular we want to make the documentation
            easier to navigate and find what you are looking for. We are in the process of putting links into
            the reference section - so it will take you to the part of the documentation that explains the item.
        </p>

        <h4>Accessibility</h4>

        <p>
            Rob is continuing his work on our Accessibility.
        </p>

        <h4>Ongoing Improvements</h4>

        <p>
            Alberto is perfecting our components and frameworks, paying particular attention to cell renderers
            for Angular and React.
        </p>

        <h4>Framework Updates</h4>

        <p>
            Sean is now turning his attention to React 16 and React Fibre support to ensure that we have the
            best compatibility possible.
        </p>

        <h4>
            GitHub Stars
        </h4>
        <p>
            We managed to hit over 3,000 Github stars, whoop whoop!
        </p>

        <h4>
            <img src="./images/week30.jpg" style="float: left; margin-right: 20px; margin-bottom: 20px;"/>
            Robs Birthday</h4>

        <p>
            It was also Rob’s birthday, so we bought him a figurine of his favourite boxer
            – he invaded our JIRA meeting as you can see. Happy birthday Rob!
        </p>

        <h4>JIRA Update</h4>

        <p>
            We are ploughing through our JIRAs with 143 tickets left in the queue.
        </p>

        <div style="clear: both;"/>

        <hr/>
        <h3>Next Release</h3>
        <hr/>

        <p>
            Our next release will be a minor release, looking mainly at lots of small changes and documentation improvements.
            We don't plan any breaking changes.
        </p>

        <hr/>
        <h3>Spread the Word</h3>
        <hr/>

            <p>
            If you’re not following us on Twitter, please click below to keep up to date. We appreciate all shares through social media.
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
                       data-url="https://www.ag-grid.com/weekly-update/20170718/"
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