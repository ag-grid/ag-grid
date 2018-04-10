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

    <blockquote>
        <p>We’re using ag-Grid as a major component in our enterprise analytics and reporting product and it’s incredible. Prior to ag-Grid, we tried jqGrid, jqxGrid, DataTables, and SlickGrid, which all have their strong points, but we eventually ran into a wall with certain features. ag-Grid’s grouping, aggregation, filtering, and all-around flexibility allowed us to quickly integrate it into our product. And, the performance is truly awesome!</p>
        <footer>
            Andrew Taft
            <span class="position">Head of Product Development at Insight Technology Group</span>
        </footer>
    </blockquote>

    <blockquote>
        <p>We love ag-Grid for its simple integration, blazing-fast performance, and friendly community.</p>
        <footer>
            Lucas Val
            <span class="position">VP of Product Development at Hexonet Services Inc</span>
        </footer>
    </blockquote>

    <blockquote>
        <p>Remarkable speed and extensibility, ag-Grid is the best web feature-rich BI tool on the market.</p>
        <footer>
            Robin Cote
            <span class="position">Senior Systems Developer, Investment Solutions Group, Healthcare of Ontario Pension Plan</span>
        </footer>
    </blockquote>

    <blockquote>
        <p>I'm so glad you made ag-Grid!  Finally, someone has done it right.  I started using Google's Table visualizations, then tried dataTables.net and then js-Grid before I discovered your product.  Your design and implementation is brilliant.</p>
        <footer>
            Graham Smith
            <span class="position">United Healthcare Workers West</span>
        </footer>
    </blockquote>

    <blockquote>
        <p>For those who are just checking into this project, stop looking at others and start using agGrid.
            This is an amazing piece of work and the api is so deep, you will be thrilled to find out all it is capable of doing.
            Thanks to @ceolter for his efforts, you have helped improve our application with agGrid.</p>
        <footer>
            Mike Erickson
            <span class="position">Code Dungeon</span>
        </footer>
    </blockquote>

    <blockquote>
        <p>We just made the move from Kendo to ag-grid and we love it. It’s fast and very flexible.</p>
        <footer>
            Jason Boorn
            <span class="position">Senior Architect, Roobricks</span>
        </footer>
    </blockquote>

    <blockquote>
        <p>I just wanted to say thank you for all the hard work you have put into ag-Grid.  I have been using the free version for about a year and have to say it is definitely the best grid framework out there.</p>
        <footer>
            Jordan Berry
            <span class="position">CTO / Co-Founder, Interloop</span>
        </footer>
    </blockquote>

    <blockquote>
        <p>ag-Grid is one of the best Grids I have ever worked with. In spite of being feature rich it is still one of the fastest grids I have ever used. This grid will be an essential part of my tool kit especially when working with extremely large datasets.</p>
        <footer>
            Zach Lewis
            <span class="position">Senior Software Developer, Nutraceutical</span>
        </footer>
    </blockquote>


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