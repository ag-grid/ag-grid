<!DOCTYPE html>
<html>
<head lang="en">
    <meta charset="UTF-8">

    <title>ag-Grid Support</title>
    <meta name="description" content="ag-Grid comes either as free or as Enterprise with support. This page explains the different support models for the free and Enterprise versions of ag-Grid.">
    <meta name="keywords" content="ag-Grid Javascript Grid Support"/>

    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- Bootstrap -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap-theme.min.css">

    <link rel="stylesheet" type="text/css" href="/style.css">

    <link rel="shortcut icon" href="https://www.ag-grid.com/favicon.ico" />

</head>

<body ng-app="index" class="big-text">

<?php $navKey = "about"; include 'includes/navbar.php'; ?>

<?php $headerTitle = "About"; include 'includes/headerRow.php'; ?>


<div class="container">

    <div class="row">

        <div class="col-md-12">

            <div class="PageContent">
                <p class="PageContent-intro">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                <h3 id="team" class="head text-center">Meet The Team</h3>
                <div class="row">
                    <div class="col-md-4 col-sm-4">                         
                        <div class="teamWrapper teamWrapper-1 text-center">
                            <div class="teamWrapper-img">
                                <img src="images/team_TEST.jpg" class="circle img-responsive"> 
                                <span class="teamWrapper-mulitplyEffect teamWrapper-mulitplyEffect-1 circle"></span>
                            </div>
                            <div class="teamWrapper-desc">
                                <h3>Niall</h3>
                                <h5> <strong> Software Engineer &amp; ag-Grid founder</strong></h5>
                                <p>
                                    Pellentesque elementum dapibus convallis. 
                                    Vivamus eget finibus massa.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4 col-sm-4">                 
                        <div class="teamWrapper teamWrapper-2 text-center">
                            <div class="teamWrapper-img">
                                <img src="images/team_TEST2.jpg" class="circle img-responsive"> 
                                <span class="teamWrapper-mulitplyEffect teamWrapper-mulitplyEffect-2 circle"></span>
                            </div>
                            <div class="teamWrapper-desc">
                               <h3>Sean</h3>
                                <h5><strong> Software Engineer </strong></h5>
                                <p>
                                    Pellentesque elementum dapibus convallis. 
                                    Vivamus eget finibus massa.
                                </p>
                            </div>
                         </div>
                    </div>
                    <div class="col-md-4 col-sm-4">
                        <div class="teamWrapper teamWrapper-3 text-center">
                            <div class="teamWrapper-img">
                                <img src="images/team_TEST3.jpg" class="circle img-responsive"> 
                                <span class="teamWrapper-mulitplyEffect teamWrapper-mulitplyEffect-3 circle"></span>
                            </div>
                            <div class="teamWrapper-desc">
                               <h3>Will</h3>
                                <h5><strong>Frontend Developer </strong></h5>
                                <p>
                                    Pellentesque elementum dapibus convallis. 
                                    Vivamus eget finibus massa.
                                </p>
                            </div>
                         </div>
                    </div>
                </div>

            </div>

        </div> <!-- end col -->

    </div> <!-- end row -->

</div>

<?php include("includes/footer.php"); ?>

<script inline src="/dist/frontend/team.js"></script>

</body>

<?php include_once("includes/analytics.php"); ?>

</html>