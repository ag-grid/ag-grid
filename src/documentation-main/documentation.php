<?php
$key = "index";
$pageTitle = "ag-Grid JavaScript Grid Documentation";
$pageDescription = "Introduction page of documentation for ag-Grid JavaScript Grid";
$pageKeyboards = "ag-Grid JavaScript Grid Documentation";
include 'documentation_header.php';
?>

<h2>
    Introduction
</h2>

<div style="border: 1px solid darkgrey; background-color: #eee; padding: 10px; margin-left: 10px; width: 260px; float: right;">
<!--    <img src="../images/agGridDaily.png"/> -->
    <div style="font-weight: bold; text-align: center;">News 9th March 2016</div>

    <div style="margin-top: 10px">Version 4.0.x released</div>
    <p>
        Check <a href="../change-log/index.php">change log</a> for what's in this release.
    </p>
    <p>
        Check <a href="../ag-grid-goes-commercial/">ag-Grid Goes Commercial</a> media release.
    </p>
</div>

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
    Here you will find documentation of every feature with at least
    one example demonstrating that feature. The ag-Grid project doesn't consider a feature complete unless it is
    documented and demonstrated.
</p>

<h2>
    Where to start
</h2>

<p>
    If you are introducing yourself to ag-Grid, then you should read <a href="angular-grid-getting-started">Getting Started</a>.
    Then follow on to the section on the framework that interests you (one of
    <a href="../best-javascript-data-grid/index.php">Javascript</a>,
    <a href="../best-react-data-grid/index.php">React</a>,
    <a href="../best-angularjs-data-grid/index.php">Angular JS</a>,
    <a href="../best-angular-2-data-grid/index.php">Angular 2</a> or
    <a href="../best-web-component-data-grid/index.php">Web Components</a>) and try and get a simple example working
    yourself (you don't need to understand the grid, just how it install it into your application).
    Then cover the <a href="../javascript-grid-interfacing-overview/index.php">Interfacing Overview</a>.
    After that, you then have the foundations of ag-Grid and can jump to whatever section of the documentation
    you need to the feature you are trying to implement.
</p>

<h2>
    Sections
</h2>

<p>
    The documentation is broken in the following sections:
    <ul>
    <li><b>The Basics: </b> Learn how to set up ag-Grid with the framework that you have chosen.</li>
    <li><b>Interfacing: </b> A quick reference guide detailing all the configuration options for ag-Grid.</li>
    <li><b>Core Features: </b> A detailed look at all the core features.</li>
    <li><b>Enterprise Features: </b> A detailed look at all the enterprise features.</li>
    <li><b>Examples: </b> Some examples combining different features.</li>
    <li><b>Tutorials: </b> Some video tutorials for the younger generation who prefer YouTube videos over reading.</li>
</ul>
</p>

<h2>
    Keeping up to date
</h2>

<p>
    ag-Grid is a fast moving project. It has gone from zero to huge in a very short space of time. To keep
    up to date, check back regularly to the website, follow Ceolter (core author) on twitter and join the ag-Grid mailing
    list.
</p>

<div style="float: left; margin-top: 20px;">
    <a href="https://twitter.com/ceolter" class="twitter-follow-button" data-show-count="false" data-size="large">@ceolter</a>
    <script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');</script>
</div>

<div style="text-align: center; float: right; margin-top: 20px;">
    <div style="border: 1px solid lightgrey; display: inline-block; padding-right: 10px;">

        <!-- Begin MailChimp Signup Form -->
        <link href="//cdn-images.mailchimp.com/embedcode/classic-081711.css" rel="stylesheet" type="text/css">
        <style type="text/css">
            #mc_embed_signup{background:#fff; clear:left; font:14px Helvetica,Arial,sans-serif; }
            /* Add your own MailChimp form style overrides in your site stylesheet or in this style block.
               We recommend moving this block and the preceding CSS link to the HEAD of your HTML file. */
        </style>

        <div id="mc_embed_signup">
            <form action="//angulargrid.us11.list-manage.com/subscribe/post?u=9b44b788c97fa5b498fbbc9b5&amp;id=8b9aa91988"
                  method="post" id="mc-embedded-subscribe-form" name="mc-embedded-subscribe-form" class="validate" target="_blank" novalidate>
                <div id="mc_embed_signup_scroll">
                    <div style="text-align: center; padding-bottom: 5px;">
                        Join the mailing list to get updates of new features and releases
                    </div>
                    <table>
                        <tr>
                            <td style="padding: 4px;">
                                <i class="fa fa-envelope"></i>
                            </td>
                            <td style="padding: 4px;">
                                <input style="width: 200px" placeholder="Email Address..." type="email" value="" name="EMAIL" class="required email" id="mce-EMAIL">
                            </td>
                            <td style="padding: 4px;">
                                <i class="fa fa-user" style="padding-left: 4px;"></i>
                            </td>
                            <td style="padding: 4px;">
                                <input style="width: 200px" placeholder="First Name" type="text" value="" name="FNAME" class="" id="mce-FNAME">
                            </td>
                        </tr>
                        <tr>
                            <td>
                            </td>
                            <td>
                            </td>
                            <td>
                            </td>
                            <td style="padding: 4px;">
                                <input style="width: 200px" placeholder="Last Name" type="text" value="" name="LNAME" class="" id="mce-LNAME">
                            </td>
                        </tr>
                    </table>
                    <div id="mce-responses" class="clear">
                        <div class="response" id="mce-error-response" style="display:none"></div>
                        <div class="response" id="mce-success-response" style="display:none"></div>
                    </div>
                    <!-- real people should not fill this in and expect good things - do not remove this or risk form bot signups-->
                    <div style="position: absolute; left: -5000px;"><input type="text" name="b_9b44b788c97fa5b498fbbc9b5_8b9aa91988" tabindex="-1" value=""></div>
                    <div class="clear"><input type="submit" value="Subscribe" name="subscribe" id="mc-embedded-subscribe" class="button"></div>
                </div>
            </form>
        </div>
        <script type='text/javascript' src='//s3.amazonaws.com/downloads.mailchimp.com/js/mc-validate.js'></script><script type='text/javascript'>(function($) {window.fnames = new Array(); window.ftypes = new Array();fnames[0]='EMAIL';ftypes[0]='email';fnames[1]='FNAME';ftypes[1]='text';fnames[2]='LNAME';ftypes[2]='text';}(jQuery));var $mcj = jQuery.noConflict(true);</script>
        <!--End mc_embed_signup-->

    </div>
</div>

<!--
<div style="overflow: hidden; border: 1px solid darkgrey; background-color: #eee; padding: 10px; margin: 30px 5px 5px 5px;">

    <div style="float: left; width: 240px;">
        <a href="../understanding-packaging-for-javascript-typescript-commonjs-and-everything-else">
            <img src="../images/agGridDaily.png"/>
        </a>
    </div>
    <div style="overflow: hidden;">
        <div style="font-size: 20px; color: #167ac6; float: left;">
            <a href="../understanding-packaging-for-javascript-typescript-commonjs-and-everything-else">
                Understand Packaging for Javascript, TypesScript, CommonJS and Everything Else
            </a>
        </div>
    </div>
    <div style="color: #767676; padding-top: 20px;">
        Supporting all the frameworks and build systems took days of research and practicing.
        This article goes through lessons learnt and how to structure a project while supporting
        all the frameworks and build systems around today.
    </div>

</div>-->



<?php include 'documentation_footer.php';?>
