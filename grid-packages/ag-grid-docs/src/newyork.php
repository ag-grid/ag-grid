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
    <img src="images/agnyc2.png" style="width: 100%">

<div>
        <section>
            <hr>
                        <p class="text-center">
                ag-Grid, the <strong>number one Javascript Grid in the world</strong> is holding it's first ever event in <strong>New York</strong>.
<br>
<font size="-1">Oct 10th
<br>
New York, United States.</font>
            </p>
            <div class="card" style="background-color: whitesmoke">
  <div class="card-body">
<p class="text-center">
                <font size="+1.5">
                Come to meet and hear from the creators of ag-Grid:
<br>
                 Get to understand the features behind the feature-rich grid. 
                 <br>
                 How ag-Grid is dedicated to supporting frameworks. 
                 <br>
                 The story behind the meteoric rise of ag-Grid and what the future holds and much more!
             </font>
  </div>
</div>
            <p class="text-center"><br>
                <strong>
Join us in NYC this October for an in-depth look into the industry juggernaut that is ag-Grid.
</strong>
            </p>
            <h4 class="text-center"> 
                Limited spaces so grab your seat early!
            </h4>
            <div>
<a href="https://www.eventbrite.com/e/ag-grid-in-nyc-the-best-javascript-grid-in-the-world-tickets-49731529343" target="_blank"><button type="button" class="btn btn-primary btn-lg btn-block" style="padding-bottom: 5px;padding-top: 5px">Register Now!</button></a>
            </div>
<br>
<div style="max-width: : 100%">
    <h2 class="text-center" style="background-color: whitesmoke;padding-top: 10px">
What To Expect
<p class="text-muted">
    <font size="-1">
    Enjoy talks from the brains behind ag-Grid, an in-depth look into what makes our grid the best and the story behind the industry disruptor that is ag-Grid from it's fruition in 2016.
</font>
</p>
        <hr>
    </h2>


<div class="container">
  <div class="row">
    <div class="col">
<h3 class="text-center"><strong>Schedule</strong>
<p class="mb-2 text-muted">
    <font size="-1">The Talks</font>
</p>
    <hr>
</h3>
    <div class="card">
  <div class="card-body" style="background-color: #f3f3f3">
    <h5 class="card-title">Technical look into ag-Grid's features with the Core team<br>
Followed by a Q&A
        <hr></h5>
    <h6 class="card-subtitle mb-2 text-muted">Core Team<br>13:00 | 14:30</h6>
    <p><font size="-0">
        
    </font>
    </p>
      </div>
</div>

<br>
<div class="card">
  <div class="card-body" style="background-color: #f3f3f3">
    <h5 class="card-title">How ag-Grid Manages Complexity internally<hr></h5>
    <h6 class="card-subtitle mb-2 text-muted">Niall Crosby<br>15:00 | 15:30</h6>
    <p>
        Looking at how ag-Grid built it's own IoC container and Component Library under the hood rather than relying on frameworks, and how it all integrates with all the frameworks.
    </p>
      </div>
</div>
        <br>
        <div class="card">
  <div class="card-body" style="background-color: #f3f3f3">
    <h5 class="card-title">Big Data with the Server Side Row Model<hr></h5>
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
  <div class="card-body" style="background-color: #f3f3f3">
    <h5 class="card-title">Supporting the Frameworks<hr></h5>
    <h6 class="card-subtitle mb-2 text-muted">Sean Landsman<br>16:30 | 17:00</h6>
    <p>
        Showing how we are committed to Angular, React and any future framework that gains popularity.
    </p>
      </div>
</div>
<br>
        <div class="card">
  <div class="card-body" style="background-color: #f3f3f3">
    <h5 class="card-title">Origins of ag-Grid, Current State, and Roadmap<hr></h5>
    <h6 class="card-subtitle mb-2 text-muted">Niall Crosby<br>17:00 | 17:30</h6>
    <p>
         The story of ag-Grid, where we are, where we are going.
    </p>
      </div>
</div>
        
    </div>
    <div class="col">
<h3 class="text-center"><strong>Speakers</strong>
<p class="text-muted">
   <font size="-1">The Brains</font>
</p>
</h3>
    <hr>

            <div class="inline-container team">
                <div class="row">

                    <div class="col-md-4">
                        <div>
                            <img src='images/team/niall.jpg' alt="Niall Crosby, CEO"/>
                        </div>
                        <h3>Niall Crosby</h3>
                        <h4>CEO / CTO, <br> ag-Grid</h4>
                        <hr>
                        <p>
                            Niall provides the technical vision for ag-Grid, juggling this with the usual CEO duties.
                        </p>
                    </div>

                    <div class="col-md-4">
                        <div>
                            <img src='images/team/sean.jpg' alt="Sean Landsman, Lead Developer"/>
                        </div>
                        <h3>Sean Landsman</h3>
                        <h4>Lead Developer, <br> Frameworks</h4>
                        <hr>
                        <p>
                            Sean ensures that we can keep the agnostic in ag-Grid. He is responsible for integrating with all of our supported frameworks.
                        </p>
                    </div>

                    <div class="col-md-4">
                        <div>
                            <img src='images/team/alberto.jpg' alt="Alberto Gutierrez, Lead Developer"/>
                        </div>
                        <h3>Alberto Gutierrez</h3>
                        <h4>Lead Developer, <br> Data Internals</h4>
                        <hr>
                        <p>
                            Alberto joined the team in early 2017 and further broadens the Enterprise applications experience.
                        </p>
                    </div>
                                        <div class="col-md-4">
                        <div>
                            <img src='images/team/rob.jpg' alt="Niall Crosby, CEO"/>
                        </div>
                        <h3>Robert Clarke</h3>
                        <h4>Lead Developer, <br> Enterprise Applications</h4>
                        <hr>
                        <p>
                            An expert in numerous server and client side programming languages and technologies which he uses to drive forward the core engine of ag-Grid.
                        </p>
                    </div>
</div>

    </div>

  </div>
            </div>

    </div>
</div>

<br><br>
<div style="background-color: whitesmoke">
<h2 class="text-center" style="background-color: whitesmoke;padding-top: 10px;padding-bottom: 10px">
    Tickets
</h2>
<p class="text-muted, text-center"> 
    Tickets get you access to speaker presentations throughout the day, swag and refreshments. 
</p>
<div class="card">
  <div class="card-body">
    <p class="text-center">
        <strong>
            <font size="+2">
    Get Your Seat Now
</font>
    </strong>
    <br>
    With limited spaces, register your space early. If spaces fill early, we will look into acquiring a larger space.  
    <br><br>
    <a href="https://www.eventbrite.com/e/ag-grid-in-nyc-the-best-javascript-grid-in-the-world-tickets-49731529343" target="_blank"><button type="button" class="btn btn-primary btn-lg btn-block" style="padding-bottom: 5px;padding-top: 5px">Register Now!</button></a>
  </div>
</div>
</div>

<br>

<?php include_once("./includes/footer.php"); ?>
<?php include_once("./includes/analytics.php"); ?>
</body>
</html>
