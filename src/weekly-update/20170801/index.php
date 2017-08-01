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
        <div class="col-md-12">
            <h2>A New Team Member - React Fiber Update</h2>
        </div>
    </div>

    <div class="row">

        <hr/>
        <h3>
            Company Update
        </h3>
        <hr/>

        <h4>A New Team Member</h4>

        <p>
            We are delighted to welcome the latest addition to our team - Petyo Ivanov. Petyo joins having worked
            for Telerik for many years and brings a wealth of experience and knowledge to bear. He will be working 
            with the technical team and has already started on the look and feel of the grid. He has settled in nicely
            and you can expect to hear lots from him in the coming months.
        </p>

        <hr/>
        <h3>
            The Latest from the Development Team
        </h3>
        <hr/>

        <h4>Framework Support</h4>

        <p>
            Sean has completed his work to ensure that ag-Grid is compatible with React Fiber following its Beta release. 
            He is now turning his attention to getting RollupJS working with ag-Grid. Stay tuned for updates.
        </p>

        <p>
            Alberto is working to improve how components are registered for the frameworks to make it all easier.
        </p>

        <h4>JIRA Update</h4>

        <p>
            The current JIRA tally is 148 - headway is being made as more are added in.
        </p>

        <div style="clear: both;"/>

        <hr/>
        <h3>Next Release</h3>
        <hr/>

        <p>
            Our next release will be a minor release, looking mainly at lots of small changes and documentation improvements. This is 
            currently pencilled in for XXX.
        </p>

        <hr/>
        <h3>Customer Survey</h3>
        <hr/>

        <p>
            We will be sending out a customer survey to all the users of ag-Grid Enterprise today. Please take a few minutes to reply
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