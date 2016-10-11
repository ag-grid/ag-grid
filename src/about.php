<!DOCTYPE html>
<html>
<head lang="en">
    <meta charset="UTF-8">

    <title>ag-Grid About</title>
    <meta name="description" content="ag-Grid comes either as free or as Enterprise with support. This page explains the different support models for the free and Enterprise versions of ag-Grid.">
    <meta name="keywords" content="ag-Grid Javascript Grid About"/>

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

        <div class="col-md-12" style="padding-top: 40px;">

            <h3>
                Company
            </h3>
            <p>
                ag-Grid is a Private Limited Company registered in the United Kingdom. The company is based
                out of the Techhub @ Campus incubation center in London.
            </p>
            <p>
            <style>
                td {
                    padding: 10px;;
                }
            </style>
                <table>
                <tr>
                    <td valign="top"><b>Address</b></td>
                    <td>
                        Techhub @ Campus,<br/>
                        4-5 Bonhill Street,<br/>
                        London,<br/>
                        England,<br/>
                        EC2A 4BX
                    </td>
                </tr>
                <tr>
                    <td valign="top"><b>Company Number</b></td>
                    <td>
                        07318192
                    </td>
                </tr>
                <tr>
                    <td valign="top"><b>VAT Number</b></td>
                    <td>
                        GB 998360167
                    </td>
                </tr>
                <tr>
                    <td>
                        <a href="https://beta.companieshouse.gov.uk/company/07318192">UK Companies House</a>
                    </td>
                </tr>
                <tr>
                    <td>
                        <a href="https://london.techhub.com/">Techhub @ Campus</a>
                    </td>
                </tr>
                </table>
                <br/>
            </p>
        </div> <!-- end col -->

        <div class="col-md-12" style="padding-top: 40px;">

            <h3 id="team">
                Team
            </h3>
            <p>
                The team is passionate about great products and great software. They are experienced
                delivering quality software and continue to do so with the ag-Grid project taking
                lessons learnt over the past 20 years in software
                development and applying those principles to JavaScript.
            </p>

        </div> <!-- end col -->

        <div class="col-md-4">
            <div>
                <img src='images/niall.png'/>
            </div>
            <h3>Niall Crosby</h3>
            <h4>Founder</h4>
            <p>
                Niall has 17 years leading greenfield software projects in Telecommunications, Government, Insurance
                and most recently Investment Banking. Oracle and Java used to be his bread and butter but is now
                focusing on front end JavaScript, bringing his skill and knowledge from previous domains to the
                emerging JavaScript platform.
            </p>
        </div>

        <div class="col-md-4">
            <div>
                <img src='images/sean.png'/>
            </div>
            <h3>Sean Landsman</h3>
            <h4>Lead Developer</h4>
            <p>
                Sean is an experienced full stack technical lead with an extensive background in enterprise solutions. Over
                19 years in the industry has taught him the value of quality code and good team collaboration. The bulk
                of his background is on the server side, but like Niall is increasingly switching focus to include front end
                technologies.
            </p>
        </div>

        <div class="col-md-4">
            <div>
                <img src='images/will.png'/>
            </div>
            <h3>Will Halling</h3>
            <h4>UI Developer</h4>
            <p>
                Will has over ten years experience working with Front End technologies. Will has worked on various
                high-profile projects in the Banking, Travel, Government and Advertisement sectors. He understands
                the importance of developing industry-leading responsive user interfaces.
            </p>
        </div>
    </div> <!-- end row -->
</div>




<!--<div class="PageContent">
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

</div>-->


<?php include("includes/footer.php"); ?>

</body>

<?php include_once("includes/analytics.php"); ?>

</html>