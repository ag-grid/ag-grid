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
            <h2>Trying to Simplify our Feature Names - Polymer Support Beta Released - Our New Emoji</h2>
        </div>
    </div>

    <div class="row">

        <h3>
            The Latest from the Development Team
        </h3>

        <hr/>

        Coming in the next release...

        <h4>Trying to Simplify</h4>

        <p>
            We want to make the grid easier to understand. With this in mind,
            Niall has renamed 'Master / Slave' to 'Aligned Grids' (so not to be confused with Master / Detail)
            and 'Pinned Rows' to 'Pinned Rows' (so pinned rows and pinned columns go hand in hand).
            This is to provide meaningful names for the features.
        </p>

        <h4>DOM Rendering Order</h4>
        <p>
            Niall is also ensuring that items are rendered in the DOM in order. This is important for screen readers
            and continues our work on accessibility.
        </p>


        <h4>JIRA Update</h4>
        <p>
            We have 151 tickets now selected for Development as we have added a few more than we completed due to
            your feedback in the forums.
        </p>
        <hr/>

        <h3>ag-Grid Frameworks Update</h3>
        <hr/>

        <h4>Polymer</h4>
        <p>
            Sean has made excellent progress with Polymer, you can check out the <a
                    href="https://github.com/ceolter/ag-grid-polymer/">Beta release</a> and an <a
                    href="https://github.com/ceolter/ag-grid-polymer-example/">example</a>. We are expecting the
            final version at the end of this week.
        </p>
        <hr/>

        <h3>Next Release</h3>
        <hr/>
        <p>
            We were forced to postpone our release due last Friday as we ran into
            some issues during our regression testing and trying to get dynamic row height
            working with the Enterprise Row Model. We have now worked through
            these and will be releasing this Friday, 21st July.
            We do apologise if this caused any inconvenience but we are committed to the quality of every release.
        </p>
        <hr/>

        <h3>Customer Experience</h3>
        <hr/>

        <div class="weekly-news-image-right" style="width: unset;">
            <img src="./images/voltage_emoji.png"
                 style="border: 1px solid #eee; padding: 10px; margin-bottom: 10px;"/>
            <br/>
            Our new Emoji!
        </div>

        <p>
            We have been posting more frequently on Twitter and are enjoying the interactions with our users such as
            the image above. We will also be in touch with our customers very soon to gain a better understanding of
            the features that you are looking for - so keep an eye on your inbox.
        </p>
     
        <h4>ag-Grid's New Emoji!</h4>
        <p>
            Yesterday was World Emoji Day! We had initially used a ‘geek chic’ emoji, but one of our Twitter
            followers suggested something a little different. In honour of the speed and performance of ag-Grid, we
            unveil the Lightening Bolt - our unofficial ag-Grid Emoji.
        </p>

        <h4>GitHub Stars</h4>
        <p>
            21 more stars! Don't forget to give us a <a href="https://github.com/ceolter/ag-grid/">star!</a>
        </p>

        <div style="clear: both;"/>

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