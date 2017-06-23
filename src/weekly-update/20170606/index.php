<?php

$pageTitle = "ag-Grid Weekly Update";
$pageDescription = "This our regular update from ag-Grid. We'll run through what we are working on and what you can expect to be seeing soon!";
$pageKeyboards = "blogs ag-grid angular react webpack";

include('../../includes/mediaHeader.php');
?>

<style>
    .weekly-news-paragraph {
        color: #767676;
        padding-bottom: 20px;
    }
    .weekly-news-paragraph-title {
        font-weight: bold;
        color: #767676;
        padding-bottom: 5px;
    }
    .weekly-news-section {
        overflow: hidden;
        border: 1px solid darkgrey;
        background-color: #eee;
        padding: 10px;
        margin: 30px 5px 5px 5px;
    }
    .weekly-news-title {
        font-size: 20px;
        color: #167ac6;
        float: left;
        padding-bottom: 10px;
    }
    .weekly-news-sub-title {
        float: right;
        color: #767676;
    }
    .weekly-news-image-right {
        margin-left: 10px;
        margin-bottom: 10px;
        font-size: 14px;
        font-style: italic;
        float: right;
        width: 400px;
    }
</style>

<div class="weekly-news-section">
    View the <a href="../">full list of weekly updates</a> to see other progress reports.
</div>

<div class="weekly-news-section">

    <div style="overflow: hidden;">
        <div class="weekly-news-title">
            The First Weekly Update
        </div>
        <div class="weekly-news-sub-title">
            Niall Crosby, 6th June 2017
        </div>
    </div>

    <div class="weekly-news-paragraph">
        This is the first weekly update, I want to let people know how we are getting on, how the company
        is growing and what we are planning to do. I hope this gives an insight into how the ag-Grid
        project is progressing. This is the first update so there is quite a lot to catch up on!
    </div>

    <div class="weekly-news-paragraph-title">Growing Customers & Usage</div>

    <div class="weekly-news-paragraph">
        We continue to grow our customer base and have just signed our 700th customer of ag-Grid Enterprise. In addition, we saw nearly 50,000 monthly downloads of ag-Grid Free
        from NPM in May.
    </div>

    <div class="weekly-news-paragraph-title">Robert Clarke joins the team</div>

    <div class="weekly-news-paragraph">
        I'd like to welcome Rob to the team. Rob has worked with me on many
        projects - we just counted, this is the sixth time I am his boss!. Along with Alberto and Sean, he is one of the best developers
        I know. His expertise spans JavaScript, Java, Scala, databases and more. This brings our developer
        count to four, all very experienced with 15 to 20 years in enterprise software.
        Once everyone gets up to speed, it is going to be a serious A-Team and we are very excited about what we can deliver.
    </div>

    <div class="weekly-news-paragraph-title">Conferences & International Visits</div>

    <div class="weekly-news-image-right">
        <img src="./images/ng-Conf.jpg" style="width: 100%;"/>
        <br/>
        Niall speaking at ng-Conf
    </div>

    <div class="weekly-news-paragraph">
        Conferences and other international visits take time!
        This year we have been to ng-Vikings (Denmark), ng-Conf (Utah - USA), Benzinga Fintech Awards
        (New York), Dublin Angular meet-up (Ireland)
        as well as visiting many of our investment bank clients in London and New York.
        We are also getting involved in the local London meet-up community.
        The only other conference we have
        signed up to so far this year is Angular Connect (London) later this year. These international conferences
        and visits take dev time from us. So we plan no international visits for the coming months as the new
        team gets it's head down and dev productivity up.
    </div>

    <div class="weekly-news-paragraph-title">Next Release</div>

    <div class="weekly-news-paragraph">
        We plan to release 7th June with some exciting features. That's our target - however we don't rush
        things, so this may slip if we are not ready.
    </div>

    <div class="weekly-news-paragraph-title">Better Add, Update and Refresh</div>

    <div class="weekly-news-paragraph">
        We have revamped updating and refreshing
        data inside the grid. The grid will handle delta changes to data better (adding, removing and updating
        rows) and will also seamlessly work with immutable data stores like Redux. This will be in this weeks release.
    </div>

    <div class="weekly-news-paragraph-title">Accessibility / ARIA</div>

    <div class="weekly-news-paragraph">
        We have started work on making the grid accessible and are focusing on ARIA roles. In an upcoming release,
        you can expect ARIA HTML attributes to be included in the grid. We just started it last week, a first
        iteration will be in a upcoming release (approx one week from now).
    </div>

    <div class="weekly-news-paragraph-title">Better Documentation</div>

    <div class="weekly-news-paragraph">
        Every time we look at our docs, we think it can be done much better! Our current effort is around 'Getting
        Started'. As the grid grows in complexity, it becomes more daunting to new users. We are also showing
        React more love. We support React in the same way that we support Angular however this was not reflected in our docs.
        About 40% of our users are on Angular, with about 30% on React,
        so React is very important to us. We want to make sure you know this so are making the effort to bring
        React on par in our documentation.
    </div>

    <div class="weekly-news-paragraph-title">New Office</div>

    <div class="weekly-news-image-right">
        <img src="./images/newOffice.jpg" style="width: 100%;"/>
        <br/>
        The new ag-Grid office (note to self: must take another pic without our gym towels everywhere!)
    </div>

    <div class="weekly-news-paragraph">
        We moved into a new office last week, with space for 10 desks! We plan to have 9 people in the team
        by the end of the summer. Currently we have 5. We will announce the changes in upcoming updates.
    </div>

    <div class="weekly-news-paragraph-title">webpack Partnership</div>

    <div class="weekly-news-paragraph">
        In case you missed it, <a href="../ag-grid-partners-with-webpack/">webpack and ag-Grid are now partners</a>.
        This is part of our corporate social responsibility, helping an open source project that we believe to
        be solving a problem for the greater good.
    </div>

    <div class="weekly-news-paragraph-title">Upcoming Features</div>

    <div class="weekly-news-paragraph">
        Now that the <a href="../javascript-grid-enterprise-model/">Enterprise Row Model</a> is out,
        that has freed us from heavy dev work. Our plan is to now
        hit the issues list very hard - to make a big impact on issues that people have been waiting on.
    </div>

    <div class="weekly-news-paragraph">
        And that's it. I hope this update was useful. I will try my best to come back next week and give
        another update.
    </div>

    <div class="weekly-news-paragraph">
        PS. John is leading on the coffee purchasing... Stay tuned.
    </div>

</div>

<?php include_once("../../includes/footer.php"); ?>

</body>

<?php include_once("../../includes/analytics.php"); ?>

</html>
