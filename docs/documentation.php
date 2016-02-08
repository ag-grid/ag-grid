<?php
$key = "index";
$pageTitle = "ag-Grid Angular Grid Documentation";
$pageDescription = "Introduction page of documentation for ag-Grid Angular Grid";
$pageKeyboards = "ag-Grid AngularJS Angular Grid Documentation";
include 'documentation_header.php';
?>

<!--<div style="overflow: hidden; border: 1px solid darkgrey; background-color: #eee; padding: 10px; margin: 5px 5px 5px;">-->
<div style="overflow: hidden; border: 1px solid darkgrey; background-color: #eee; padding: 2px; margin: 5px 5px 5px;">
<!--    <div style="text-align: center; font-size: 40px; background-color: black;">
        <span style="color: gainsboro">
            Keep the stars coming!!
        </span>
        <img src="http://rs902.pbsrc.com/albums/ac225/Sharkmandude/fireworks3.gif~c200" style="width: 100px"/>
    </div>-->
    <div style="padding: 10px;">

    <div style="float: left;">
        <img src="images/star.png"/>
    </div>
    <div style="float: right;">
        <iframe src="https://ghbtns.com/github-btn.html?user=ceolter&repo=ag-grid&type=star&count=true&size=large"
                frameborder="0" scrolling="0" width="160px" height="30px">
        </iframe>
        <iframe src="https://ghbtns.com/github-btn.html?user=ceolter&repo=ag-grid&type=watch&count=true&size=large&v=2"
                frameborder="0" scrolling="0" width="160px" height="30px">
        </iframe>
    </div>
    <div style="text-align: center; font-size: 22px;">
        Keep the stars coming, star
            <span style="font-family: Impact, Charcoal, sans-serif; padding-left: 6px; padding-right: 6px;">
                <span style="color: darkred;">ag</span><span style="color: #404040;">-Grid</span>
            </span>
        on Github
    </div>

    </div>

</div>

<div style="overflow: hidden; border: 1px solid darkgrey; background-color: #eee; padding: 10px; margin: 30px 5px 5px 5px;">

    <div style="overflow: hidden;">
        <div style="font-size: 20px; float: left;">
            <img src="images/panda.png"/>
        </div>
        <div style="font-size: 25px; float: left; padding-left: 10px">
            ag-Grid v3.3 Released
        </div>
        <div style="float: right;  color: #767676;">
            08th February 2016
        </div>
    </div>

    <div style="padding-top: 20px;">
        <p>
            The <a href="changeLog.php">change log</a> has a full set of changes. The
            highlights are as follows:
        </p>
        <p>
        <ul>
            <li>
                <b>Column Drag Reordering</b> to reorder your columns by dragging the headers.
            </li>
            <li>
                <b>'ready' event now 'gridReady'</b> (because it was clashing with another ready event in Angular 2)
            </li>
            <li>
                <b>Moved to proper CommonJS</b> so now everything bundles nicely, including accessing ag-Grid
                via ECMA 6 modules (great for Angular 2, no more global scope).
            </li>
            <li>
                <b>Row Group Sorting</b> so now you can sort your groups.
            </li>
        </ul>
        </p>
        <h3>Examples on Github:</h3>
        <p>

        <ul>
            <li><a href="https://github.com/ceolter/ag-grid-commonjs-example">CommonJS, Gulp and Browersify</a> - Project on Github</li>
            <li><a href="https://github.com/ceolter/ag-grid-react-example">React, Webpack, Babel</a> - Project on Github</li>
            <li><a href="https://github.com/ceolter/ag-grid-ng2-example">Angular 2, SystemX, JSPM, Typescript</a> - Project on Github</li>
        </ul>
        </p>
        <h3>New ag-Grid Directory Structure (only for those interested)</h3>
        <p>
            The new build has the following structure:<br/>
            <b>\src</b> -> contains source files (TypeScript and CSS), don't touch these!<br/>
            <b>\dist</b> -> contains distribution files<br/>
            <b>\dist\ag-grid.js and \dist\ag-grid.min.js</b> -> use these if not using a package manager and put ag-Grid on
            the global scope. The new JavaScript distribution files contain the CSS for the grid, no need to reference
            separately.<br/>
            <b>\dist\styles</b> -> contains CSS files, used if doing your own bundling.<br/>
            <b>\dist\lib</b> -> contains compiles JavaScript files in CommonJS format.<br/>
            <b>\main.js</b> -> CommonJS root file, reference this file if importing project via CommonJS.<br/>
            <b>\main.d.ts</b> -> CommonJS root definition file.<br/>
        </p>
    </div>

</div>

<div style="overflow: hidden; border: 1px solid darkgrey; background-color: #eee; padding: 10px; margin: 30px 5px 5px 5px;">

    <div style="float: left; width: 240px;">
        <a href="react-and-ag-grid/">
            <img src="images/agGridDaily.png"/>
        </a>
    </div>
    <div style="overflow: hidden;">
        <div style="font-size: 20px; color: #167ac6; float: left;">
            <a href="react-and-ag-grid/">
                React and ag-Grid - the Perfect Match
            </a>
        </div>
        <div style="float: right;  color: #767676;">
            28th January 2016
        </div>
    </div>
    <div style="color: #767676">
        Self Published
    </div>
    <div style="color: #767676; padding-top: 20px;">
        Article announcing ag-Grids support for React. Not only do they work together,
        they play together very well indeed!
    </div>

</div>


<div style="overflow: hidden; border: 1px solid darkgrey; background-color: #eee; padding: 10px; margin: 30px 5px 5px 5px;">
    <b>Version 3.2.0 released</b>. Minor changes, see the <a href="changeLog.php">change log</a>. This release
    was mostly to support the 'React Component' which I'm going to release as soon as I get the
    documentation updated.
</div>

<div style="overflow: hidden; border: 1px solid darkgrey; background-color: #eee; padding: 10px; margin: 30px 5px 5px 5px;">

    <div style="overflow: hidden;">
        <div style="font-size: 20px; float: left;">
            <img src="images/superDev.jpg"/>
        </div>
        <div style="font-size: 25px; float: left; padding: 20px;">
            ag-Grid v3.1.0 Released
        </div>
        <div style="float: right;  color: #767676;">
            20th January 2016
        </div>
    </div>

    <div style="padding-top: 20px;">
        <p>
            ag-Grid 3.1.0 is now released. The <a href="changeLog.php">change log</a> has a full set of changes. This
            is a minor release and is fully compatible with the previous. Highlights of this release are:
        </p>
        <p>
        <ul>
            <li><b>Column Auto-width</b> to fit cell contents.
                Documented <a href="./angular-grid-resizing/index.php">here</a>.
            </li>
            <li><b>Header Templates</b> to allow full customisation of headers.
                Documented <a href="./angular-grid-header-rendering/index.php">here</a>. </li>
            <li><b>Variable Row Height</b> so now your rows can have different heights.
                Documented <a href="./angular-grid-row-height/index.php">here</a>. </li>
        </ul>
        </p>
    </div>


</div>

<div style="overflow: hidden; border: 1px solid darkgrey; background-color: #eee; padding: 10px; margin: 30px 5px 5px 5px;">

    <div style="overflow: hidden;">
        <div style="font-size: 20px; float: left;">
            <img src="images/newAndImproved.jpg"/>
        </div>
        <div style="font-size: 25px; float: left; padding: 20px;">
            ag-Grid v3.0.0 Released
        </div>
        <div style="float: right;  color: #767676;">
            18th January 2016
        </div>
    </div>

    <div style="padding-top: 20px;">
        <p>
            ag-Grid 3.0.0 is now released. The <a href="changeLog.php">change log</a> has a full set of changes and what
            you need to do to upgrade. The new big changes are as follows:
        </p>
        <p>
        <ul>
            <li>Left and right column pinning with <a href="./angular-grid-pinning/index.php">updated documentation</a>. </li>
            <li>Multiple levels of column grouping with <a href="./angular-grid-grouping-headers/index.php">updated documentation</a>. </li>
            <li>Pivoting is now called 'row grouping' (it wasn't really pivoting, I will be implementing proper pivoting in the future and needed to remove the confusion!!).</li>
        </ul>
        </p>
        <p>
            The above three things are small in a list, however they had massive implications and required a very large coding effort.
            I've spent the last few days
            fully testing everything, making sure all the above work in all the scenarios. If you are looking at the source
            code, the biggest difference you will see is around the ColumnController which is almost completely rewritten.
            Now the columns are stored in tree structures instead of lists (to support multi levels of grouping).
        </p>
        <p>
            This release has some minor breaking changes, especially if you are currently grouping headers or pivoting
            (now called grouping rows). I tried to program the grid so if you are using old properties, it will hint
            to the console what you need to change.
        </p>
        <p>
            I have done massive amounts of regression testing and reviewing of the documentation.
            If I missed anything, please let me know.
        </p>
    </div>


</div>

<!--<div style="overflow: hidden; border: 1px solid darkgrey; background-color: #eee; padding: 10px; margin: 30px 5px 5px 5px;">

    <div style="float: left; width: 250px;">
        <img style="width: 240px;" src="https://images.rapgenius.com/f0ee868d0cca75ec68f62d2b9bf57b16.748x431x1.png"/>
    </div>
    <div style="overflow: hidden;">
        <div style="font-size: 20px; float: left;">
            2016 will be the year ag-Grid takes over
        </div>
        <div style="float: right;  color: #767676;">
            4th January 2016
        </div>
    </div>

    <div style="color: #767676; padding-top: 20px;">
        My 9 week holiday was great. I spent the last two months travelling India, Myanmar and Ireland (where I am from!).
        I am now back in London and am unemployed. Finally I can get some decent 'grid time'.
        So in the coming weeks you can expect weekly release with lots of new features
        morphing ag-Grid into the best Javascript grid in the world.
    </div>


</div>-->

<!--<div style="overflow: hidden; border: 1px solid darkgrey; background-color: #eee; padding: 10px; margin: 30px 5px 5px 5px;">
    <div style="float: left; width: 240px;">
        <div style="border: 1px solid grey; text-align: center; margin-right: 10px; padding: 10px;">
            Sponsor
        </div>
    </div>
    <div style="color: #767676;">
        This website is receiving multiple thousands of visits per day and growing.
        Would you like to sponsor and / or advertise here?
    </div>
</div>-->

<!--
<div style="overflow: hidden; border: 1px solid darkgrey; background-color: #eee; padding: 10px; margin: 30px 5px 5px 5px;">

    <div style="float: left; width: 240px;">
        <a href="ag-grid-in-2016/">
            <img src="images/agGridDaily.png"/>
        </a>
    </div>
    <div style="overflow: hidden;">
        <div style="font-size: 20px; color: #167ac6; float: left;">
            <a href="ag-grid-in-2016/">
                Stepping it Up, ag-Grid Focuses on Agnostic in 2016
            </a>
        </div>
        <div style="float: right;  color: #767676;">
            <a href="https://twitter.com/share" class="twitter-share-button" data-url="https://www.ag-grid.com/ag-grid-in-2016/" data-text="Stepping it Up, ag-Grid Focuses on Agnostic in 2016" data-via="ceolter" data-size="large">Tweet</a>
            <script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');</script>
        </div>
    </div>
    <div style="color: #767676">
        Self Published
    </div>
    <div style="color: #767676; padding-top: 20px;">
        Article taking a step back from ag-Grid and sharing the plans for ag-Grid and 2016.
    </div>

</div>
-->

<div style="text-align: center; margin-top: 50px;">
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


<!--<form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top">
    <input type="hidden" name="cmd" value="_s-xclick">
    <input type="hidden" name="encrypted" value="-----BEGIN PKCS7-----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-----END PKCS7-----">
    <input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif" border="0" name="submit" alt="PayPal - The safer, easier way to pay online!">
    <img alt="" border="0" src="https://www.paypalobjects.com/en_US/i/scr/pixel.gif" width="1" height="1">
</form>
-->


<?php include 'documentation_footer.php';?>
