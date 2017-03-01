<?php
$key = "index";
$pageTitle = "ag-Grid JavaScript Grid Documentation";
$pageDescription = "Introduction page of documentation for ag-Grid JavaScript Grid";
$pageKeyboards = "ag-Grid JavaScript Grid Documentation";
include 'documentation_header.php';
?>


<div class="row">
    <div class="col-md-9">
        <style>
            .backgroundGradient {
                background: #539bd6; /* Old browsers */
                background: -moz-linear-gradient(top, #539bd6 0%, #c3d6e5 100%); /* FF3.6-15 */
                background: -webkit-linear-gradient(top, #539bd6 0%, #c3d6e5 100%); /* Chrome10-25,Safari5.1-6 */
                background: linear-gradient(to bottom, #539bd6 0%, #c3d6e5 100%); /* W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+ */
                filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#539bd6', endColorstr='#c3d6e5', GradientType=0);
                padding: 20px;
                border-top: 1px solid black;
                border-bottom: 1px solid black;
                /*padding: 20px;*/
            }
        </style>


        <!--<div class="backgroundGradient">
            <img src="../images/github100.png" style="float: left; margin-left: 20px;"/>
            <div style="text-align: center;">
                <div style="font-size: 20px; font-weight: bold; margin-bottom: 5px;">So Happy!! - Over 2,000 Github Stars</div>
                <iframe src="https://ghbtns.com/github-btn.html?user=ceolter&repo=ag-grid&type=star&count=true&size=large" frameborder="0" scrolling="0" width="160px" height="30px"></iframe>
                <div><b>Have you starred us yet? We want your love!</b></div>
            </div>
        </div>
        -->

        <h2 id="introduction">
            Welcome to the ag-Grid Documentation Pages
        </h2>

        <!--
        <div class="list-group">
          <a href="#" class="list-group-item active">
            <h4 class="list-group-item-heading">List group item heading</h4>
            <p class="list-group-item-text">...</p>
          </a>
        </div>
        -->

<!--
        <p>
            ag-Grid is an Enterprise Grade Javascript Data Grid.
            The purpose of ag-Grid is to provide a data grid that enterprise
            software can use for building applications such as
            reporting and data analytics, business workflow and data entry.
            The author, having spent years building applications in C++, Java and Javascript,
            found the choice of grids in JavaScript lacking, especially in
            comparison to what was in other languages frameworks. ag-Grid is
            the result of turning frustration into answers,
            providing a grid worthy of enterprise development.
        </p>

        <p>
            If you are introducing yourself to ag-Grid, then you should read the documentation under
            <span style="font-style: italic">The Basics</span> (top left),
            starting with <a href="../javascript-grid-installation/">Installation</a>.
        </p>
        <p>
            If you are interested in a particular framework then please select it from the dropdown on the top left - the
            documentation will only show information pertinent to your chosen framework.
        </p>
        <p>
            Once you have <span style="font-style: italic">The Basics</span> covered, we suggest you take a look at the
            <a href="../javascript-grid-interfacing-overview/">Interfacing Overview</a> next.
        </p>
        <p>
            After this you will then have the foundations of ag-Grid and can jump to whatever section of the documentation
            you need to the feature you are trying to implement.
        </p>
-->

        <!-- *****>>> Will - I am lazy here, please put this style where the styles should go for this page.
        Also I was lazy by just putting the image inside a div - there is prob a better way. I left
        as is as I wanted to demonstrate the layout with the icons, I'll leave with you to put it the
        way it should be done. -->
        <style>
            .section-icon-container {
                float: left;
                height: 80px;
                display: inline-block;
                padding-right: 20px;
            }
            .float-parent {
                display: inline-block;
            }
        </style>

        <!-- Will - Todo - we need to get other icons for this section, because what's below I stole
         from google. Would be good to get icons that are consistent with each other. Is there a free
         icon set that we can use with icons like the below? -->

        <div class="list-group">
            <a href="/javascript-grid-getting-started/" class="list-group-item">
                <div class="float-parent">
                    <div class="section-icon-container">
                        <img src="../images/svg/docs/getting_started.svg" width="50" />
                    </div>
                    <h4 class="list-group-item-heading">Getting Started</h4>
                    <p class="list-group-item-text">
                        Learn how to get a simple
                        application working using ag-Grid with the framework that you have chosen.
                        Start here to get a simple grid working in your application, then follow on
                        to further sections to understand how particular features work.
                    </p>
                </div>
            </a>
            <a href="/javascript-grid-interfacing-overview/" class="list-group-item">
                <div class="float-parent">
                    <div class="section-icon-container">
                        <img src="../images/svg/docs/interfacing.svg" width="50" />
                    </div>
                    <h4 class="list-group-item-heading">Interfacing</h4>
                    <p class="list-group-item-text">

<!--                        Once you have <span style="font-style: italic">The Basics</span> covered, we suggest you take a look at the
                        <a href="../javascript-grid-interfacing-overview/">Interfacing Overview</a> next.
-->
                        Lists all the configuration options (properties, events, api etc) for ag-Grid.
                        Use this as a quick reference to look all available options.
                    </p>
                </div>
            </a>

            <a href="/javascript-grid-features/" class="list-group-item">
                <div class="float-parent">
                    <div class="section-icon-container">
                        <img src="../images/svg/docs/features.svg" width="50" />
                    </div>
                    <h4 class="list-group-item-heading">Features</h4>
                    <p class="list-group-item-text">
                        A detailed look at all the features. Go here for detailed explanations and examples
                        for all features. Items that are only available
                        in ag-Grid Enterprise are marked with the "<img src="../images/enterprise.png"/>" symbol.
                    </p>
                </div>
            </a>

            <a href="/javascript-grid-row-models/" class="list-group-item">
                <div class="float-parent">
                    <div class="section-icon-container">
                        <img src="../images/svg/docs/row_models.svg" width="50" />
                    </div>
                    <h4>Row Models</h4>
                    <p class="list-group-item-text">
                        The grid supports many ways to load the data eg <i>pagination</i> and <i>virtual
                        scrolling</i>. Learn how to apply these techniques to manage large amounts of
                        data.
                    </p>
                </div>
            </a>

            <a href="/javascript-grid-styling/" class="list-group-item">
                <div class="float-parent">
                    <div class="section-icon-container">
                        <img src="../images/svg/docs/themes.svg" width="50" />
                    </div>
                    <h4 class="list-group-item-heading">Themes</h4>
                    <p class="list-group-item-text">
                        The grid comes with many built in themes and also the ability to design
                        your own theme. Get the grid to fit the overall look and feel of your
                        application.
                    </p>
                </div>
            </a>

            <a href="/javascript-grid-components/" class="list-group-item">
                <div class="float-parent">
                    <div class="section-icon-container">
                        <img src="../images/svg/docs/components.svg" width="50" />
                    </div>
                    <h4>Components</h4>
                    <p class="list-group-item-text">
                        Introduce your own behaviours into the grid by providing custom
                        components such as Cell Renderers, Cell Editors, Filters and
                        Header Components. These can be done using plain JavaScript
                        or a framework of your choice eg Angular or React.
                    </p>
                </div>
            </a>

            <span class="list-group-item">
                <div class="float-parent">
                    <div class="section-icon-container">
                        <img src="../images/svg/docs/examples.svg" width="50" />
                    </div>
                    <h4>Examples</h4>
                    <p class="list-group-item-text">
                        End to end examples demonstrating many of the features of ag-Grid.
                    </p>
                </div>
            </span>

        </div>



<!--        <p>
            Here you will find documentation of every feature with at least
            one example demonstrating that feature. The ag-Grid project doesn't consider a feature complete unless it is
            documented and demonstrated.
        </p>-->


        <h2 id="keeping-up-to-date">
            Keeping up to date
        </h2>

        <p>
            ag-Grid is a fast moving project. It has gone from zero to huge in a very short space of time. To keep
            up to date, check back regularly to the website, follow Ceolter (core author) on Twitter and join the ag-Grid
            mailing
            list.
        </p>

        <h4 id="twitter">Twitter</h4>

        <div>
            <a href="https://twitter.com/ceolter" class="twitter-follow-button" data-show-count="false" data-size="large">@ceolter</a>
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

        <div class="backgroundGradient">
            <div style="float: left;">
                <img width="50px" src="../images/github100.png"/>
            </div>
            <div style="float: right;">
                <iframe src="https://ghbtns.com/github-btn.html?user=ceolter&repo=ag-grid&type=star&count=true&size=large"
                        frameborder="0" scrolling="0" width="160px" height="30px"></iframe>
            </div>
            <div style="text-align: center;">
                <div style="font-size: 20px; font-weight: bold; margin-bottom: 5px;">If you like ag-Grid, star us on Github
                </div>
            </div>
        </div>

        <div class="backgroundGradient" style="margin-top: 10px;">
            <div style="float: left; margin-right: 12px; margin-top: 5px;">
                <img src="../images/email.png"/>
            </div>

            <div style="display: inline-block">

                <div style="font-size: 20px; font-weight: bold; margin-bottom: 5px;">For information and releases of ag-Grid
                    only - never spam
                </div>

                <!-- Begin MailChimp Signup Form -->
                <link href="//cdn-images.mailchimp.com/embedcode/classic-081711.css" rel="stylesheet" type="text/css">
                <style type="text/css">
                    #mc_embed_signup {
                        clear: left;
                        font: 14px Helvetica, Arial, sans-serif;
                    }

                    /* Add your own MailChimp form style overrides in your site stylesheet or in this style block.
                       We recommend moving this block and the preceding CSS link to the HEAD of your HTML file. */
                </style>

                <div id="mc_embed_signup">
                    <form action="//angulargrid.us11.list-manage.com/subscribe/post?u=9b44b788c97fa5b498fbbc9b5&amp;id=8b9aa91988"
                          method="post" id="mc-embedded-subscribe-form" name="mc-embedded-subscribe-form" class="validate"
                          target="_blank" novalidate
                          style="padding: 0px">
                        <div id="mc_embed_signup_scroll">
                            <input style="width: 140px" placeholder="Email Address..." type="email" value="" name="EMAIL"
                                   class="required email" id="mce-EMAIL">
                            <input style="width: 140px" placeholder="First Name" type="text" value="" name="FNAME" class=""
                                   id="mce-FNAME">
                            <input style="width: 140px" placeholder="Last Name" type="text" value="" name="LNAME" class=""
                                   id="mce-LNAME">
                            <input type="submit" value="Subscribe" name="subscribe" id="mc-embedded-subscribe" class="button"
                                   style="padding-left: 10px; padding-right: 10px; margin: 0px; height: 20px; line-height: 20px;">
                            <div id="mce-responses" class="clear">
                                <div class="response" id="mce-error-response" style="display:none"></div>
                                <div class="response" id="mce-success-response" style="display:none"></div>
                            </div>
                            <!-- real people should not fill this in and expect good things - do not remove this or risk form bot signups-->
                            <div style="position: absolute; left: -5000px;"><input type="text"
                                                                                   name="b_9b44b788c97fa5b498fbbc9b5_8b9aa91988"
                                                                                   tabindex="-1" value=""></div>
                        </div>
                    </form>
                </div>
                <!-- 
                <script type='text/javascript' src='//s3.amazonaws.com/downloads.mailchimp.com/js/mc-validate.js'></script>
                <script type='text/javascript'>(function ($) {
                        window.fnames = new Array();
                        window.ftypes = new Array();
                        fnames[0] = 'EMAIL';
                        ftypes[0] = 'email';
                        fnames[1] = 'FNAME';
                        ftypes[1] = 'text';
                        fnames[2] = 'LNAME';
                        ftypes[2] = 'text';
                    }(jQuery));
                    var $mcj = jQuery.noConflict(true);</script>
                -->
                <!--End mc_embed_signup-->

            </div>
        </div>
    </div>


    <div class="col-md-3">
        <?php include 'documentation_sidebar.php'; ?>
    </div>

</div>


<?php include 'documentation_footer.php'; ?>
