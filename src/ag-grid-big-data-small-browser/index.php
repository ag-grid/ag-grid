<?php

$pageTitle = "JavaScript Big Data in a Small Browser";
$pageDescription = "A story on how the browser is limited to how much memory it can use, and how ag-Grid challenges the problem.";
$pageKeyboards = "big data javascript browser";

include('../includes/mediaHeader.php');
?>

<div class="row">
    <div class="col-md-12" style="padding-top: 20px; padding-bottom: 20px;">
        <h2>JavaScript Big Data in a Small Browser</h2>
    </div>
</div>

<div class="row">
    <div class="col-md-9">

        <p>
            While creating ag-Grid, the best grid in the world, I desired a JavaScript
            datagrid that could navigate and manage big data in a way that had never been done before.
            Before tackling the big data problem, I solved the small data problem, to make ag-Grid better than
            all the other grids doing what they did. But I wanted more. This post explains the
            challenges I had with big data and how the latest version of ag-Grid brings to the table something
            previously undone in any JavaScript datagrid or even library.
        </p>

        <h4>The Problem</h4>

        <p>
            Browsers are not designed for working with large amounts of data. They are intended to surf the
            web and have a hard limit on the amount of memory a particular web page can consume. I tested
            this limit by seeing how many simple JavaScript data records I could create before
            the Chrome browser gave up. I found the safest amount of data I could work with in Chrome was
            100,000 records with 22 attributes each (data for a grid with 100,000 rows and 22 columns).
            If I went much higher than that, Chrome goes 'snap, something went wrong'. What went wrong is it reached
            the limit of memory it was prepared to assign to one single web page.
        </p>

        <p>
            This hard limit on memory by Chrome and other browsers is done for a reason. It is to stop
            malicious web pages from over consuming your computers memory, which could be utilised as a malicious
            attack on your system. So this limit on memory is just a fact of life we have to deal with,
            even if we are writing SPA's that work with large amounts of data, something many enterprise applications
            wish to do.
        </p>

        <p>
            One thing I really wanted to do was allow the user to slice and dice the data on the fly by dragging
            columns to the top of the grid for grouping and have aggregations (such as summing fields).
            To be able to group the data on the fly is something enterprise users like to do.
            When all the data is in the browser, grouping and aggregating like this can be do in the browser.
            But when the data doesn't fit in the browser, something else needs to be done...
        </p>

        <h3>Old School Pagination</h3>

        <p>
            One obvious way to deal with managing data is to use pagination, to bring back data one page at a time
            from the server. This will work, but I don't want the end users having to hit 'next' tons of times to get
            to the data that they want. I wanted something more modern...
        </p>

        <h3>'Facebook Like' Infinite Scrolling</h3>

        <p>
            The next step was for infinite scrolling, where rows are only loaded as the user scrolls down, similar
            to the famous Facebook feed, the more you scroll the more gets loaded. This technique works with loading rows
            in a grid, but is only much use
            to the user if the data they want is towards the top of the list. What we really want is a way to allow
            the user to group the data on the fly, as grouped data can be navigated more easily, while still allowing
            the user to lazy load the data as they scroll down...
        </p>

        <h3>Bringing Something New</h3>

        <p>
            And that is the basis of the new 'Enterprise Row Model' in ag-Grid. It allows the user to dynamically group
            big data. The user is
            given the interface to navigate what it believes is a very large set of data loaded into the browser
            using infinite scrolling.
            As the user scrolls down, more rows are loaded seamlessly. The user can then use the grid UI to group
            and aggregate the data which the grid appears to all do in browser memory. The grid sends
            the group information to the server and then reads back the top level groups first for display in the grid.
            As the user opens a group, the children of the group are loaded. All of these loads (both group and child
            levels) are done using infinite scrolling so each individual level of the group tree can be incredibly large.
        </p>

        <h3>You Did What?</h3>

        <p>
            I developed a way to allow JavaScript applications to slice and dice big data as if the data was residing
            all inside the browser memory from a user experience point of view. What was once a memory restriction in
            the browser is now turned around, by allowing the same experience but keeping most of the data on the
            server.
        </p>

        <h3>What Does It Mean?</h3>
        <p>
            SPA's are all the rage, and big data is also
            all the rage, so crossing these two has got to be a rage waiting to happen? Well ag-Grid is ready.
            Now that the tool exists, I'm excited to see what applications ag-Grid users come up with.
        </p>


        <div style="margin-top: 20px;">
            <a href="https://twitter.com/share" class="twitter-share-button" data-url="https://www.ag-grid.com/ag-grid-angular-connect-2016/"
               data-text="We're Gonna Need a Bigger Boat - ag-Grid Sponsors Angular Connect 2016" data-via="ceolter" data-size="large">Tweet</a>
            <script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');</script>
        </div>

    </div>
    <div class="col-md-3">

        <img src="../images/ag-Grid2-200.png" style="display: inline-block; padding-bottom: 20px;"/>

        <div>
            <a href="https://twitter.com/share" class="twitter-share-button" data-url="https://www.ag-grid.com/ag-grid-angular-connect-2016/"
               data-text="We're Gonna Need a Bigger Boat - ag-Grid Sponsors Angular Connect 2016" data-via="ceolter" data-size="large">Tweet</a>
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
                Founder, Technical Lead and CEO of ag-Grid LTD.
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
