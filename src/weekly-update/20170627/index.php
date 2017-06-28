<?php

$pageTitle = "ag-Grid Weekly Update 28th June 2017";
$pageDescription = "ag-Grid Weekly Update 28th June 2017";
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
            Version 11 Released - OpenFin Integration - More JIRAs
        </div>
        <div class="weekly-news-sub-title">
            Customer Experience Team, 28th June 2017
        </div>
    </div>

    <div class="weekly-news-paragraph">
        The week started on a good note with Version 11 of ag-Grid going out the door. There's plenty more to come as we update you on the team's focus for this week.
    </div>

    <div class="weekly-news-paragraph-title">Version 11 Released</div>

    <div class="weekly-news-paragraph">
    Version 11 was released yesterday, make sure you sign up for release notes if you don't get our emails. Please see our <a href="../change-log/changeLogIndex.php">Change Log</a> for more information.
    </div>

    <div class="weekly-news-image-right">
        <img src="./images/MergeCells.png" style="width: 100%;"/>
        <br/>
        Column Spanning/Merge Cells - coming in the next release
    </div>

    <div class="weekly-news-paragraph-title">New Features: colSpan and User Defined Column Types</div>

    <div class="weekly-news-paragraph">
        Those of you who follow us on Twitter will have seen that Niall has completed work on a new feature called colSpan - also known as Merge Cells. We know that many of you have been looking for this so
        this should be a welcome feature in our next release.

        Robert is working on adding the ability to specify User Defined Column Types which will simplify column definitions.
    </div>

    <div class="weekly-news-paragraph-title">JIRA Update</div>

    <div class="weekly-news-paragraph">
        We have knocked over more JIRAs so the countdown continues - we are down to 142 at this stage - we did add a few as well. This remains the focus of the core team for this week.
    </div>

    <div class="weekly-news-paragraph-title">GitHub Stars</div>

    <div class="weekly-news-paragraph">
        We just reached 2,900 GitHub stars. This is really important for us as it helps new users to find us and pushes the growth of ag-Grid. If you haven't already, please give us a GitHub star. Thanks.
    </div>

    <div class="weekly-news-paragraph-title">Accessibility</div>

    <div class="weekly-news-paragraph">
        Robert is continuing to add additional accessibility support based on user feedback from our first drop in v11.0. Please send your feedback to us for this important new feature in ag-Grid.
    </div>
    
    <div class="weekly-news-paragraph-title">ag-Grid and OpenFin</div>

    <div class="weekly-news-paragraph">
        Following on from his original example, Sean is working on another ag-Grid and OpenFin example that features tear-out functionality.
    </div>

    <div class="weekly-news-paragraph-title">New Documentation</div>

    <div class="weekly-news-paragraph">
        Niall has introduced valueSetters and valueParsers and rewrote the documentation pages for "Values and Formatters" and "Cell Expressions".
    </div>

    <div class="weekly-news-paragraph-title">Support for Web Components</div>

    <div class="weekly-news-paragraph">
        Following completion of the OpenFin example, Sean will be turning his attention to our support for Web Components. If you're using this, keep an eye out as it's getting an overhaul during the course of this week. Again, target is for our next release.
    </div>

    <div class="weekly-news-image-right">
        <img src="./images/SwearJar.jpeg" style="width: 70%;"/>
        <br/>
        The Swear Jar - already quite full!
    </div>
    
    <div class="weekly-news-paragraph-title">Update from the Customer Experience Team</div>

    <div class="weekly-news-paragraph">
    <p>Dimple and Bas have made their mark on the office, introducing a swear jar for the team and it’s rattling already! We’ve not decided on where the proceeds should go. If you have any suggestions, please let us know in the comments below. </p>

    <p>The team are also actively contacting clients about renewing ag-Grid so watch out for an email from Dimple.</p>

    <p>John is working on improving our website so you will notice changes over the coming week. We are putting a lot of effort into making our website more intuitive and making it easier to find the relevant content.</p>

    </div>

</div>

</body>

<?php include_once("../../includes/footer.php"); ?>

<?php include_once("../../includes/analytics.php"); ?>

</html>