<?php

$pageTitle = "ag-Grid Blog: 2016 - Focus on all Frameworks";
$pageDescription = "2015 was a busy year for ag-Grid. We run through our plans for 2016, we'll be focussing on adding support for more frameworks. We believe in being agnostic to frameworks and will be delivering this philosophy in 2016.";
$pageKeyboards = "javscript ag-grid grid agnostic component";

include('../includes/mediaHeader.php');
?>

            <h1>Stepping it Up, ag-Grid Focuses on Agnostic in 2016</h1>

<div class="row">
    <div class="col-md-8">

        <h2>The Road So Far</h2>

        <p>
            23rd of December 2014. That is the date of the first ag-Grid commit to Github. Ten months later and
            I had the privilege of presenting my work at the Google conference
            <a href="https://www.youtube.com/watch?v=gNhPeLCBbE0">Angular Connect</a> in London
            to a room of hundreds of people and streamed live on Youtube. At the conference I was explaining how I
            made the grid super fast (which, btw, involved doing it all in Javascript and not using Angular).
        </p>
        <p>
            ag-Grid is now one of the worlds leading datagrids for modern Javascript applications.
            It was born from the Angular world (as I was building Angular applications at the time) but it is now firmly
            framework agnostic - it has no dependencies on any framework.
        </p>

        <h3>Focusing on Agnostic</h3>

        <p>
            I am now sure, more than ever, that low level HTML components should not have
            dependencies on any framework. That means, a grid should not be implemented using Angular or React or
            anything else. ag-Grid has demonstrated that a lightning fast grid is possible without the help of any
            framework. If a framework was to be introduced, it would just add layers of abstraction around
            the DOM and block the efficiency of ag-Grid.
        </p>
        <p>
            Frameworks should be used for applications and higher level components - typically components
            containing business functions.
        </p>
        <p>
            If a framework is not able to comfortably work with framework agnostic components, then this is a
            failing in the framework.
        </p>

        <p>
            In 2016 I'll be working with ag-Grid alongside React demonstrating how the two work well with each other.
            This is just to make things more comfortable for people using React. As far as I'm concerned, the grid
            is agnostic right now, so will already work inside a React application.
        </p>

        <h3>Data Driven Approach, not Template Driven</h3>

        <p>
            ag-Grid is written using a Data Driven Approach (see my <a href="https://www.youtube.com/watch?v=gNhPeLCBbE0">
                Angular Connect talk </a> for this to be explained).
            This has two advantages:
        </p>
        <ul class="content">
            <li>
            <b>Speed</b> - although templates themselves are not necessarily that much slower, the added 'waffle' frameworks
            put in all add up to slowness.
            </li>
            <li><b>Less code</b> - in particular, no HTML and no bindings to worry about. Less code is easier to understand,
            easier to test, easier to maintain.</li>
        </ul>

        <p>
            Today's frameworks are very much template driven. This is another reason why
            breaking away from the frameworks makes sense for ag-Grid. Frameworks should provide the
            application level concerns, leaving low level components to worry about low level concerns, where
            at times data driven designs may be preferred.
        </p>

        <h3>Open Source vs Community Developed</h3>

        <p>
            ag-Grid is given as open source so you can use it without payment. I did not choose open source
            to create a community to contribute and build it out. Basically I am not a fan
            of 'Community Driven Development' in creating complex software like ag-Grid. If the project was less
            complex, where a blueprint could be followed for the different parts, then community driven could work.
            However that is not the case. The grid design is an evolving complex idea in the mind of Niall Crosby.
            I can discuss the design and work with people when they sit beside me. But daily updates on email
            and organising conference calls doesn't result in the same magic. That's even assuming daily updates
            and conference calls happen, wishful thinking if people are keeping day jobs!
        </p>

        <h3>Open Source or Day Job</h3>

        <p>
            For an open source project like ag-Grid to flourish, it really needs the full time commitment of
            at least one person. It is just not possible for me to continue working so hard as I have and still
            give ag-Grid what it needs. So I've quit my job. Last week was my last week working for the Royal
            Bank of Scotland in London.
        </p>

        <p>
            I don't know where this plan leads but I thought "dammit, lets just do it" and see where it
            takes me.
        </p>

        <p>
            BTW - Angular and React are managed by teams within their respective companies who get paid salaries.
            These projects are funded as part of the overall strategies for making money for their companies.
        </p>

        <h3>Taking a Holiday</h3>

        <p>
            ag-Grid was built in my spare time. During the weekends and evenings of 2015 I must have spent in total
            20 hours working on the grid each week. So for November and December 2015 I'm
            visiting beautiful India and Myanmar. Next year I'll be returning with lots of energy and continued enthusiasm.
        </p>

        <h3>The Vision for 2016</h3>

        <p>
            I want to make ag-Grid the best grid it can possibly be. Originally the plan was just to create a
            grid that matched my own requirements. However the community has encouraged me to want to provide
            the best grid available for Javascript development. Next year I plan to focus on the following:
            <ul class="content">
            <li><b>Close any Feature Gap:</b> Some 'core' items still need to get done, such as dragging columns to
            reposition, adding / removing rows without a complete reload, having dynamic row height etc.
            I want to get ALL of these done in the first few months of next year so that the grid is not just
            feature rich (as it is now), but feature complete. There will be nothing any other grid has on
            ag-Grid.
            </li>
            <li><b>Promote all Frameworks:</b> The grid is agnostic. However I want to put work towards making it
            clear it works with React and anything else. If any 'glue' logic is required to make the grid
            work better with any framework then I will do this also. If any documentation is required to help
            use the grid in these new ways, I will try to provide that also.</li>
            <li><b>Support:</b> Continue to support the grid where I can.</li>
            <li><b>Greatly Enhance:</b> Take ag-Grid to the next level. Once the core features are in, I'll then
            work on it more, bringing the grid places where no grid has gone before.</li>
        </ul>
        </p>

        <h3>Making a Living</h3>

        <p>
            The problem with all the above is I now have no job! So that's where I need to make some hard decisions.
            ag-Grid is open source and free and I will never change that. Changing would break the trust of those
            who have used the grid to this point and helped create the community which the grid currently enjoys.
        </p>
        <p>
            So I'm considering the following items for making money:
        <ul class="content">
            <li>
                <b>Paid support:</b> Each day I'm now spending approx 2 hours helping people on the forum. This does
                not include the time I spend implementing features that people influence me towards implementing.
                I am considering a nominal fee for access to the forum - or to leave the
                forum as it currently stands and create a new forum where I will frequent the new one, but leave
                the old one should the community wish to help each other. It's fine allowing the whole
                world download ag-Grid and use as that doesn't take my time. But if you're asking me questions,
                that does take from my time.
            </li>
            <li>
                <b>Enterprise Features:</b> I will continue to give the grid away for free. However do you work
                in an industry where 'extra non-core features would make a huge difference'?? If yes
                then please let me know. Maybe I can provide an enterprise version of the grid.
            </li>
            <li>
                <b>Sponsorship:</b> If you are in a position to sponsor me, please get in touch and let's discuss
                how this would work for both of us.
            </li>
        </ul>
        </p>

        <p>
            There is a donate button on the ag-Grid website and I have received some smaller donations (to put it into perspective,
            one day contracting in London, which I used to do, pays more than all my donations put together). However I
            feel it's probably hard for people to get their company to donate (ie give charity), maybe paid support
            is something easier to expense??
        </p>

        <p>
            So with all the above, I'm eager to get feedback. Should ag-Grid be turned into a proper full time project
            from which I can live and continue to flourish? Or shall I need to go back to a day job to pay the bills and
            have the only way for ag-Grid to develop is to organise an online community of contributors. I'm looking
            forward to your comments below.
        </p>

        <div style="margin-top: 20px;">
            <a href="https://twitter.com/share" class="twitter-share-button" data-url="https://www.ag-grid.com/ag-grid-in-2016/" data-text="Stepping it Up, ag-Grid Focuses on Agnostic in 2016" data-via="ceolter" data-size="large">Tweet</a>
            <script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');</script>
        </div>

    </div>
<?php include '../blog-authors/niall.php' ?>
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

<?php
include('../includes/mediaFooter.php');
?>
