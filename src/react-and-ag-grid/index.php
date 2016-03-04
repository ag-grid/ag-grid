<?php

$pageTitle = "React and ag-Grid, the Perfect Match";
$pageDescription = "ag-Grid is a world leading Enterprise Javascript Data-Grid. React is a world leading Javascript Javascript Rendering Library. This page explains how they both work really well together.";
$pageKeyboards = "react ag-grid javascript grid";

include('../mediaHeader.php');
?>

<div class="row">
    <div class="col-md-12" style="padding-top: 20px; padding-bottom: 20px;">
        <h2>
            <h2>React and ag-Grid, the Perfect Match</h2>
    </div>
</div>

<div class="row">
    <div class="col-md-9">

        <p>
            ag-Grid is an enterprise JavaScript data grid with zero library dependencies,
            including no dependency for it's rendering. You can build an application
            using just JavaScript and ag-Grid alone. The 'ag' stands for framework AGnostic.
        </p>

        <div style="text-align: center">
            <img src="../images/reactAndAgGrid.png" style="width: 300px; padding: 20px;"/>
        </div>

        <p>
            Now ag-Grid is providing
            an optional React component and React rendering.
            ag-Grid is fully in bed with React and treats React as a first class component
            - meaning if you are using React, ag-Grid is NOT using any other
            framework to get the job done.
        </p>

        <p>
            React Components follow standard DOM interaction patterns using properties,
            events (callbacks) and an optional API for interacting with the components.
            React also uses immutability to assist state management. ag-Grid uses
            the same principles. ag-Grid's core
            interface maps directly onto what is required by React making ag-Grid
            and React match perfectly.
        </p>

        <p>

        </p>
        <p>
            <div style="text-align: center">
            <span style="color: darkgrey">Fig 1 - Sample ag-Grid and React - see <a href="../best-react-data-grid/">full example here</a></span>
            <br/>
            <img src="reactAndAgGrid.png" style="width: 500px;"/>
            </div>
        </p>

        <p>
            ag-Grid then goes one step further, it embraces React for rendering.
            That means you can use React for custom cell
            rendering, if you choose, inside the grid. You provide ag-Grid with the React component
            and it knows what to do to seamlessly integrate. No other grid on the market is
            both agnostic and still allows you to use React for rendering.
        </p>

        <p>
            ag-Grid's future is bright. It's ability to integrate with the different
            frameworks makes it strongly positioned to be the enterprise level
            data grid everyone was waiting for. You won't need to throw away your
            grid next time you want to move to a different framework.
        </p>

        <div style="margin-top: 20px;">
            <a href="https://twitter.com/share" class="twitter-share-button" data-url="https://www.ag-grid.com/ag-grid-in-2016/" data-text="Stepping it Up, ag-Grid Focuses on Agnostic in 2016" data-via="ceolter" data-size="large">Tweet</a>
            <script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');</script>
        </div>

    </div>
    <div class="col-md-3">

        <img src="../images/ag-Grid2-200.png" style="display: inline-block; padding-bottom: 20px;"/>

        <div style="margin-top: 20px;">
            <a href="https://twitter.com/share" class="twitter-share-button" data-url="https://www.ag-grid.com/ag-grid-in-2016/" data-text="Stepping it Up, ag-Grid Focuses on Agnostic in 2016" data-via="ceolter" data-size="large">Tweet</a>
            <script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');</script>
        </div>

        <div style="font-size: 14px; background-color: #dddddd; padding: 15px;">

            <p>
                <img src="/niall.png"/>
            </p>
            <p>
                About Me
            </p>
            <p>
                I have been writing software all my life! Starting with Assembly, C++ and MFC,
                moving onto full stack Java / JSP / GWT and now focusing on full stack
                Java / Javascript.
            </p>
            <p>
                Currently working on ag-Grid full time.
            </p>

            <div>
                <br/>
                <a href="http://uk.linkedin.com/in/niallcrosby"><img src="/images/linked-in.png"/></a>
                <br/>
                <br/>
                <a href="https://twitter.com/ceolter" class="twitter-follow-button" data-show-count="false" data-size="large">@ceolter</a>
                <script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');</script>
            </div>

        </div>

        <!--        <div style="font-size: 14px; border: 1px solid lightgrey; margin-top: 25px; padding: 15px;">
                    This article was was published on:
                    <br/>
                    <a href="http://dailyjs.com/2015/03/31/angular-grid-react-native/?utm_content=buffer98f7e&utm_medium=social&utm_source=twitter.com&utm_campaign=buffer">DailyJS</a>
                    <br/>
                    <a href="http://www.dzone.com/links/why_the_world_needed_another_angularjs_grid.html">DZone</a>
                    <br/>
                    <a href="http://www.reddit.com/r/angularjs/comments/30uel2/why_the_world_needed_another_angularjs_grid/">reddit</a>
                    <br/>
                    <a href="http://t.co/vpH62y3THW">ng-newsletter</a>
                </div>-->
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
    © ag-Grid Ltd 2015-2016
</footer>

<?php
include('../mediaFooter.php');
?>
