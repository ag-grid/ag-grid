<?php
$navKey = "about";
include_once '../includes/html-helpers.php';
gtm_data_layer('jobs');
?>
<!DOCTYPE html>
<html lang="en">
<head lang="en">
<?php
$socialUrl = "https://www.ag-grid.com/ag-grid-jobs-board/";
$socialImage = "https://www.ag-grid.com/ag-grid-jobs-board/images/jobs_board.png";

meta_and_links("Current Opportunities at ag-Grid", "ag-Grid jobs", "We are looking for the best and the brightest to join us on our mission to create the best datagrid in the world. This page lists our current opportunities. We are always looking for JavaScript Developers.", false);
?>
<link rel="stylesheet" href="../dist/homepage.css">
</head>
<body>
<header id="nav" class="compact">
<?php 
    $version = 'latest';
    include '../includes/navbar.php';
?>
</header>

<div class="info-page">
    <div class="row">
        <div class="col-md-12">

            <h1>Working at ag-Grid</h1>

            <p>
            ag-Grid is used by thousands of banks, insurance companies, government agencies and blue chip software companies all over the world. Our customers rely on us to be experts in our field of data grids and integration with various frameworks. Following a very succesful introduction to the market in March 2016, we are rapidly expanding into 2018 to challenge the market with our superior product. As a provider of a leading software library, we stay ahead of the curve and are experts in JavaScript and associated libraries such as Angular, React, Vue, Aurelia and Web Components.
            </p>

            <h4>Life at ag-Grid</h4>
            <p>
            We are a young successful start-up where you will experience our growth from small to very big. The current development team
            have a background building enterprise applications with extensive experience using Java, C# and C++. There are plenty of opportunities 
            to learn from experienced team members. We now would like to grow our team with people at all levels of experience. Our culture is 
            friendly and relaxed with an emphasis on continuing to deliver our world leading product, customer support and service level.
            </p>
            <p>
            <h4>Perks of Working with us:</h4>
            </p>
                <ul class="content">
                    <li>Thriving young company that is self-funded.</li>
                    <li>Work with the latest front end technologies.</li>
                    <li>Excellent software practices, no corporate baggage.</li>
                    <li>Travel to and represent ag-Grid at international conferences.</li>
                    <li>Experience a company grow from a few people to world domination.</li>
                </ul>
        </div>  

        <div class="job">
            <div class="col-md-12">
                <h3>Current Opportunities</h3>
                <h4> JavaScript Support Engineer</h4>
                <p class="lead">London, UK.</p>

                <p>
                    ag-Grid has over 1,000 customers that require assistance using ag-Grid. As a JavaScript Support Engineer, you will become expert in ag-Grid and associated JavaScript libraries (React, Angular etc.) to ensure customers with queries are assisted. You will create and improve our documentation and video content to ensure our customers are well educated about our product. Through this role, you will be dealing directly with the development teams of the world's largest companies while also keeping up to date with current JavaScript frameworks and emerging technologies.
                </p>
                <p> <b>Responsibilities of Role</b> </p>

                <ul class="content">
                    <li>Become expert in ag-Grid and JavaScript frameworks such as Angular and React.</li>
                    <li>Address customer issues with ag-Grid, both standalone, and with frameworks such as Angular and React.</li>
                    <li>Stay up to date on latest JavaScript framework changes.</li>
                    <li>Improve our learning resources for our customers.</li>
                    <li>Become actively involved in strategies to deliver better customer support.</li>
                </ul>

                <p><b>Skills</b></p>

                <ul class="content">
                    <li>Experience with JavaScript.</li>
                    <li>Experience with frameworks such as Angular and React desirable.</li>
                    <li>Experience with JavaScript grid libraries desirable.</li>
                    <li>Excellent communication skills.</li>
                    <li>Excellent problem solving skills.</li>
                </ul>
                
                <h3>How to Apply</h3>
                <p>
                If you think this sounds like the place for you, please send your CV to <a href="mailto:info@ag-grid.com">info@ag-grid.com</a>.
                </p>
            </div>
        </div>
    </div>
</div>

<?php include_once("../includes/footer.php"); ?>
<?php include_once("../includes/analytics.php"); ?>
</body>
</html>
