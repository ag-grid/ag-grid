<!DOCTYPE html>
<html>
<head lang="en">
    <meta charset="UTF-8">

    <title>About Us</title>
    <meta name="description" content="This is the story of ag-Grid and explains our mission, where we came from and who we are.">
    <meta name="keywords" content="About ag-Grid"/>

    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- Bootstrap -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap-theme.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bulma/0.4.1/css/bulma.css">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">

    <link rel="stylesheet" type="text/css" href="/style.css">

    <link rel="shortcut icon" href="https://www.ag-grid.com/favicon.ico" />

    <style>
        a{
            color: #337ab7
        }
        .examples{
            padding-top: 35px;
        }

        .example{
            padding: 0 70px;
        }

        .example h1{
            font-weight: bold;
            padding-bottom: 5px;
            border-bottom: 1px solid lightgrey;
            margin-bottom: 5px;
            font-size: 25px;
        }

        .example p{
            min-height: 100px;
        }

        .example:not(:first-child){
            margin-left: 15px;
        }

        .showcases{
            margin-top: 5px;
            padding-left: 10px;
            padding-right: 10px;
        }

        .showcase{
            padding: 0px;
            padding-left: 10px;
            border-bottom: 1px solid cornflowerblue;
            /*border-radius: 10px;*/
            /*background-color: darkblue;*/
            /*color: white;*/
        }


        .showcase i{
            float: right;
            margin-top: 5px;
            margin-right: 5px;
            color: cornflowerblue;
        }

        .example-icon{
            float: left;
            font-size: 45px;
            padding-right: 15px;
        }
    </style>
</head>

<body ng-app="index" class="big-text">

<?php $navKey = "about"; include 'includes/navbar.php'; ?>

<?php $headerTitle = "About"; include 'includes/headerRow.php'; ?>


<div class="container">


    <div class="columns examples">
        <div class="column is-6 example">
            <h1>Big data & Performance</h1>
            <i class="fa fa-rocket example-icon" aria-hidden="true"></i>
            <p>ag-Grid is the best performing grid in the world, it can handle large sets of complex data while
                performing as its best. <a>Watch our main demo</a></p>

        </div>
        <div class="column is-6 example ">
            <h1>Filter & Search</h1>
            <i class="fa fa-filter example-icon" aria-hidden="true"></i>
            <p>ag-Grid offers the most advanced filtering and search you can imagine, and lets you even create your own filter
                components using your favourite framework <a>Bespoke filtering</a>, <a>Column filtering</a>,
                <a>Excel like column fitlering</a>, <a>Search</a></p>
        </div>
    </div>

    <div class="columns examples">
        <div class="column is-6 example">
            <h1>Pivoting</h1>
            <i class="fa fa-microchip example-icon" aria-hidden="true"></i>
            <p>ag-Grid allows the user to slice and dice the data on their end using the same approach as Excel
            <a>Automatic value aggregation</a>, <a>UI Slice & Dice</a></p>

        </div>
        <div class="column is-6 example ">
            <h1>Live updates</h1>
            <i class="fa fa-bolt example-icon" aria-hidden="true"></i>
            <p>ag-Grid lets you update the data in your grid in different fashions depending on your business case so your
                updates all are always pushed immediately to your user
                <a>link 1</a>, <a>longer link 2</a></p>
        </div>
    </div>

    <div class="columns examples">
        <div class="column is-6 example">
            <h1>CRUD</h1>
            <i class="fa fa-pencil-square-o example-icon" aria-hidden="true"></i>
            <p>ag-Grid gives you out of the box all you need to enable your CRUD operations, and if you need to create your
                own editors, it lets you do so by using your favourite framework <a>link 1</a>, <a>longer link 2</a></p>

        </div>
        <div class="column is-6 example ">
            <h1>Excel integration</h1>
            <i class="fa fa-file-excel-o example-icon" aria-hidden="true"></i>
            <p>ag-Grid lets you update the data in your grid in different fashions depending on your business case so your
                updates all are always pushed immediately to your user <a>link 1</a>, <a>longer link 2</a></p>
        </div>
    </div>

    <div class="columns examples">
        <div class="column is-6 example">
            <h1>Clipboard</h1>
            <i class="fa fa-clipboard example-icon" aria-hidden="true"></i>
            <p>ag-Grid gives you out of the box all you need to enable your CRUD operations, and if you need to create your
                own editors, it lets you do so by using your favourite framework <a>link 1</a>, <a>longer link 2</a></p>

        </div>
        <div class="column is-6 example ">
            <h1>Moving, Pinning and Grouping columns</h1>
            <i class="fa fa-arrows-alt example-icon" aria-hidden="true"></i>
            <p>ag-Grid lets you update the data in your grid in different fashions depending on your business case so your
                updates all are always pushed immediately to your user <a>link 1</a>, <a>longer link 2</a></p>
        </div>
    </div>

    <div class="columns examples">
        <div class="column is-6 example">
            <h1>Sorting</h1>
            <i class="fa fa-sort example-icon" aria-hidden="true"></i>
            <p>ag-Grid gives you out of the box all you need to enable your CRUD operations, and if you need to create your
                own editors, it lets you do so by using your favourite framework <a>link 1</a>, <a>longer link 2</a></p>

        </div>
        <div class="column is-6 example ">
            <h1>APIs</h1>
            <i class="fa fa-fighter-jet example-icon" aria-hidden="true"></i>
            <p>ag-Grid lets you update the data in your grid in different fashions depending on your business case so your
                updates all are always pushed immediately to your user <a>link 1</a>, <a>longer link 2</a></p>
        </div>
    </div>

    <div class="columns examples">
        <div class="column is-6 example">
            <h1>Pagination</h1>
            <i class="fa fa-list-ol example-icon" aria-hidden="true"></i>
            <p>ag-Grid gives you out of the box all you need to enable your CRUD operations, and if you need to create your
                own editors, it lets you do so by using your favourite framework <a>link 1</a>, <a>longer link 2</a></p>

        </div>
        <div class="column is-6 example ">
            <h1>Totals, Tree Data and Row Grouping</h1>
            <i class="fa fa-plus-square example-icon" aria-hidden="true"></i>
            <p>ag-Grid lets you update the data in your grid in different fashions depending on your business case so your
                updates all are always pushed immediately to your user <a>link 1</a>, <a>longer link 2</a></p>
        </div>
    </div>

    <div class="columns examples">
        <div class="column is-6 example">
            <h1>UI Customisation</h1>
            <i class="fa fa-sliders example-icon" aria-hidden="true"></i>
            <p>ag-Grid gives you out of the box all you need to enable your CRUD operations, and if you need to create your
                own editors, it lets you do so by using your favourite framework <a>link 1</a>, <a>longer link 2</a></p>

        </div>
        <div class="column is-6 example ">
            <h1>Complex cell content</h1>
            <i class="fa fa-superscript example-icon" aria-hidden="true"></i>
            <p>ag-Grid lets you update the data in your grid in different fashions depending on your business case so your
                updates all are always pushed immediately to your user <a>link 1</a>, <a>longer link 2</a></p>
        </div>
    </div>

    <div class="columns examples">
        <div class="column is-6 example">
            <h1>Charts</h1>
            <i class="fa fa-line-chart example-icon" aria-hidden="true"></i>
            <p>ag-Grid gives you out of the box all you need to enable your CRUD operations, and if you need to create your
                own editors, it lets you do so by using your favourite framework <a>link 1</a>, <a>longer link 2</a></p>

        </div>
        <div class="column is-6 example ">
            <h1>All the big frameworks</h1>
            <i class="fa fa-magic example-icon" aria-hidden="true"></i>
            <p>ag-Grid lets you update the data in your grid in different fashions depending on your business case so your
                updates all are always pushed immediately to your user <a>link 1</a>, <a>longer link 2</a></p>
        </div>
    </div>



</div>

</div>

<?php include("includes/footer.php"); ?>

</body>

<?php include_once("includes/analytics.php"); ?>

</html>