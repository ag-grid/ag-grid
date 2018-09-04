<?php 
$navKey = "about";
include_once 'includes/html-helpers.php';
gtm_data_layer('about');
?>
<!DOCTYPE html>
<html lang="en">
<head lang="en">
    <?php
meta_and_links("Our Mission, Our Principles and Our Team at ag-Grid", "About ag-Grid", "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. This is the story of ag-Grid and explains our mission, where we came from and who we are.", true);
?>
    <link rel="stylesheet" href="dist/homepage.css">
</head>

<body>
<header id="nav" class="compact">
    <?php
    $version = 'latest';
    include './includes/navbar.php';
?>
</header>

<div class="info-page">
    <br>
    <img src="images/agldnyc2.png" style="width: 100%">

    <div>
        <section>
            <p class="text-center">
            <h1 style="text-align: center;">
                ag-Grid Conf
            </h1>

            <div class="container">
                <div class="row">
                    <div class="col-sm" style="text-align: center;">
                        <h1>
                            London
                        </h1>
                        October 4th 2018
                        <br>
                        <a href="https://www.eventbrite.com/e/ag-grid-conf-london-tickets-49732217401" target="_blank">
                            <button type="button" class="btn btn-primary btn-lg">Register for London</button>
                        </a>
                    </div>
                    <div class="col-sm" style="font-size: 20px; text-align: center;">
                        Where CTO's, Senior Developers, Developer and Product Managers serious about JavaScript data
                        presentation
                        can learn more about ag-Grid and share their experiences with the ag-Grid team
                    </div>
                    <div class="col-sm" style="text-align: center" ;>
                        <h1>
                            New York
                        </h1>
                        October 10th 2018
                        <br>
                        <a href="https://www.eventbrite.com/e/ag-grid-conf-london-tickets-49732217401" target="_blank">
                            <button type="button" class="btn btn-primary btn-lg">Register for New York</button>
                        </a>
                    </div>
                </div>
            </div>

            <br>

            <h4 class="text-center">
                Limited spaces, register early
            </h4>
            <div>
            </div>
            <br>
            <div style="max-width: : 100%">
                <h2 class="text-center" style="background-color: whitesmoke;padding-top: 10px">
                    Speakers
                    </p>
                    <hr>
                </h2>

                <br>

                <div class="inline-container team" align="center">
                    <div class="row">

                        <div class="col-md-4">
                            <div>
                                <img src='images/team/niall.jpg' alt="Niall Crosby, CEO"/>
                            </div>
                            <h3>Niall Crosby</h3>
                            <h4>Founder, CEO & CTO, ag-Grid</h4>

                        </div>

                        <div class="col-md-4">
                            <div>
                                <img src='images/team/sean.jpg' alt="Sean Landsman, Lead Developer"/>
                            </div>
                            <h3>Sean Landsman</h3>
                            <h4>JavaScript Frameworks Guru, ag-Grid</h4>

                        </div>

                        <div class="col-md-4">
                            <div>
                                <img src='images/team/rob.jpg' alt="Alberto Gutierrez, Lead Developer"/>
                            </div>
                            <h3>Robert Clarke </h3>
                            <h4>Enterprise Applications Guru, ag-Grid</h4>

                        </div>
                    </div>
                    <br>
                    <hr>

                    <h2 class="text-center" style="background-color: whitesmoke;padding-top: 10px">
                        London Schedule
                    </h2>
                    <hr>

                    <style>
                        .talk-title {
                            font-weight: bold;
                            font-size: 14px;
                        }
                        .talk-description {
                        }
                    </style>

                    <table>
                        <tr>
                            <td>
                                14:00 - 15:00
                            </td>
                            <td>
                                <div class="talk-title">How ag-Grid Manages Complexity internally</div>
                                <div class="talk-description">How ag-Grid Manages Complexity internally</div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                15:00 - 16:00
                            </td>
                            <td>
                                <div class="talk-title">Big Data with the Server Side Row Model</div>
                                <div class="talk-description">Explaining when and how to use the server side row model</div>
                            </td>
                        </tr>
                    </table>

                    <div class="card">
                        <div class="card-body" style="background-color: #eaf7ff">
                            <h5 class="card-title">Technical look into ag-Grid's features with the Core team,
                                followed by a Q&A
                                <hr>
                            </h5>
                            <h6 class="card-subtitle mb-2 text-muted">Core Team<br>13:00 | 14:30</h6>
                            <p><font size="-0"></font>
                            </p>
                        </div>
                    </div>
                    <br>
                    <div class="card">
                        <div class="card-body" style="background-color: #eaf7ff">
                            <h5 class="card-title">How ag-Grid Manages Complexity internally
                                <hr>
                            </h5>
                            <h6 class="card-subtitle mb-2 text-muted">Niall Crosby<br>15:00 | 15:30</h6>
                            <p>
                                Looking at how ag-Grid built it's own IoC container and Component Library under the hood
                                rather than relying on frameworks, and how it all integrates with all the frameworks.
                            </p>
                        </div>
                    </div>
                    <br>
                    <div class="card">
                        <div class="card-body" style="background-color: #eaf7ff">
                            <h5 class="card-title">Big Data with the Server Side Row Model
                                <hr>
                            </h5>
                            <h6 class="card-subtitle mb-2 text-muted">Robert Clarke<br>15:30 | 16:00</h6>
                            <p>
                                <font size="-0">
                                    Explaining when and how to use the server side row model.
                                </font>
                            </p>
                        </div>
                    </div>
                    <br>
                    <div class="card">
                        <div class="card-body" style="background-color: #eaf7ff">
                            <h5 class="card-title">Supporting the Frameworks
                                <hr>
                            </h5>
                            <h6 class="card-subtitle mb-2 text-muted">Sean Landsman<br>16:30 | 17:00</h6>
                            <p>
                                Showing how we are committed to Angular, React and any future framework that gains
                                popularity.
                            </p>
                        </div>
                    </div>
                    <br>
                    <div class="card">
                        <div class="card-body" style="background-color: #eaf7ff">
                            <h5 class="card-title">Origins of ag-Grid, Current State, and Roadmap
                                <hr>
                            </h5>
                            <h6 class="card-subtitle mb-2 text-muted">Niall Crosby<br>17:00 | 17:30</h6>
                            <p>
                                The story of ag-Grid, where we are, where we are going.
                            </p>
                        </div>
                    </div>


                    <hr>
                    <br>
                    <h3 class="text-center">
                        <strong>Schedule | New York</strong>
                    </h3>
                    <br>
                    <div class="card">
                        <div class="card-body" style="background-color: #fff5cd">
                            <h5 class="card-title">Technical look into ag-Grid's features with the Core team,
                                followed by a Q&A
                                <hr>
                            </h5>
                            <h6 class="card-subtitle mb-2 text-muted">Core Team<br>13:00 | 14:30</h6>
                            <p><font size="-0"></font>
                            </p>
                        </div>
                    </div>
                    <br>
                    <div class="card">
                        <div class="card-body" style="background-color: #fff5cd">
                            <h5 class="card-title">How ag-Grid Manages Complexity internally
                                <hr>
                            </h5>
                            <h6 class="card-subtitle mb-2 text-muted">Niall Crosby<br>15:00 | 15:30</h6>
                            <p>
                                Looking at how ag-Grid built it's own IoC container and Component Library under the hood
                                rather than relying on frameworks, and how it all integrates with all the frameworks.
                            </p>
                        </div>
                    </div>
                    <br>
                    <div class="card">
                        <div class="card-body" style="background-color: #fff5cd">
                            <h5 class="card-title">Big Data with the Server Side Row Model
                                <hr>
                            </h5>
                            <h6 class="card-subtitle mb-2 text-muted">Robert Clarke<br>15:30 | 16:00</h6>
                            <p>
                                <font size="-0">
                                    Explaining when and how to use the server side row model.
                                </font>
                            </p>
                        </div>
                    </div>
                    <br>
                    <div class="card">
                        <div class="card-body" style="background-color: #fff5cd">
                            <h5 class="card-title">Supporting the Frameworks
                                <hr>
                            </h5>
                            <h6 class="card-subtitle mb-2 text-muted">Sean Landsman<br>16:30 | 17:00</h6>
                            <p>
                                Showing how we are committed to Angular, React and any future framework that gains
                                popularity.
                            </p>
                        </div>
                    </div>
                    <br>
                    <div class="card">
                        <div class="card-body" style="background-color: #fff5cd">
                            <h5 class="card-title">Origins of ag-Grid, Current State, and Roadmap
                                <hr>
                            </h5>
                            <h6 class="card-subtitle mb-2 text-muted">Niall Crosby<br>17:00 | 17:30</h6>
                            <p>
                                The story of ag-Grid, where we are, where we are going.
                            </p>
                        </div>
                    </div>


                    <br><br>
                    <div style="background-color: whitesmoke">
                        <h2 class="text-center"
                            style="background-color: whitesmoke;padding-top: 10px;padding-bottom: 10px">
                            Tickets
                        </h2>
                        <div class="card">
                            <div class="card-body">
                                <p class="text-center">
                                    <div class="container">
                                        <div class="row">
                                            <div class="col-sm" style="text-align: center;"
                                            ">
                                            <h3>
                                                London
                                            </h3>
                                            October 4th 2018
                                            <br>
                                            <a href="https://www.eventbrite.com/e/ag-grid-conf-london-tickets-49732217401"
                                               target="_blank">
                                                <button type="button" class="btn btn-primary btn-lg">Register for
                                                    London
                                                </button>
                                            </a>
                                        </div>
                                        <div class="col-sm">
                                <p class="text-center" style="text-align: center;""><br>

                                Limited spaces, register early

                                </p>
                            </div>
                            <div class="col-sm" style="text-align: center" ;>
                                <h3>
                                    New York
                                </h3>
                                October 10th 2018
                                <br>
                                <a href="https://www.eventbrite.com/e/ag-grid-conf-london-tickets-49732217401"
                                   target="_blank">
                                    <button type="button" class="btn btn-primary">Register for New York</button>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
    </div>
</div>

<br><br>

<?php include_once("./includes/footer.php"); ?>
<?php include_once("./includes/analytics.php"); ?>
</body>
</html>
