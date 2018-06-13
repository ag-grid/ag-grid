<?php

$pageTitle = "ag-Grid Blog: ag-Grid Partnering with Adaptable Blotter";
$pageDescription = "Explaining the performance hacks and techniques used in ag-Grid to make it render really fast.";
$pageKeyboards = "javascript performance";
$socialUrl = "https://www.ag-grid.com/ag-grid-performance-hacks/";
$socialImage = "https://www.ag-grid.com/ag-grid-performance-hacks/images/PerformanceHacks.png";

include('../includes/mediaHeader.php');
?>

<style>
    .codeComment {
        color: darkgreen;
    }
</style>

<div class="row">
    <div class="col-md-12" style="padding-top: 20px; padding-bottom: 20px;">
        <h1>Getting More from your Datagrid - Introducing Adaptable Blotter</h1>
    </div>
</div>

<div class="row">
    <div class="col-md-9">

        <h2>What Does It Do?</h2>

        <p>
        Adaptable Blotter is a very clever piece of software that sits on top of datagrids and delivers powerful functionality to the end user. We have been working closely with the team and they recently completed their integration with ag-Grid. The combination of the two products significantly reduces development, taking care of common requirements such as user configuration and settings, multiple layouts, auditing of grid activity and custom columns. While Adaptable Blotter is built for financial users, we see many features that would be of interest in other sectors. In our opinion, Adaptable Blotter naturally dovetails with ag-Grid, harnessing our raw power and leveraging our features to deliver a lightning fast and intuitive experience for the user.
        </p>

        <h2>How Does it work with ag-Grid</h2>

        <p>
        Adaptable Blotter builds on the ag-Grid API and uses the hooks and events of our grid to deliver extended functionality. We want to ensure that our grid remains fast and efficient to deliver performance so these are features we don't see as living within a grid. Implementing the blotter is very straightforward and our close relationship with their team ensures that both products work seamlessly ith each other. Adaptable Blotter supports both ag-Grid Community Edition and a-Grid Enterprise up to the latest versions.
        </p>

        <h2>Where can you Learn More?</h2>

        <p>
        To learn more about Adaptable Blotter, you can see the demo of ag-Grid here, they have even built a performance monitor. The Adaptable team come to the table with a different perspective as they are heavily user focussed whereas ag-Grid is pitched at the developer, this has long been our stronghold. This is the first time we have worked closely with a partner such as this and believe it has borne fruit. If you'd like to feature on our partner spotlight page or tell us about your project involving ag-Grid, please get in touch.
        </p>

        <h2>And Share!!!</h2>

        <p>
            Sharing is caring! So please take the time to share this article, or up-vote on Reddit (link below).
        </p>

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
                           data-url="https://www.ag-grid.com/ag-grid-performance-hacks/"
                           data-text="ag-Grid and Adaptable Blotter  #javascript" data-via="ceolter"
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
    <div class="col-md-3
    ">

        <div style="font-size: 14px; background-color: #dddddd; padding: 15px;">

            <p>
            <img src='../images/team/john.jpg' width="232.5px"/>
            </p>

            <p>
                <b>John Masterson</b>
            </p>
            <p>
                <b>Customer Experience Manager</b>
            </p>
            <p>
                John was the first business focused hire at ag-Grid and joined in late 2016 to manage and grow the customer base. He has an operations and product management background and has always focused on the end user of technology. John is always available to deal with customer queries as well as building ag-Grid's infrastructure for growth.
            </p>

            <div>
                <br/>
                <a href="https://www.linkedin.com/in/john-f-masterson/"><img src="/images/linked-in.png"/></a>
                <br/>
                <br/>
                <a href="https://twitter.com/ceolter" class="twitter-follow-button" data-show-count="false" data-size="large">@ceolter</a>
                <script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');</script>
            </div>

        </div>

    </div>
</div>


<hr/>

<div id="disqus_thread"></div>
<script type="text/javascript">
    /* * * CONFIGURATION VARIABLES * * */
    var disqus_shortname = 'aggrid';

    /* * * DON'T EDIT BELOW THIS LINE * * */
    (function() {
        var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
        dsq.src = '//' + disqus_shortname + '.disqus.com/embed.js';
        (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
    })();
</script>
<noscript>Please enable JavaScript to view the <a href="https://disqus.com/?ref_noscript" rel="nofollow">comments powered by Disqus.</a></noscript>
<hr/>

<footer class="license">
    © ag-Grid Ltd. 2015-2017
</footer>

<?php
include('../includes/mediaFooter.php');
?>
