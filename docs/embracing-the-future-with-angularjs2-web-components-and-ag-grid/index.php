<?php

$pageTitle = "Embracing the Future with AngularJS 2.0, Web Components and ag-Grid";
$pageDescription = "A discussion on how ag-Grid is positioning itself to take advantage of AngularJS 2.0 and Web Components.";
$pageKeyboards = "web components angularjs 2 ag-grid grid";

include('../mediaHeader.php');
?>

<div class="row">
    <div class="col-md-12" style="padding-top: 20px; padding-bottom: 20px;">
        <h2>Embracing the Future with AngularJS 2.0, Web Components and ag-Grid</h2>
    </div>
</div>

<div class="row">
    <div class="col-md-9">

        <p>
            The first release of ag-Grid (www.ag-grid.com) broke the ‘usual thinking’ for AngularJS developers. It provided a high performance grid to the AngularJS community, but it didn’t use AngularJS underneath the hood. Instead it used AngularJS where appropriate, and then native Javascript and DOM manipulation at all other times. A wolf-fast grid in AngularJS clothing! This approach was novel, building a bridge between native Javascript and AngularJS without the client AngularJS application realising it was using a non-AngularJS component.
        </p>

        <p>
            AngularJS 1.x had some shortcomings, which is understandable given its evolutionary development. What AngularJS is being used for today is probably beyond the intentions of Misko when he wrote those first lines of code, which is probably why the guys at Google decided to do a complete redesign for Angular 2. One of the shortcomings that particularly bothered me was the closed nature of the platform: AngularJS applications could not seamlessly use non-AngularJS components. For AngularJS to use a non-AngularJS component, it had to wrap the component with AngularJS code. This led to a sea of non-functional components whose only purpose was to wrap non-AngularJS components – a component wrapping a component.
        </p>

        <p>
            In ag-Grid, this wrapping code is done for you, thus the AngularJS application had no idea it was talking to a non-AngularJS component.
        </p>

        <p>
            AngularJS 2 turns this problem right around. Rather than having a closed system for modularising AngularJS applications,
            AngularJS 2’s foundations lie on the emerging Web Components standard. What this means is that AngularJS will be able to
            directly use, without any wrapper coding, any component written as a Web Component.
            That is easy to understand - when I first heard it I understood technically what it meant - but it took me some time to really appreciate the implications of what it meant.
        </p>

        <p>
            Having spent a considerable time considering the above I have come to the following logical conclusions:
        </p>

        <ul>
            <li>
                Right now AngularJS 1.x has a large following. It is probable that a large majority of that following will migrate onto AngularJS 2 when it is ready.
            </li>
            <li>
                This migration of followers will start hunting for Web Components to include in their AngularJS applications.
            </li>
            <li>
                Web Components will receive a significant wave of interest from these followers.
            </li>
            <li>
                Web Component developers will not have to worry that it’s AngularJS 2 is their client, no wrapper code will be needed.
                This is what's called a framework-agnostic model for Web Components.
            </li>
            <li>
                The sea of non-functional wrapper components for AngularJS 1.x will have no role in the new AngularJS 2 & Web Components world and will be washed away.
            </li>
            <li>
                Some reusable components will be better suited to AngularJS 2 over Web Components. Components that solve business functions to be reused within an organisation probably fit here.
            </li>
            <li>
                Some reusable components will be better suited to Web Components over AngularJS 2 Components. Low level UI widgets (date pickers, grids etc) probably fit here.
            </li>
            <li>
                Low level components that are currently implemented in AngularJS 1.x probably won’t have a place in the new world as Web Components framework-agnostic pattern will be favored. These will also wash away.
            </li>
        </ul>

        <p>
            This is excellent news for Web Component developers, regardless of whether you are an AngularJS advocate or not. This added surge of interest will provide Web Components with additional traction.
        </p>

        <p>
            So in the future, when AngularJS 2 is out, it will bring more choice. Component developers will
            have the choice to provide Web Components that work with AngularJS as well as with other platforms.
            AngularJS developers will have wider choice when selecting components for their application, not
            being restricted with ‘only AngularJS’ components. The binding between application technology choice
            and component technology choice will dissolve. The AngularJS 1.x components that came into existence
            as a result of it's dependency shortcoming will disappear.
        </p>

        <p>
            So where does this leave components like ag-Grid? ag-Grid has worked with AngularJS 1.x and native
            Javascript since version 1. Version 2 has extended to AngularJS 2 and Web Components
            (these are two separate things, one depends on AngularJS 2, one depends on Web Components, however
            an AngularJS 2 application can talk to both). The positioning of ag-Grid, to support this new technology
            choice, was evolutionary. Google and the Web Components community laid the breadcrumbs. Now that ag-Grid
            is available in all these flavours, it will be applicable whichever way the community goes.
        </p>

        <p>
            I guess ag-Grid has thrown some breadcrumbs too, by supporting the multiple choices, with the anticipation of seeing what sticks.
        </p>

        <div style="margin-top: 20px;">
            <a href="https://twitter.com/share" class="twitter-share-button" data-url="http://www.ag-grid.com/embracing-the-future-with-angularjs2-web-components-and-ag-grid/" data-text="Embracing the Future with AngularJS 2.0, Web Components and ag-Grid" data-via="ceolter" data-size="large">Tweet</a>
            <script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');</script>
        </div>

    </div>
    <div class="col-md-3">

        <img src="../images/ag-Grid2-200.png" style="display: inline-block; padding-bottom: 20px;"/>

        <div>
            <a href="https://twitter.com/share" class="twitter-share-button" data-url="http://www.ag-grid.com/embracing-the-future-with-angularjs2-web-components-and-ag-grid/" data-text="Embracing the Future with AngularJS 2.0, Web Components and ag-Grid" data-via="ceolter" data-size="large">Tweet</a>
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
                Consultant working in the financial industry, specialising in web based reporting applications.
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
    © Niall Crosby 2015
</footer>

<?php
include('../mediaFooter.php');
?>
