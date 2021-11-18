<?php
require_once 'includes/html-helpers.php';
gtm_data_layer('about');
?>
<!DOCTYPE html>
<html lang="en">
<head lang="en">
    <?php

    meta_and_links("ag-Conf London and New York", "About AG Grid", "AG Grid is a feature-rich datagrid available in Community or Enterprise versions. This is the story of AG Grid and explains our mission, where we came from and who we are.", "London.php", true);
    ?>
    <link rel="stylesheet" href="dist/homepage.css">
</head>

<body>
<?php include_once("./includes/analytics.php"); ?>
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
                        AG Grid Conf
                    </h1>

                    <p class="lead" align="center">
                        Where CTO's, Senior Developers, Developers and Product Managers serious about JavaScript data presentation<br> can learn more about AG Grid and share their experiences with the AG Grid team.
                    </p>

                    <div class="container">
                      <div class="row">
                        <div class="col-sm"  style="text-align: center;"">
                            <h2>
                                New York
                            </h2>
                            October 10th 2018
                            <br>
                            <a href="https://www.eventbrite.com/e/ag-grid-conf-london-tickets-49732217401" target="_blank"><button type="button" class="btn btn-primary" style="margin-top: 10px">Register for New York</button></a>
                        </div>
                        <div class="col-sm"  style="text-align: center";>
                            <h2>
                                London
                            </h2>
                            November 13th 2018
                            <br>
                            <a href="https://www.eventbrite.com/e/ag-grid-conf-london-tickets-49732217401" target="_blank"><button type="button" class="btn btn-primary" style="margin-top: 10px">Register for London</button></a>
                        </div>
                    </div>
                </div>

                <br>

                <h4 class="text-center">
                    No charge, but you must register
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
                            <h4>Founder, CEO & CTO, AG Grid</h4>

                        </div>

                        <div class="col-md-4">
                            <div>
                                <img src='images/team/sean.jpg' alt="Sean Landsman, Lead Developer"/>
                            </div>
                            <h3>Sean Landsman</h3>
                            <h4>Javascript Frameworks Guru, AG Grid</h4>

                        </div>

                        <div class="col-md-4">
                            <div>
                                <img src='images/team/rob.jpg' alt="Alberto Gutierrez, Lead Developer"/>
                            </div>
                            <h3>Robert Clarke </h3>
                            <h4>Enterprise Applications Guru, AG Grid</h4>

                        </div>
                    </div>
                    <br>
                    <hr>

                    <h2 class="text-center" style="background-color: whitesmoke;padding-top: 10px">
                        New York Schedule
                        <hr>
                    </h2>
                    <hr>

                    <head>
                        <style>
                        table, th, td {
                            border: 1px solid black;
                            border-collapse: collapse;
                        }
                        th, td {
                            padding: 15px;
                        }
                    </style>
                </head>

                <table style="width:60%">
                  <tr style="background-color: #e2f2ff">
                    <th align="center">Time</th>
                    <th>Conference Program</th>
                </tr>
                <tr>
                    <td>3:00 - 3:50 PM</td>
                    <td><strong>Technical look into AG Grid's features with the Core team, followed by a Q&A</strong></td>
                </tr>
                                <tr>
                    <td>3:50 - 4:00 PM</td>
                    <td>[Break]</td>
                </tr>
                <tr>
                    <td style="background-color: whitesmoke">4:00 - 4:25 PM</td>
                    <td style="background-color: whitesmoke"><strong>How AG Grid Manages Complexity internally</strong>
                        <br>
                        Looking at how AG Grid built it's own IoC container and Component Library under the hood rather than relying on frameworks, and how it all integrates with all the frameworks.
                    </td>
                </tr>
                <tr>
                    <td>4:25 - 4:50 PM</td>
                    <td><strong>Big Data with the Server Side Row Model</strong>
                        <br>
                        Explaining when and how to use the server side row model.
                    </td>
                </tr>
                                                <tr>
                    <td>4:50 - 5:00 PM</td>
                    <td>[Break]</td>
                </tr>
                <tr>
                    <td style="background-color: whitesmoke">5:00 - 5:30 PM</td>
                    <td style="background-color: whitesmoke"><strong>Supporting the Frameworks</strong>
                        <br>
                        Showing how we are committed to Angular, React and any future framework that gains popularity.
                    </tr>
                    <tr>
                        <td>5:30 - 6:00 PM</td>
                        <td><strong>Origins of AG Grid, Current State, and Roadmap</strong>
                            <br>
                            The story of AG Grid, where we are, where we are going.
                        </tr>
                                            <tr>
                        <td>6:00 - 8:00 PM</td>
                        <td><strong>Networking, Drinks, Bar Tab and Food.</strong>
                        </tr>
                    </table>
                    <br>
                    <p>
                        <strong>*Final Schedule TBC*</strong>
                    </p>
                    <hr>
                    <h2 class="text-center" style="background-color: whitesmoke;padding-top: 10px">
                        London Schedule
                        <hr>
                    </h2>


                    <head>
                        <style>
                        table, th, td {
                            border: 1px solid black;
                            border-collapse: collapse;
                        }
                        th, td {
                            padding: 15px;
                        }
                    </style>
                </head>

                <table style="width:60%">
                  <tr style="background-color: #e2f2ff">
                    <th align="center">Time</th>
                    <th>Conference Program</th>
                </tr>
                <tr>
                    <td>3:00 - 3:50 PM</td>
                    <td><strong>Technical look into AG Grid's features with the Core team, followed by a Q&A</strong></td>
                </tr>
                                <tr>
                    <td>3:50 - 4:00 PM</td>
                    <td>[Break]</td>
                </tr>
                <tr>
                    <td style="background-color: whitesmoke">4:00 - 4:25 PM</td>
                    <td style="background-color: whitesmoke"><strong>How AG Grid Manages Complexity internally</strong>
                        <br>
                        Looking at how AG Grid built it's own IoC container and Component Library under the hood rather than relying on frameworks, and how it all integrates with all the frameworks.
                    </td>
                </tr>
                <tr>
                    <td>4:25 - 4:50 PM</td>
                    <td><strong>Big Data with the Server Side Row Model</strong>
                        <br>
                        Explaining when and how to use the server side row model.
                    </td>
                </tr>
                                                <tr>
                    <td>4:50 - 5:00 PM</td>
                    <td>[Break]</td>
                </tr>
                <tr>
                    <td style="background-color: whitesmoke">5:00 - 5:30 PM</td>
                    <td style="background-color: whitesmoke"><strong>Supporting the Frameworks</strong>
                        <br>
                        Showing how we are committed to Angular, React and any future framework that gains popularity.
                    </tr>
                    <tr>
                        <td>5:30 - 6:00 PM</td>
                        <td><strong>Origins of AG Grid, Current State, and Roadmap</strong>
                            <br>
                            The story of AG Grid, where we are, where we are going.
                        </tr>
                                            <tr>
                        <td>6:00 - 8:00 PM</td>
                        <td><strong>Networking, Drinks, Bar Tab and Food.</strong>
                        </tr>
                    </table>
                    <head>
                        <style>
                        table, th, td {
                            border: 1px solid black;
                            border-collapse: collapse;
                        }
                        th, td {
                            padding: 15px;
                        }
                    </style>
                </head>


                    <br>
                    <p>
                        <strong>*Final Schedule TBC*</strong>
                    </p>
                    <hr>
                    <br>



   <br><br>
   <div style="background-color: whitesmoke">
    <h2 class="text-center" style="background-color: whitesmoke;padding-top: 10px;padding-bottom: 10px">
        Tickets
    </h2>
    <div class="card">
      <div class="card-body">
        <p class="text-center">
            <div class="container">
              <div class="row">
                <div class="col-sm"  style="text-align: center;"">
                    <h3>
                        New York
                    </h3>
                    October 10th 2018
                    <br>
                    <a href="https://www.eventbrite.com/e/ag-grid-conf-london-tickets-49732217401" target="_blank"><button type="button" class="btn btn-primary">Register for London</button></a>
                </div>
                <div class="col-sm">
                    <p class="text-center"  style="text-align: center;""><br>

                        No charge, but you must register

                    </p>
                </div>
                <div class="col-sm"  style="text-align: center";>
                    <h3>
                        London
                    </h3>
                    November 13th 2018
                    <br>
                    <a href="https://www.eventbrite.com/e/ag-grid-conf-london-tickets-49732217401" target="_blank"><button type="button" class="btn btn-primary">Register for New York</button></a>
                </div>
            </div>
        </div>
    </div>
</div>
</div>
</div>

<br><br>

<?php include_once("./includes/footer.php"); ?>
</body>
</html>
