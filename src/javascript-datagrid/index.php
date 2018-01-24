<?php

$pageTitle = "ag-Grid Blog: 8 Things to Know in picking a JavaScript DataGrid";
$pageDescription = "We run through the major things you have to watch out for when picking the right datagrid for your JavaScript application. Be it React or Angular, we've listed the 8 most important.";
$pageKeyboards = "Choosing JavaScript DataGrid";

include('../includes/mediaHeader.php');
?>

        <h1>8 reasons to choose ag-Grid as your JavaScript Datagrid</h1>
<p class="blog-author">Sean Landsman | 27th October 2016</p>
<div class="row">
    <div class="col-md-8">

        <p>
            Now that we have done many conferences, we clearly understand why our users choose ag-Grid over the competition.
            This article explains the main reasons why ag-Grid is becoming the leading JavaScript datagrid.
        </p>

        <h3>1. The 'ag' in ag-Grid stands for AGnostic</h3>

        <p>
            ag-Grid has zero dependencies such as Angular or React,
            we don't even use JQuery, Underscore or LoDash. The foundations of ag-Grid is a custom made framework 
            designed specifically for ag-Grid. Having no dependency means
            ag-Grid will work with any framework - we call this framework agnostic.
        </p>

        <p>
            Being framework agnostic allows you to choose your framework and datagrid separately. It also reduces the work
            required when you move frameworks (e.g. moving from Angular 1 to Angular, VueJS or React to Aurelia etc.).
        </p>

        <p>
            If you choose a datagrid that is not framework agnostic (e.g. written using Angular) then you have locked
            into that framework. If you select a datagrid you should not be locked into a framework.
        </p>

        <p>We are not aware of any other datagrid that is agnostic like ag-Grid.</p>

        <h3>2. Enterprise Foundations</h3>

        <p>
            The authors of ag-Grid come with years of delivering reporting and data warehousing solutions to
            investment banks and telecommunications companies. We are not traditional web
            developers, our skills are not creating consumer facing websites, but enterprise applications.
            We understand data and how to best manage it.
        </p>

        <p>
            Pretty much all other JavaScript datagrids start off solving a particular problem (e.g. filters and sorting,
            or a pivot table) but then fail to scale. The designs are not extensible to the complex requirements of a datagrid.
        </p>

        <p>
            ag-Grid's solid design allows it to manage a) the core features of a datagrid and b) items which
            do not exist in other grids e.g. pivoting. ag-Grid does the standard features better and then
            takes if further with advanced features not seen in other datagrids.
        </p>

        <p>We are not aware of any other datagrid that manages complexity like ag-Grid.</p>

        <h3>3. Integrating, not Wrapping</h3>

        <p>
            ag-Grid integrates with frameworks such as Angular and React. That means ag-Grid is not only available
            as a React or Angular 1 / 2 component, it also allows you to use React and Angular 1 / 2 inside
            ag-Grid for custom cell rendering.
        </p>

        <p>We are not aware of any other grid component that allows you to select from any of these frameworks inside the grid while staying agnostic.</p>

        <h3>4. Features Above and Beyond</h3>

        <p>
            ag-Grid gives for free what other grids are charging for. There is no reason to
            buy another datagrid. The enterprise version of ag-Grid contains features that go above and beyond other
            datagrids on the market.
        </p>

        <p>We are not aware of any other grid that provides the same level of enterprise features as ag-Grid.</p>

        <h3>5. Open Source</h3>

        <p>
            Both ag-Grid and ag-Grid-Enterprise are open source - ag-Grid is free, ag-Grid Enterprise requires
            a license. Both sets of code are available on Github where you can see the code and raise
            issues and pull requests. The open source nature allows the community to advise the ag-Grid
            team and act as code reviewers. A closed source project does not have the same
            community support.
        </p>

        <p>We are not aware of any other commercial datagrid that offers its code as open source on Github.</p>

        <h3>6. Free and Commercial</h3>

        <p>
            ag-Grid has both free and commercial versions. This allows everyone to benefit from ag-Grid
            even if their budget is limited. The commercial version funds the growth of the project.
            This guarantees the ag-Grid project will continue while
            also providing the best standard JavaScript datagrid for free.
        </p>

        <h3>7. Pure Open Source is Risky</h3>

        <p>
            Purely open source projects come with no support or warranty. They also run a greater risk
            of discontinuing as the developers find other ways to spend their free time. If you are using
            an open source datagrid that is not owned by a recognised company, it runs the risk of losing
            developer support and becoming stale and unsupported.
        </p>

        <p>ag-Grid has an office, revenue and employees. Keeping ag-Grid alive is our job.</p>

        <h3>8. You Aint' Seen Nothing Yet</h3>

        <p>
            ag-Grid is new on the market. We have already surpassed all the competition. This is just the start.
            In the coming months and years you can expect ag-Grid to march
            forward and go to places no JavaScript datagrid has gone before
            - all while the other datagrids struggle to catch up.
        </p>

        <div style="margin-top: 20px;">
            <a href="https://twitter.com/share" class="twitter-share-button" data-url="https://www.ag-grid.com/javascript-datagrid/"
               data-text="8 reasons to choose ag-Grid as your JavaScript Datagrid" data-via="ceolter" data-size="large">Tweet</a>
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
