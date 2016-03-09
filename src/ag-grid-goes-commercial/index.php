<?php

$pageTitle = "ag-Grid Goes Commercial";
$pageDescription = "A discussion on the release of ag-Grid and it's commercial plans.";
$pageKeyboards = "ag-Grid javascritp script ag-grid-enterprise Commercial";

include('../mediaHeader.php');
?>


<div class="row">
    <div class="col-md-12" style="padding-top: 20px; padding-bottom: 20px;">
        <h2>ag-Grid Goes Commercial</h2>
    </div>
</div>

<div class="row">
    <div class="col-md-9">

        <p>
            Today see's the release of version 4.x of ag-Grid. This is the first release offering both free and
            enterprise versions. From now on, the ag-Grid core
            project (formally ag-Grid) is split into ag-Grid (free and covered by MIT license) and ag-Grid-Enterprise
            (not free, covered by a Commercial license).
        </p>

        <p>
            Doing this change was done with large consideration. I understand that this will upset some people
            in the community. However I believe this change was needed for a project like ag-Grid to exist. Let me
            share some light on what is actually happening:
        </p>

        <p>
            During 2015, ag-Grid was a pet project, it was what I spent most hours doing outside of my
            day job. I estimate I put in 20 hours per week on average into ag-Grid. This meant my personal life
            took a back seat.
        </p>

        <p>
            For 2016, I have given up my job to focus on ag-Grid full time. So far during this time I have taken
            a step back from the code and implemented large changes to keep the codebase healthy. For example one
            of the major things I have done is created ag-Grid's
            own IoC container and Component library - the frameworks out there in my opinion are not suitable for
            a complex widget like ag-Grid. My full time commitment allows this technical ownership and what is
            allowing ag-Grid excel over other grids. Grids are complex systems,
            ag-Grid is one of the most complex projects I have worked on.
        </p>

        <p>
            I do not accept PR's without going through them all with a fine tooth comb. I do not release code
            without doing full regression testing (takes about one full day). I constantly refactor as complexity
            grows to keep the foundations capable of managing a complex system. Large features that I implement
            take me days of undistracted full dedication, dedication that would not be given if this project was to
            remain a pet project.
        </p>

        <p>
            So in summary, this project only has a future if I can work on it full time. If this doesn't turn into
            a revenue stream, then I'm going to have to find a job, and this project will stagnate. On the other hand,
            if this project succeeds, well we are just getting started. There is so much more we can do. I am excited
            about the prospects of where next. It would be great if I could get a small team hired to help me, really
            taking things forward and killing the 'what grid do we use' question once and for all.
        </p>

        <p>
            Some questions and answers that I have anticipated:
        </p>

        <p>
            <b>How do you decide what features go into ag-Grid-Enterprise?</b><br/>
            In my head I asked "what feature are above and beyond what the other grids are offering"
            and decided to have that as a reference point on what should be provided for free vs paid. So if you are
            looking for a grid that pretty much matches the other free ones for features (but kills them on everything else!)
            then you can use ag-Grid free version if you are on a budget.
        </p>

        <p>
            <b>Are there new enterpsie features, or did you just move items around?</b><br/>
            There are plenty of new enterprise features in version 4 for example clipboard interaction, range cell
            selection, status panel (to auto aggregation of selected ranges), the documentation has a new section
            for ag-Grid-Enterprise where you can see all the features included. From the previous version,
            I moved row grouping, aggregation, setFilter and toolPanel into the ag-Grid-Enterprise (I do not intend to
            move anything else). If you are using these features currently, the you have the choice of a) do not
            upgrade to the latest version b) stop using them or c) get a licence for and start using ag-Grid-Enterprise.
        </p>

        <p>
            <b>ag-Grid-Enterprise is on Github, is it open source?</b><br/>
            Yes. ag-Grid-Enterprise is open source and still commercial. Anyone can view the code, but you are not allowed
            to copy it as it is copyright. If you pay a licene then you are free to fork the code and make changes for
            your own personal use.
        </p>

        <p>
            <b>Does absolutly everyone have to pay for the enterprise version?</b><br/>
            It's free to use for non-profit organisations or for educational use.
        </p>

        <p>
            <b>I don't agree with what you have done...</b><br/>
            Feel free to use ui-Grid or slickGrid, grids that come to mind who do not have a commercial model around them.
        </p>

        <p>
            <b>But I gave you a sizable donation through PayPal, and I now have to pay?</b><br/>
            I am very grateful to anyone who has donated over the past year. If / when you enquire about an enterprise
            license, please note to me who you are so I can match you kindness with discount (not one for one, I'll be nicer!!).
        </p>

        <p>
            <b>What about support?</b><br/>
            I am going to change the forum to members
            only so that I can give dedicated support to those who become ag-Grid-Enterprise users.
        </p>

        <p>
            And that's it. My apologies to those who find the new commercial model a shock.
        </p>

        <p>
            Best regards,<br/>
            Niall Crosby.
        </p>

        <div style="margin-top: 20px;">
            <a href="https://twitter.com/share" class="twitter-share-button" data-url="https://www.ag-grid.com/ag-grid-goes-commercial/" data-text="ag-Grid Goes Commercial" data-via="ceolter" data-size="large">Tweet</a>
            <script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');</script>
        </div>

    </div>
    <div class="col-md-3">

        <img src="../images/ag-Grid2-200.png" style="display: inline-block; padding-bottom: 20px;"/>

        <div>
            <a href="https://twitter.com/share" class="twitter-share-button" data-url="https://www.ag-grid.com/ag-grid-goes-commercial/" data-text="ag-Grid Goes Commercial" data-via="ceolter" data-size="large">Tweet</a>
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
    © ag-Grid Ltd 2015-2016
</footer>

<?php
include('../mediaFooter.php');
?>
