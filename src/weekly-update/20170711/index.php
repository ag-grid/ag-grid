<?php

$pageTitle = "ag-Grid Weekly Update 11th July 2017";
$pageDescription = "ag-Grid Weekly Update 11th July 2017";
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
</style>

<div class="weekly-news-section">
    View the <a href="../">full list of weekly updates</a> to see other progress reports.
</div>

<div class="container" style="margin-top: 50px;">

    <div class="row">
        <div class="col-md-12">
            <h2>VC Meeting - OpenFin Demo - New Value Cache</h2>
            <p>
        </div>
    </div>

    <div class="row">
        <div class="col-md-10">

        <h3>Company Update</h3>
        <hr/>   

        <div class="weekly-news-image-right">
            <img src="./images/team_photo.jpg" style="width: 100%;"/>
            <br/>
            The team enjoying dinner at London's best steak house.
        </div>

            <h4>Our First VC Meeting</h4>
            <p>
                The past week has been very exciting for us. A serious VC contacted us (yes they contacted us, not
                the other way around) and wanted to learn more about what we are doing. It's early days but great
                validation of everything that we have achieved in the past 18 months in that VC's are seeking us out.
            </p>

            <h4>OpenFin Demo Goes Live</h4>
            <p>
            We have been working closely with the guys at OpenFin and our Trader Dashboard went live on their demo page yesterday. If you haven't checked it out yet, you can download and play around with it on their <a href="https://openfin.co/demos/">site.</a> You can also find the <a href="https://www.ag-grid.com//javascript-grid-openfin-dashboard/">Trader Dashboard</a> on our site.
            </p>

            <h4>GitHub Stars</h4>
            <p>
            The push continues - just another 60 will bring us to 3,000 - if you haven't already, please give us a <a href="https://github.com/ceolter/ag-grid/">star!</a>
            </p>
            <hr/>

        <h3>The Latest from the Development Team</h3>
        <hr/>
            <h4>New Value Cache</h4>
            <p>
                Niall has introduced a 'Value Cache' for people who have complicated Value Getters. This will ensure
                that Value Getters are not called multiple times, over and over again, when they give the same answer.
                He is now working on the documentation to make it as easy as possible to follow.
            </p> 
            
            <h4>Change Detection</h4>
            <p>
                Niall has also been working the Change Detection documentation to make it clear and easy to use.
            </p>
            

            <h4>Shift 'Range Selection' in all Row Models</h4>
            <p>
            Rob has added shift ‘Range Selection’ to all Row Models, which was previously only available for the ‘In Memory Row Model’, making the feature more accessible to our users.
            </p>

            <h4>Dynamic Row Heights</h4>
            <p>
            Rob is now tackling adding Dynamic Row Height in the Enterprise Row Model - it's still early days as it has to get through Niall's rigorous code review! Check out the release notes in the next release to see if it makes it.
            </p>

            <h4>JIRA Update</h4>
            <p>
            We’ve had a bunch of new tickets come through, so we’ve been steadily making our way through those – our users like to keep us on our toes! We’re down to 142 and making really good progress with it.
            </p>
            <hr/>
            </p>

            <h3>ag-Grid Frameworks Update</h3>
            <hr/>
            <h4>Polymer</h4>
            <p>
                Sean is making good headway with Polymer Support, adding constantly to it. It probably won't make this weeks
                release, but we should have something substantial the following release.
            </p>
            <h4>Web Components</h4>
            <p>
                Our improved support for Web Components went live last week - check out the <a href="https://www.ag-grid.com/best-web-component-data-grid/">documentation</a> to read more.
            </p>
            <hr/>

        <h3>Next Release</h3>
        <hr/>
            <p>
             We are still on target for our next release, which should be out this Friday 14th July.
            </p>
            <hr/>

        <h3>Customer Experience</h3>
        <hr/>
            <p>
            The whole team enjoyed a well-earned company dinner to recharge our batteries and to welcome the new members of the Customer Experience team. 😊
            </p>
            <p>
            We have been busy thinking of ways to reach out to new customers and we’ve got some really cool ideas that we’re hoping to roll out in the next few weeks, so stay tuned! We would like to hear your ideas so please get in touch on Twitter or email.
            </p>
            <hr/>

        <h3>Spread the Word</h3>
        <hr/>

        <h4>Targetting React Space</h4>
            <p>
             John has been focusing on improving our presence in the React space. So for all our React users, help us spread the word or let us know of any good resources where we can get involved.
            </p>

            <p>
            If you’re not following us on Twitter, please click below to keep up to date.
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
                       data-url="https://www.ag-grid.com/weekly-update/20170711/"
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