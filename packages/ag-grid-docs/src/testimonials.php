<?php 
include_once 'includes/html-helpers.php';
gtm_data_layer('testimonials');
?>
<!DOCTYPE html>
<html lang="en">
<head lang="en">
<?php
meta_and_links("ag-Grid: Customer Testimonials", "ag-Grid Javascript Grid Testimonials", "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. We've had great feedback from our customers and you can read those reviews here.", true);
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

<div class="info-page" id="page-testimonials">
    <div class="row">
        <section>
    <h1>Testimonials</h1>
    <p class="lead">
        At ag-Grid, we love what we are doing. What does matter though is that our users love it, too.
    </p>


 <div id="stage-testimonials" style="margin-top: -65px">
        <section>
            <div>
                <img src="_assets/customers/robin-cote.jpg" alt="Andrew Taft">
                <div>
                    <blockquote>
                        <p>Remarkable speed and extensibility, ag-Grid is the best web feature-rich BI tool on the market.</p>

                        <footer>
                            <strong>Robin Cote</strong>
                            <span class="position">Solutions Architect, Investment Solutions Group, Healthcare of Ontario Pension Plan</span>
                        </footer>
                    </blockquote>
                </div>
            </div>

            <div>
                <img src="_assets/customers/andrew-taft.jpg" alt="Andrew Taft">
                <div>
                    <blockquote>
                        <p>
                            <strong>ag-Grid</strong>’s grouping, aggregation, filtering, and all-around flexibility allowed us to quickly integrate it into our product. And, the performance is truly awesome!</p>

                        <footer>
                            <strong>Andrew Taft</strong> 
                            <span class="position">Head of Product Development at Insight Technology Group</span> 
                        </footer>
                    </blockquote>
                </div>
            </div>

            <div>
                <img src="_assets/customers/jason-boorn.jpg" alt="Jason Boorn">

                <div>
                    <blockquote>
                        <p>We just made the move from Kendo to ag-Grid and we love it. It’s fast and very flexible.</p>

                        <footer>
                            <strong>Jason Boorn</strong>
                            <span class="position">Senior Architect, Roobricks</span>
                        </footer>
                    </blockquote>
                </div>
            </div>

        </section>
    </div>

    <hr style="margin-top: -20px">

     <div id="stage-testimonials" style="margin-top: -30px">
        <section>
   <div>
                <img src="_assets/customers/Rony-Liderman2.jpg" alt="Rony Liderman">
                <div>
                    <blockquote>
                        <p>The most full-featered wel-maintened, performant grid solution out there</p>

                        <footer>
                            <strong>Rony Liderman</strong> 
                            <span class="position">Software Development Engineer, Microsoft</span> 
                        </footer>
                    </blockquote>
                </div>
            </div>

            <div>
                <img src="_assets/customers/Karim-Helal.jpg" alt="Karim Helal">
                <div>
                    <blockquote>
                        <p>It is the fastest grid we've seen and the fact that it's being actively worked on means it won't go "dead" anytime soon. It's made adding powerful grids easy and quick, making our SaaS much better than it could have been before.</p>

                        <footer>
                            <strong>Karim Helal</strong> 
                            <span class="position">Co-Founder, CEO, Protenders</span> 
                        </footer>
                    </blockquote>
                </div>
            </div>

            <div>
                <img src="_assets/customers/Ayelet-Cohen.jpg" alt="Ayelet Cohen">

                <div>
                    <blockquote>
                        <p>When we were looking for a grid solution for our Web App, we had a lot of demands in out mind.
At first it seemed ag-Grid was to true to be  true, and it lived up to the expectation!

First of all its is very customisable,you can play and change every element in the grid with ease.
The filters/sorting/grouping/searching are working so fast on large data (we tested up to 80k rows), just like magic.

AG-Grid has made my life as a developer a lot easier 
</p>

                        <footer>
                            <strong>Ayelet Cohen</strong>
                            <span class="position">Front End Developer, Indegy</span>
                        </footer>
                    </blockquote>
                </div>
            </div>

        </section>
    </div>

    <hr style="margin-top: -20px">

    <div id="stage-testimonials" style="margin-top: -30px">
        <section>
            <div>
                <img src="_assets/customers/Lucas-Val.jpg" alt="Lucas Val">
                <div>
                    <blockquote>
                        <p>We love <strong>ag-Grid</strong> for its simple integration, blazing-fast performance, and friendly community.</p>

                        <footer>
                            <strong>Lucas Val</strong>
                            <span class="position">VP of Product Development at Hexonet Services Inc</span>
                        </footer>
                    </blockquote>
                </div>
            </div>

            <div>
                <img src="_assets/customers/Jordan-Berry.jpg" alt="Jordan Berry">
                <div>
                    <blockquote>
                        <p>I just wanted to say thank you for all the hard work you have put into ag-Grid. I have been using the free version for about a year and have to say it is definitely the best grid framework out there.</p>

                        <footer>
                            <strong>Jordan Berry</strong> 
                            <span class="position">CTO / Co-Founder, Interloop</span> 
                        </footer>
                    </blockquote>
                </div>
            </div>

            <div>
                <img src="_assets/customers/Zachary-Lewis.jpg" alt="Zachary Lewis">

                <div>
                    <blockquote>
                        <p>ag-Grid is one of the best Grids I have ever worked with. In spite of being feature rich it is still one of the fastest grids I have ever used. This grid will be an essential part of my tool kit especially when working with extremely large datasets.</p>

                        <footer>
                            <strong>Zachary Lewis</strong>
                            <span class="position">Senior Software Developer, Nutraceutical</span>
                        </footer>
                    </blockquote>
                </div>
            </div>

        </section>
    </div>
    <hr>
<h2>Want to become a user of ag-Grid as well?</h2>
<p>Use our Community edition or trial ag-Grid Enterprise for free.</p>
<div>
    <a href="https://github.com/ag-grid/ag-grid/tree/master/packages/ag-grid"><button type="button" class="btn btn-outline-primary btn-lg btn-block">Community Edition</button></a>
</div>
<br>
<div>
  <a href="https://www.ag-grid.com/start-trial.php"><button type="button" class="btn btn-primary btn-lg btn-block">Start Free Trial</button></a>
</div>
<br>
    <h2>Add Your Own Testimonial</h2>
    <p>
        If you want to share your experience with ag-Grid, please send us your testimonial to
    <script language="JavaScript">
        var name = "accounts";
        var domain = "ag-grid.com";
        document.write('<a href=\"mailto:' + name + '@' + domain + '\">');
        document.write(name + '@' + domain + '</a>');
    </script>.
    </p>

        </section>
    </div>
</div>


<?php include_once("./includes/footer.php"); ?>
<?php include_once("./includes/analytics.php"); ?>
</body>
</html>