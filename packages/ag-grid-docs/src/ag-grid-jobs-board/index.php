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
                <h4>Javascript Developer</h4>
                <p class="lead">London, UK.</p>

                <p> <b>What we offer</b> </p>

                <ul class="content">
                    <li>Excellent opportunity to join a new leading company in the market</li>
                    <li>Flat hierarchy no BS</li>
                    <li>You will have the opportunity to be a key member of the company</li>
                    <li>We work with ALL frameworks, so it's up to you to decide where you want to become an expert</li>
                    <li>We are huge in the community, we sponsor 10+ conferences and we give talks, you could become a speaker for ag-Grid or represent the company in conferences</li>
                    <li>You will learn how to build Enterprise-grade software that handles the sort of requirements that only 1% of the programmers know how to deal with</li>
                    <li>Competitive salary
                </ul>

                <p> <b>What we are looking for</b> </p>

                <ul class="content">
                    <li>Developer with 2-3 years experience looking to be given the opportunity to grow.</li>
                    <li>Strong on core computer science abstract topics. In ag-Grid you will have to learn about low level performance optimisations, complex algorithms, software patterns...</li>
                    <li>Passionate about software. You will be asked to come up with your own ideas and approaches to improve the product</li>
                </ul>

                <p><b>Where you will start from</b></p>

                <ul class="content">
                    <li>Helping us build a knowledge base, doing so, you will be creating complex grids with graphs, charts.</li>
                    <li>Fixing bugs and taking ownership of the smaller feature requests</li>
                    <li>Helping us in conferences either by becoming a speaker or by representing ag-Grid as an sponsor</li>
                </ul>

                <p><b>What you need to have</b></p>

                <ul class="content">
                    <li>You need to be able to work from London
                    <li>You need to know Javascript (2 years experience)
                    <li>You DON'T need to know about other technologies that we use in ag-Grid, but it is a plus if you have some experience in: <ul>
                        <li>Typescript</li>
                        <li>Angular</li>
                        <li>React</li>
                        <li>Vue</li>
                        <li>Aurelia</li>
                        <li>Polymer</li>
                        <li>npm</li>
                        <li>Webpack</li>
                        </ul>
                    </li>
                    <li>You must be strong on core computer science, you should be answer with confidence questions like: <ul>
                        <li>How would you model a tree?</li>
                        <li>How would you write an algorithm that walks a tree?</li>
                        <li>Can you create your own publish/subscriber model?</li>
                        <li>What is the difference between object oriented programming and functional programming?</li>
                    </ul>
                    </li>
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
