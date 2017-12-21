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
        .examples{
            padding-top: 35px;
        }

        .example{


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

        .showcase:not(:first-child){
            margin-left: 5px;
        }

        .showcase i{
            float: right;
            margin-top: 5px;
            margin-right: 5px;
            color: cornflowerblue;
        }
    </style>
</head>

<body ng-app="index" class="big-text">

<?php $navKey = "about"; include 'includes/navbar.php'; ?>

<?php $headerTitle = "About"; include 'includes/headerRow.php'; ?>


<div class="container">


    <div class="columns examples">
        <div class="column is-4 example">
            <h1>Big data & Performance</h1>
            <p>ag-Grid is the best performing grid in the world, it can handle large sets of complex data while
                performing as its best</p>
            <div class="columns showcases">
                <div class="column is-12 showcase">Watch our main demo<i class="fa fa-external-link" aria-hidden="true"></i></div>
            </div>
        </div>
        <div class="column is-4 example ">
            <h1>Filter & Search</h1>
            <p>ag-Grid offers the most advanced filtering and search you can imagine, and lets you even create your own filter
                components using your favourite framework</p>
            <div class="columns showcases">
                <div class="column is-12 showcase">Bespoke filtering<i class="fa fa-external-link" aria-hidden="true"></i></div>
            </div>
            <div class="columns showcases">
                <div class="column is-12 showcase">Date, Text and number column filtering<i class="fa fa-external-link" aria-hidden="true"></i></div>
            </div>
            <div class="columns showcases">
                <div class="column is-6 showcase">Excel like column filter<i class="fa fa-external-link" aria-hidden="true"></i></div>
                <div class="column is-6 showcase">Search<i class="fa fa-external-link" aria-hidden="true"></i></div>
            </div>
        </div>
        <div class="column is-4 example">
            <h1>Pivoting</h1>
            <p>ag-Grid allows the user to slice and dice the data on their end using the same approach as Excel</p>
            <div class="columns showcases">
                <div class="column is-12 showcase">Automatic value aggregation<i class="fa fa-external-link" aria-hidden="true"></i></div>
            </div>
            <div class="columns showcases">
                <div class="column is-12 showcase">UI Slice & Dice<i class="fa fa-external-link" aria-hidden="true"></i></div>
            </div>
        </div>
    </div>

    <div class="columns examples">
        <div class="column is-4 example ">
            <h1>Live updates</h1>
            <p>ag-Grid lets you update the data in your grid in different fashions depending on your business case so your
            updates all are always pushed immediately to your user</p>
            <div class="columns showcases">
                <div class="column is-12 showcase">Replacing all the grid data<i class="fa fa-external-link" aria-hidden="true"></i></div>
            </div>
            <div class="columns showcases">
                <div class="column is-6 showcase">Trader desk<i class="fa fa-external-link" aria-hidden="true"></i></div>
                <div class="column is-6 showcase">Delta updates<i class="fa fa-external-link" aria-hidden="true"></i></div>
            </div>
        </div>
        <div class="column is-4 example">
            <h1>CRUD</h1>
            <p>ag-Grid gives you out of the box all you need to enable your CRUD operations, and if you need to create your
            own editors, it lets you do so by using your favourite framework</p>
            <div class="columns showcases">
                <div class="column is-6 showcase">Cell editing<i class="fa fa-external-link" aria-hidden="true"></i></div>
                <div class="column is-6 showcase">Row editing<i class="fa fa-external-link" aria-hidden="true"></i></div>
            </div>
            <div class="columns showcases">
                <div class="column is-12 showcase">Custom editing with your favourite framework<i class="fa fa-external-link" aria-hidden="true"></i></div>
            </div>
        </div>
        <div class="column is-4 example">
            <h1>Excel Integration</h1>
            <p>ag-Grid supports native cient based excel export, and by excel export we mean: What you see is what you get.
            You can export styles, formatting, headers...</p>
            <div class="columns showcases">
                <div class="column is-12 showcase">Try export to excel in our main demo<i class="fa fa-external-link" aria-hidden="true"></i></div>
            </div>
        </div>
    </div>

    <div class="columns examples">
        <div class="column is-4 example">
            <h1>Clipboard</h1>
            <p>ag-Grid is the best performing grid in the world, it can handle large sets of complex data while
                performing as its best</p>
            <div class="columns showcases">
                <div class="column is-12 showcase">Watch our main demo<i class="fa fa-external-link" aria-hidden="true"></i></div>
            </div>
        </div>
        <div class="column is-4 example ">
            <h1>Moving, Pinning and Grouping columns</h1>
            <p>ag-Grid offers the most advanced filtering and search you can imagine, and lets you even create your own filter
                components using your favourite framework</p>
            <div class="columns showcases">
                <div class="column is-12 showcase">Bespoke filtering<i class="fa fa-external-link" aria-hidden="true"></i></div>
            </div>
            <div class="columns showcases">
                <div class="column is-12 showcase">Date, Text and number column filtering<i class="fa fa-external-link" aria-hidden="true"></i></div>
            </div>
            <div class="columns showcases">
                <div class="column is-6 showcase">Excel like column filter<i class="fa fa-external-link" aria-hidden="true"></i></div>
                <div class="column is-6 showcase">Search<i class="fa fa-external-link" aria-hidden="true"></i></div>
            </div>
        </div>
        <div class="column is-4 example">
            <h1>Sorting</h1>
            <p>ag-Grid allows the user to slice and dice the data on their end using the same approach as Excel</p>
            <div class="columns showcases">
                <div class="column is-12 showcase">Automatic value aggregation<i class="fa fa-external-link" aria-hidden="true"></i></div>
            </div>
            <div class="columns showcases">
                <div class="column is-12 showcase">UI Slice & Dice<i class="fa fa-external-link" aria-hidden="true"></i></div>
            </div>
        </div>
    </div>

    <div class="columns examples">
        <div class="column is-4 example ">
            <h1>APIs</h1>
            <p>ag-Grid lets you update the data in your grid in different fashions depending on your business case so your
                updates all are always pushed immediately to your user</p>
            <div class="columns showcases">
                <div class="column is-12 showcase">Replacing all the grid data<i class="fa fa-external-link" aria-hidden="true"></i></div>
            </div>
            <div class="columns showcases">
                <div class="column is-6 showcase">Trader desk<i class="fa fa-external-link" aria-hidden="true"></i></div>
                <div class="column is-6 showcase">Delta updates<i class="fa fa-external-link" aria-hidden="true"></i></div>
            </div>
        </div>
        <div class="column is-4 example">
            <h1>Pagination</h1>
            <p>ag-Grid gives you out of the box all you need to enable your CRUD operations, and if you need to create your
                own editors, it lets you do so by using your favourite framework</p>
            <div class="columns showcases">
                <div class="column is-6 showcase">Cell editing<i class="fa fa-external-link" aria-hidden="true"></i></div>
                <div class="column is-6 showcase">Row editing<i class="fa fa-external-link" aria-hidden="true"></i></div>
            </div>
            <div class="columns showcases">
                <div class="column is-12 showcase">Custom editing with your favourite framework<i class="fa fa-external-link" aria-hidden="true"></i></div>
            </div>
        </div>
        <div class="column is-4 example">
            <h1>Totals, Tree Data and Row Grouping</h1>
            <p>ag-Grid supports native cient based excel export, and by excel export we mean: What you see is what you get.
                You can export styles, formatting, headers...</p>
            <div class="columns showcases">
                <div class="column is-12 showcase">Try export to excel in our main demo<i class="fa fa-external-link" aria-hidden="true"></i></div>
            </div>
        </div>
    </div>

    <div class="columns examples">
        <div class="column is-4 example ">
            <h1>UI Customisation</h1>
            <p>ag-Grid lets you update the data in your grid in different fashions depending on your business case so your
                updates all are always pushed immediately to your user</p>
            <div class="columns showcases">
                <div class="column is-12 showcase">Replacing all the grid data<i class="fa fa-external-link" aria-hidden="true"></i></div>
            </div>
            <div class="columns showcases">
                <div class="column is-6 showcase">Trader desk<i class="fa fa-external-link" aria-hidden="true"></i></div>
                <div class="column is-6 showcase">Delta updates<i class="fa fa-external-link" aria-hidden="true"></i></div>
            </div>
        </div>
        <div class="column is-4 example">
            <h1>Complex cell content</h1>
            <p>ag-Grid gives you out of the box all you need to enable your CRUD operations, and if you need to create your
                own editors, it lets you do so by using your favourite framework</p>
            <div class="columns showcases">
                <div class="column is-6 showcase">Cell editing<i class="fa fa-external-link" aria-hidden="true"></i></div>
                <div class="column is-6 showcase">Row editing<i class="fa fa-external-link" aria-hidden="true"></i></div>
            </div>
            <div class="columns showcases">
                <div class="column is-12 showcase">Custom editing with your favourite framework<i class="fa fa-external-link" aria-hidden="true"></i></div>
            </div>
        </div>
        <div class="column is-4 example">
            <h1>Supports all the big frameworks</h1>
            <p>ag-Grid supports native cient based excel export, and by excel export we mean: What you see is what you get.
                You can export styles, formatting, headers...</p>
            <div class="columns showcases">
                <div class="column is-12 showcase">Try export to excel in our main demo<i class="fa fa-external-link" aria-hidden="true"></i></div>
            </div>
        </div>
    </div>


</div>

</div>

<?php include("includes/footer.php"); ?>

</body>

<?php include_once("includes/analytics.php"); ?>

</html>