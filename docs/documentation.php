<?php
$key = "index";
$pageTitle = "ag-Grid Angular Grid Documentation";
$pageDescription = "Introduction page of documentation for ag-Grid Angular Grid";
$pageKeyboards = "ag-Grid AngularJS Angular Grid Documentation";
include 'documentation_header.php';
?>

<div style="overflow: hidden; border: 1px solid darkgrey; background-color: #eee; padding: 10px; margin: 5px 5px 5px;">
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
        Show your support, star
            <span style="font-family: Impact, Charcoal, sans-serif; padding-left: 6px; padding-right: 6px;">
                <span style="color: darkred;">ag</span><span style="color: #404040;">-Grid</span>
            </span>
        on Github
    </div>
</div>

<!--<div style="overflow: hidden; border: 1px solid darkgrey; background-color: #eee; padding: 10px; margin: 30px 5px 5px 5px;">

    <div style="float: left; width: 240px;">
        <a href="https://www.youtube.com/watch?v=jQ_nyTiKbZg">
            <img src="images/angularAir.png"/>
        </a>
    </div>
    <div style="float: left; width: 450px;">
        <a href="https://www.youtube.com/watch?v=jQ_nyTiKbZg">
            <div style="font-size: 20px; color: #167ac6;">
                Angular Air Episode 32: ag-Grid
            </div>
        </a>
        <div style="color: #767676">
            by Angular Air
        </div>
        <div style="color: #767676">
            Niall Crosby discusses ag-Grid with the Angular Air team. Hear Niall speak openly
            about the story of ag-Grid, Angular 2 and Web Components, and also the future of ag-Grid.
        </div>
    </div>
</div>-->

<div style="overflow: hidden; border: 1px solid darkgrey; padding: 10px; margin: 30px 5px 5px 5px;">

    <div style="float: left; padding-right: 15px;">
        <a href="https://www.reddit.com/r/angularjs/comments/3mbed0/embracing_the_future_with_angularjs_20_web/">
            <img src="data:image/png;base64,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"/>
        </a>
    </div>
    <div style="margin-left: 20px;">
        <a href="https://www.reddit.com/r/angularjs/comments/3mbed0/embracing_the_future_with_angularjs_20_web/">
            <div style="font-size: 20px; color: #167ac6;">
                Embracing the Future with AngularJS 2.0, Web Components and ag-Grid
            </div>
        </a>
        <div style="color: #767676">
            by Niall Crosby
        </div>
        <div style="color: #767676; padding-top: 20px;">
            This article explains the positioning of Web Components, AngularJS 2 and ag-Grid.
        </div>
        <a style="color: #767676; display: inline-block; padding-top: 20px; font-weight: bold;"  href="https://www.reddit.com/r/angularjs/comments/3mbed0/embracing_the_future_with_angularjs_20_web/">
            Please take the time to up-vote this article on Reddit, help grow the community.
        </a>
    </div>
</div>

<!--<div style="border: 1px solid darkgrey; background-color: #eee; padding: 10px; margin: 30px 5px 5px 5px;">
    <div style="display: inline-block; width: 100%;">
        <div style="float: left;">
            <a href="embracing-the-future-with-angularjs2-web-components-and-ag-grid/">
                <h4>Embracing the Future with AngularJS 2.0, Web Components and ag-Grid</h4>
            </a>
        </div>
        <div style="float: right;  color: #767676;">
            25st October 2015
        </div>
    </div>
    <div style="color: #767676">
        The first release of ag-Grid (www.ag-grid.com) broke the 'usual thinking'
        in the world of AngularJS. It provided a high performance grid to the AngularJS
        community, but it didn't use AngularJS underneath the hood. Instead it used
        AngularJS where appropriate, and then native Javascript and DOM manipulation
        at all other times. A wolf-fast grid in AngularJS clothing! . . .
    </div>
    <div style="padding-top: 10px;">
        <a href="embracing-the-future-with-angularjs2-web-components-and-ag-grid/">Click for full article</a>
    </div>
</div>-->

<div style="border: 1px solid darkgrey; background-color: #eee; padding: 10px; margin: 30px 5px 5px 5px;"
     xmlns="http://www.w3.org/1999/html">

    <p>
        <b>23th Aug 2015 <!--- Over 800 stars on Github and counting!!--></b>
    </p>

<!--    <p>
        <b>Last Week</b>
    </p>
-->
    <p style="font-size: 40px">
        <b>Major Release: </b> Announcing <span style="color: darkred;">ag</span><span style="color: #404040;">-Grid</span> v2.0
    </p>

    <p>
        The first ag-Grid production release supporting
        AngularJS 2 and Web Components is here.
        ag-Grid 2.0 is now fully working with all the
        following technologies:
        <ul>
        <li><b>Native Javascript</b> (no framework required)</li>
        <li><b>AngularJS 1.x</b> (most of you are doing)</li>
        <li><b>AngularJS 2</b> (most of you will want to be doing)</li>
        <li><b>Web Component</b> (most of you should be considering)</li>
    </ul>
    </p>

    <p>
        Dear Google, I'm ready now for AngularJS 2.0.
    </p>

    <p>
        Dear Web Component community, hello, please let me know what you think of the grid as a Web Component.
    </p>

    <p>
        <b>This release reworks the interface a bit. </b>
        To migrate from ag-Grid 1.x to 2.0, please follow this <a href="upgrading_to_2.x/index.php">migration guide</a>.
    </p>

    <p>&nbsp;</p>

    <p>
        <b>Next Week</b>
    </p>
    <p>
        I need to sleep. I need to sleep.
    </p>

<!--    <p>
        <b>Angular Air</b>
    </p>
    <p>
        On Tuesday 15th September I will be on <a href="http://angular-air.com/">Angular Air</a> talking about
        my work with ag-Grid.
    </p>
-->
    <a href="https://twitter.com/ceolter" class="twitter-follow-button" data-show-count="false" data-size="large">Follow @ceolter</a>
    <script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');</script>
</div>


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


<div style="text-align: center; margin: 50px;">
    <div style="border: 1px solid lightgrey; display: inline-block; padding: 10px;">
        <div style="padding-bottom: 10px">
            Has the grid helped? Please donate to show your support and appreciation. Thanks.
        </div>
        <div>
            <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top">
                <input type="hidden" name="cmd" value="_s-xclick">
                <input type="hidden" name="encrypted" value="-----BEGIN PKCS7-----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-----END PKCS7-----">
                <input type="image" src="https://www.paypalobjects.com/en_US/GB/i/btn/btn_donateCC_LG.gif" border="0" name="submit" alt="PayPal – The safer, easier way to pay online.">
                <img alt="" border="0" src="https://www.paypalobjects.com/en_US/i/scr/pixel.gif" width="1" height="1">
            </form>
        </div>
    </div>
</div>


<!--<form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top">
    <input type="hidden" name="cmd" value="_s-xclick">
    <input type="hidden" name="encrypted" value="-----BEGIN PKCS7-----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-----END PKCS7-----">
    <input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif" border="0" name="submit" alt="PayPal - The safer, easier way to pay online!">
    <img alt="" border="0" src="https://www.paypalobjects.com/en_US/i/scr/pixel.gif" width="1" height="1">
</form>
-->


<div style="padding: 20px; margin: 5px;">

    <div style="text-align: center; font-weight: bold;">

        <div style="display: inline-block; width: 40%;">
            Star or Watch <br/>
                <iframe src="https://ghbtns.com/github-btn.html?user=ceolter&repo=ag-grid&type=star&count=true&size=large"
                        frameborder="0" scrolling="0" width="160px" height="30px">
                </iframe>
                <iframe src="https://ghbtns.com/github-btn.html?user=ceolter&repo=ag-grid&type=watch&count=true&size=large&v=2"
                        frameborder="0" scrolling="0" width="160px" height="30px">
                </iframe>
        </div>

        <div style="display: inline-block; vertical-align: top; width: 25%;">
            Say You Use <br/>
                <a href="http://ngmodules.org/modules/angular-grid" style="color: black; border: 1px solid darkgrey; background-color: lightgrey; padding: 2px;">
                    A<span style="color: darkred">ng</span>ular Modules
                </a>
        </div>

        <div style="display: inline-block; vertical-align: top; width: 30%;">

            Tell Friends<br/>

                <a class='share-link' href="https://www.facebook.com/sharer/sharer.php?u=www.ag-grid.com">
                    <img src="/images/facebook_32.png" alt="Share on Facebook" title="Share on Facebook"/>
                </a>

                <a class='share-link' href="https://twitter.com/home?status=Check%20out%20ag-Grid,%20a%20new%20way%20to%20show%20grid%20data%20for%20the%20web">
                    <img src="/images/twitter_32.png" alt="Share on Twitter" title="Share on Twitter"/>
                </a>

                <a class='share-link' href="https://plus.google.com/share?url=www.ag-grid.com">
                    <img src="/images/googleplus_32.png" alt="Share on Google Plus" title="Share on Google Plus"/>
                </a>

                <a class='share-link' href="https://www.linkedin.com/shareArticle?mini=true&url=www.ag-grid.com&title=Angular%20Grid&summary=A%20new%20way%20to%20show%20grid%20data%20for%20AngularJS&source=">
                    <img src="/images/linkedin_32.png" alt="Share on LinkedIn" title="Share on LinkedIn"/>
                </a>

        </div>
    </div>

</div>

<div style="text-align: center">
    <a href="http://angularconnect.com/"><img src="images/angularConnectBanner.png"/></a>
</div>


<div style="padding: 20px;">

    <h3>
        News
    </h3>

    <hr/>

    <p>
        <b>13th Sep</b> First pass on AngularJS 2
    </p>

    <hr/>

    <p>
        <b>6th Sep</b> Floating headers and footers
    </p>

    <hr/>

    <p>
        <b>31th Aug</b> Column API, External Filtering, Excel Like Filtering
    </p>

    <hr/>

    <p>
        <b>16th Aug</b> Master & Slave Grids.
    </p>

    <hr/>

    <p>
        <b>26th July</b> minWidth and maxWidth for columns. Chaining of cell expressions.
    </p>

    <hr/>

    <p>
        <b>18th July</b> Expressions implemented. Grid now works like Excel!!
    </p>

    <hr/>

    <p>
        <b>5th July</b> Typescript, Values on Tool Panel, Column API
    </p>

    <hr/>

    <p>
        <b>21st June</b> First version of Tool Panel, showing / hiding / reordering / grouping columns.
    </p>

    <hr/>

    <p>
        <b>14th June</b> Server side sorting and filtering, headerValueGetter, newRowsAction, suppressUnSort & suppressMultiSort'.
    </p>

    <hr/>

    <p>
        <b>7th June</b> New features: Ensure Col Index Visible, No Isolated Scope, API for Sorting,
        API for Saving / Setting Filters
    </p>

    <hr/>

    <p>
        <b>31st May</b> New features: Default aggregation, filtering API, de-selection, foeEachInMemory.
    </p>

    <hr/>

    <p>
        <b>25th May</b> Keyboard Navigation and general improvements
    </p>

    <hr/>

    <p>
        <b>17th May</b> Revamp of Grouping, ensureIndexVisible, ensureNodeVisible, Multi Column Sort (thanks Dylan Robinson), Fixed Width Cols.
    </p>

    <hr/>

    <p>
        <b>26 April</b> - Volatile Columns, Soft Refresh, Cell Templates.
    </p>

    <hr/>

    <p>
        <b>25 April</b> - Bug fixes:
        <a href="https://github.com/ceolter/angular-grid/issues/35">Pinned Blank Space</a>,
        <a href="https://github.com/ceolter/angular-grid/issues/91">Group Sorting</a>,
        <a href="https://github.com/ceolter/angular-grid/issues/90">Cell Templates</a>,
        <a href="https://github.com/ceolter/angular-grid/issues/29">Expand / Collapse</a>
    </p>

    <hr/>

    <p>
        <b>20 April</b> - Value Getters, Context and Expressions. Will be available in 1.3, or take latest.
        All documented in relevant sections.
    </p>

    <hr/>

    <p>
        <b>18 April</b> - Gulp! Thank you Tanner Linsley for implementing Gulp.
    </p>

    <hr/>

    <p>
        <b>16 April</b> - Checked in column opening & closing column Groups. Now you can show and hide columns in groups.
        Will be available in 1.3, or take latest. Documentation page 'Grouping Headers' updated.
    </p>

    <hr/>

    <p>
        <b>13 April</b> - Checked in 'tab navigation for editing', so when you hit tab while editing a cell, it goes into
        editing the next cell. Will be available in 1.3, or take latest.
    </p>

    <hr/>

    <p>
        <b>12 April</b> - Checked in datasources, pagination, virtual paging, infinite scrolling. Will be available in 1.3, or take latest. Documentation
        pages 'Datasource', 'Pagination' and 'Virtual Paging' created.
    </p>

    <hr/>

    <p>
        <b>09 April</b> - Checked in support for 'Refresh Aggregate Data'. Will be available in 1.3, or take latest. Documentation
        page 'Grouping and Aggregating Rows' updated.
    </p>

    <hr/>

    <p>
        <b>06 April</b> - Checked in support for 'Loading Panel' to show when fetching data. Will be available in 1.3, or take latest. Documentation
        page for loading created.
    </p>

    <hr/>

    <p>
        <b>05 April</b> - Checked in support for custom icons in the headers. Will be available in 1.3, or take latest. Documentation
        page for icons created.
    </p>

    <hr/>

    <p>
        <b>04 April</b> - Checked in support for footers while grouping. Will be available in 1.3, or take latest. Documentation
        for grouping and example in 'test drive' updated to show.
    </p>

    <hr/>

    <p>
        <b>31 March</b> - DailyJS covers launch of Angular Grid.
    </p>

</div>

<?php include 'documentation_footer.php';?>
