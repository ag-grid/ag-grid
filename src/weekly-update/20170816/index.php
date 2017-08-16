<?php

$pageTitle = "ag-Grid Weekly Update 16th August 2017";
$pageDescription = "ag-Grid Weekly Update 16th August 2017";
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
            Development Update
        </h3>
        <hr/>
        <div class="weekly-news-image-right" style="width: unset;">
            <a href="https://www.youtube.com/watch?v=SfEaqEoU0rw"><img src="./images/ngconf_sponsor_talk.png"
                 style="border: 1px solid #eee; padding: 10px; margin-bottom: 10px;"/></a>
            <br/>
            Watch Niall's "mike drop" during our ng-Conf 2017 sponsor talk.
        </div>

        <p>   
            Niall has been working on performance improvements, especially for IE. He has
            further augmented the documentation for properties and events. He has also been producing
            typescript interfaces for the events, so that users can see what attributes they have.
        <p>

        <p>   
           Petyo has been been tweaking and improving themes, so things look a little easier on the eye all-round. 
           This week, he has been working on new icons that have a more consistent style and render better on retina/hiDPI.
        </p>

        <p>
           Sean has focused a lot of time to resolving Github framework issues, with only a
           few issues left across all frameworks. He has also added an example that demonstrates React and Typescript.
        </p>
        
        <p>
            Rob is working on improved handling of Reference Data using Value Handlers as well as a new convenient 'refData' 
            property to simplify configuration.
        </p>

        <p>
            Alberto is working on the filters so that you can do case sensitive filtering and specify how nulls should be filtered. He is also
            boosting the support of renderers within frameworks so that you can use native components for innerRenderers and
            row grouping.
        </p>

        <div style="clear: both;"/>

        <hr/>
        <h3>Next Release</h3>
        <hr/>

        <p>
            The date for our next release is still pencilled in for 24th August. This will include the work detailed above.
        </p>

        <hr/>
        <h3>Customer Survey</h3>
        <hr/>

        <p>
           Thank you to those who responded to our survey, we appreciate your feedback. We are compiling the results and will
           report back shortly.
        </p>


        <hr/>
        <h3>Spread the Word</h3>
        <hr/>

        <p>
            As always, you can catch the latest information on Twitter. We will be launching our other social media sites soon, 
            we'll share those once they are ready to go.
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
                       data-text="ag-Grid improving performance and updating themes. #javascript #angularjs #react" data-via="ceolter"
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