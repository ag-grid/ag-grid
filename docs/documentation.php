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

<div style="border: 1px solid darkgrey; background-color: #eee; padding: 10px; margin: 30px 5px 5px 5px;"
     xmlns="http://www.w3.org/1999/html">

    <table>
        <tr>
            <td valign="top">
                <p>
                    <b>
                        20th & 21st October
                    </b>
                <p/>
                <p>
                    I'll be presenting at Angular Connect Lnodon 2015
                    giving a talk on building performant components for AngularJS.
                </p>
            </td>
            <td>
                <a href="http://angularconnect.com/"><img src="images/angularConnectBanner.png"/></a>
            </td>
        </tr>
    </table>

</div>


<div style="border: 1px solid darkgrey; background-color: #eee; padding: 10px; margin: 30px 5px 5px 5px;"
     xmlns="http://www.w3.org/1999/html">
    <p>
        <b>11th Oct 2015 - Release of ag-Grid v2.3.1 <!--- Over 800 stars on Github and counting!!--></b>
    </p>

    <p>
        This weeks release sees the following features added:
    <ul>

        <li>Bug fix: Angular 2 - EventEmitter for rowDeselected was missing.</li>
        <li>Major: Added getBusinessKeyForNode() method, to allow easily identifying of rows for automated testing.</li>
        <li>Minor: Removed declaration of 'module' and 'exports' in main.ts, so no longer clashes with node.ts typics.</li>
        <li>Minor: Fixed headerClass, array of classes was not working</li>
    </ul>
    </p>

    <a href="https://twitter.com/ceolter" class="twitter-follow-button" data-show-count="false" data-size="large">Follow @ceolter</a>
    <script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');</script>

</div>

<div style="border: 1px solid darkgrey; background-color: #eee; padding: 10px; margin: 30px 5px 5px 5px;"
     xmlns="http://www.w3.org/1999/html">
    <p>
        <b>6th Sep 2015 - Release of ag-Grid v2.3.0 <!--- Over 800 stars on Github and counting!!--></b>
    </p>

    <p>
        A midweek relesae, because my job needed something done!!
    <ul>
        <li>Major - Introduced 'no rows' message for when grid is empty.</li>
        <li>Major - Introduced custom overlays for 'no rows' and 'loading', so now they can be what you like.</li>
        <li>Major - Moved to AngularJS 2 alpha 38.</li>
        <li>Major - Took out auto loading of AngularJS 2 module with JSPM (as some people were using ag-Grid with JSPM but not with Angular 2).</li>
    </ul>

    </p>

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
                <a href="http://ngmodules.org/modules/ag-Grid" style="color: black; border: 1px solid darkgrey; background-color: lightgrey; padding: 2px;">
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

<?php include 'documentation_footer.php';?>
