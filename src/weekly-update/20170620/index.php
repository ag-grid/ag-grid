<?php

$pageTitle = "ag-Grid Weekly Update 20th June 2017";
$pageDescription = "ag-Grid Weekly Update 20th June 2017";
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
            Preparing for Next Release, New Team Members Settling In
        </div>
        <div class="weekly-news-sub-title">
            Niall Crosby, 20th June 2017
        </div>
    </div>

    <div class="weekly-news-paragraph">
        A really hot week here in London, our AC has been on full blast but we have kept up the momentum in preparation for our new release.
    </div>

    <div class="weekly-news-image-right">
        <img src="./images/DevTeam.png" style="width: 100%;"/>
        <br/>
        The team hard at work - John hasn't even changed his t-shirt.
    </div>

    <div class="weekly-news-paragraph-title">New Joiners Settling In</div>

    <div class="weekly-news-paragraph">
        Bas and Dimple have settled in nicely and many of you may have heard from them during the past week. 
        They are always available at accounts@ag-grid.com to help with queries about the grid. They will also be
        heading up our social media presence which we will be expanding in the coming weeks. We always love to hear from
        our users so please get in touch. 
    </div>

    <div class="weekly-news-paragraph-title">Changes to the Logic for Groups</div>

    <div class="weekly-news-paragraph">
        We realised that our logic for groups had shortcomings so have refactored how groups are configured. 
        This will get rid of a lot of issues we were facing with sorting, filtering, clipboard and export. We expect that 
        this new design will clean up a lot of issues.
    </div>

    <div class="weekly-news-paragraph-title">JIRA Update</div>

    <div class="weekly-news-paragraph">
        We have knocked over another 11 JIRAs so the countdown continues - we are down to 149 in the "For Development" category. 
        Full details will be available in our Changelog following the release.
    </div>

    <div class="weekly-news-paragraph-title">New Feature: Pivot Total Columns</div>

    <div class="weekly-news-paragraph">
        Robert has been working hard on his first new feature which is Pivot Total Columns. This feature
    </div>


    <div class="weekly-news-paragraph-title">Accessibility</div>

    <div class="weekly-news-paragraph">
        Robert is also continuing his work on Accessibility, we will have this ready for the release and will be looking for your feedback.
    </div>

    <div class="weekly-news-paragraph-title">Improved Getting Started</div>

    <div class="weekly-news-paragraph">
        Sean is continuing his work on improving our documentation. This week will see further improvment to our React documentation
        as well as RxJS examples both in JavaScript and Angular.
    </div>

    <div class="weekly-news-paragraph-title">Next Release</div>

    <div class="weekly-news-paragraph">
        We are still planning a release 23rd June with all the above.
    </div>

</div>

<?php include_once("../../includes/footer.php"); ?>

</body>

<?php include_once("../../includes/analytics.php"); ?>

</html>
