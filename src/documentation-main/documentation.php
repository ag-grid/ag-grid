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

<div style="margin-left: 10px; width: 260px; float: right;">

    <style>
        .news-box { border: 1px solid darkgrey; background-color: #eee; padding: 10px; margin-bottom: 10px;}
        .news-header { font-weight: bold; text-align: center; margin-bottom: 10px; }
        .separator { text-align: center; }
    </style>

    <div class="news-box">
        <div class="news-header">
            6th July 2016
        </div>
        <img style="float: right;" src='../images/superDev.jpg'/>
        <div>ag-Grid 5.0.0-alpha-<b style="font-size: 20px">6</b> released. Minor 'cleaning up release' changes. See <a href="../archive/5.0.0-alpha/">5.0.0 Alpha Documentation</a> for details.</div>
        <div>

        </div>
    </div>

<!--    <div class="news-box">
        <div class="news-header">22th March 2016</div>
        <div>Patch for 4.0.x released with bug fixes and minor changes.
            Check <a href="../change-log/changeLogIndex.php">change log</a>.</div>
    </div>
-->
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
    If you are introducing yourself to ag-Grid, then you should read <a href="../javascript-grid-getting-started/">Getting Started</a>.
    Then follow on to the section on the framework that interests you (one of
    <a href="../best-javascript-data-grid/index.php">Javascript</a>,
    <a href="../best-react-data-grid/index.php">React</a>,
    <a href="../best-angularjs-data-grid/index.php">Angular JS</a>,
    <a href="../best-angular-2-data-grid/index.php">Angular 2</a> or
    <a href="../best-web-component-data-grid/index.php">Web Components</a>) and try and get a simple example working
    yourself (you don't need to understand the grid, just how to install it into your application).
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
    <li><b>Tutorials: </b> Some video tutorials for those who prefer YouTube videos over reading.</li>
</ul>
</p>

<h2>
    Keeping up to date
</h2>

<p>
    ag-Grid is a fast moving project. It has gone from zero to huge in a very short space of time. To keep
    up to date, check back regularly to the website, follow Ceolter (core author) on Twitter and join the ag-Grid mailing
    list.
</p>

<h4>Twitter</h4>

<div>
    <a href="https://twitter.com/ceolter" class="twitter-follow-button" data-show-count="false" data-size="large">@ceolter</a>
    <script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');</script>
</div>

<h4>ag-Grid Mailing List</h4>

<!-- Begin MailChimp Signup Form -->
<link href="//cdn-images.mailchimp.com/embedcode/classic-081711.css" rel="stylesheet" type="text/css">
<style type="text/css">
    #mc_embed_signup{background:#fff; clear:left; font:14px Helvetica,Arial,sans-serif; }
    /* Add your own MailChimp form style overrides in your site stylesheet or in this style block.
       We recommend moving this block and the preceding CSS link to the HEAD of your HTML file. */
</style>

<div id="mc_embed_signup">
    <form action="//angulargrid.us11.list-manage.com/subscribe/post?u=9b44b788c97fa5b498fbbc9b5&amp;id=8b9aa91988"
          method="post" id="mc-embedded-subscribe-form" name="mc-embedded-subscribe-form" class="validate" target="_blank" novalidate
          style="padding: 0px">
        <div id="mc_embed_signup_scroll">
            <input style="width: 200px" placeholder="Email Address..." type="email" value="" name="EMAIL" class="required email" id="mce-EMAIL">
            <input style="width: 200px" placeholder="First Name" type="text" value="" name="FNAME" class="" id="mce-FNAME">
            <input style="width: 200px" placeholder="Last Name" type="text" value="" name="LNAME" class="" id="mce-LNAME">
            <input type="submit" value="Subscribe" name="subscribe" id="mc-embedded-subscribe" class="button"
                        style="position: relative; top: -4px;">
            <div id="mce-responses" class="clear">
                <div class="response" id="mce-error-response" style="display:none"></div>
                <div class="response" id="mce-success-response" style="display:none"></div>
            </div>
            <!-- real people should not fill this in and expect good things - do not remove this or risk form bot signups-->
            <div style="position: absolute; left: -5000px;"><input type="text" name="b_9b44b788c97fa5b498fbbc9b5_8b9aa91988" tabindex="-1" value=""></div>
        </div>
    </form>
</div>
<script type='text/javascript' src='//s3.amazonaws.com/downloads.mailchimp.com/js/mc-validate.js'></script><script type='text/javascript'>(function($) {window.fnames = new Array(); window.ftypes = new Array();fnames[0]='EMAIL';ftypes[0]='email';fnames[1]='FNAME';ftypes[1]='text';fnames[2]='LNAME';ftypes[2]='text';}(jQuery));var $mcj = jQuery.noConflict(true);</script>
<!--End mc_embed_signup-->

<h2>
    ag-Grid Roadmap
</h2>

<p>
    Below are listed the 'next big things' on the roadmap for ag-Grid. During the development,
    other smaller items will be included. The next major release of ag-Grid will be released once
    one or more of the below are complete. All of these are being developed out in coordination with
    large ag-Grid clients including one leading investment bank in London and one leading fund
    management company in Canada.
</p>

<h4>Pivoting (ag-Grid enterprise)</h4>

<p>
    Pivoting is the reason we haven't gotten much more done in the past few weeks, it's top of our
    list and we are half way there with the implementation. When it is ready, you will be able to
    pivot data inside ag-Grid similar to the pivot functionality in Excel. It will be controller
    by the tool panel.
</p>

<h2>Work in Progress Movie - Pivoting</h2>
<iframe width="560" height="315" src="https://www.youtube.com/embed/jCId-Lbg_6k" frameborder="0" allowfullscreen></iframe>

<h4>Pinnable Filters in Tool Panel (ag-Grid enterprise)</h4>

<p>
    Modern reporting tools show filters in a panel, so you can interact with a set of filters
    concurrently. ag-Grid will allow this option by having a 'pinnable' option on the filters, which
    when clicked, will move the filter to the tool panel (the right hand panel that currently has
    column management). This will allow the tool panel to host and display multiple filters concurrently.
</p>

<h4>Smaller Items (all for ag-Grid free)</h4>

<p>Plus the following smaller items:</p>
<ul>
    <li>Adding / removing rows without required to call setRowData()</li>
    <li>Components inside the grid with full control of the row (ie will support grids inside grids)</li>
</ul>

<?php include 'documentation_footer.php';?>
