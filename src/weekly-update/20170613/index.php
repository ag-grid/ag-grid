<?php

$pageTitle = "ag-Grid Weekly Update 13th June 2017";
$pageDescription = "ag-Grid Weekly Update 13th June 2017";
$pageKeyboards = "ag-Grid Weekly Update";

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
            More New Joiners, JIRA's Countdown, More New Dev
        </div>
        <div class="weekly-news-sub-title">
            Niall Crosby, 13th June 2017
        </div>
    </div>

    <div class="weekly-news-paragraph">
        Another week, settling into the new office, more new joiners, more dev work taken on board...
    </div>

    <div class="weekly-news-image-right">
        <img src="./images/NewJoiners.png" style="width: 100%;"/>
        <br/>
        Bas and Dimple getting shown the ropes by John
    </div>

    <div class="weekly-news-paragraph-title">New Joiners</div>

    <div class="weekly-news-paragraph">
        Welcome Bas Rahman and Dimple Unalkat to the team, bringing out teams size now to seven! Bas and
        Dimple will be helping John out on the customer side, helping build out the best customer experience
        we can, while allowing the developers to focus on developing as much possible.
    </div>

    <div class="weekly-news-paragraph-title">Last Weeks Release</div>

    <div class="weekly-news-paragraph">
        Last week we released version 10.1 which introduced delta updates, great for our React users.
        The release has been well received and all is working well.
    </div>

    <div class="weekly-news-paragraph-title">Hammering Through JIRA's</div>

    <div class="weekly-news-paragraph">
        Last week we completed a JIRA triage and have market 167 for development. We are now 10 down
        with 157 to go. Alberto and I are fixing all the critical issues and some high priority 'quick wins' first.
        In time, we will get through them all. Give us a few weeks!
    </div>

    <div class="weekly-news-paragraph-title">Accessibility</div>

    <div class="weekly-news-paragraph">
        Robert is busy with ARIA rules which are coming along nicely. Our next release will
        have a first pass where ARIA tags will be included in the DOM.
    </div>

    <div class="weekly-news-paragraph-title">Improved Getting Started</div>

    <div class="weekly-news-paragraph">
        Sean is busy on the frameworks and documentation side, making sure new uses to the grid get introduced
        to ag-Grid in as easiest way as possible. Our next release will have revamped 'Getting Started' sections,
        with particular attention given to React and Angular (2+).
    </div>

    <div class="weekly-news-paragraph-title">Next Release</div>

    <div class="weekly-news-paragraph">
        We are planning a release 23rd June with all the above.
    </div>




</div>

<?php include_once("../../includes/footer.php"); ?>

</body>

<?php include_once("../../includes/analytics.php"); ?>

</html>
