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

    <link rel="stylesheet" type="text/css" href="/style.css">

    <link rel="shortcut icon" href="https://www.ag-grid.com/favicon.ico" />

</head>

<body ng-app="index" class="big-text">

<?php $navKey = "about"; include 'includes/navbar.php'; ?>

<?php $headerTitle = "About"; include 'includes/headerRow.php'; ?>

<style>
    .weekly-news-paragraph {
        color: #767676;
        padding-bottom: 20px;
    }
    .weekly-news-paragraph-title {
        font-weight: bold;
        color: #767676;
        padding-bottom: 5px;
    }
    .weekly-news-section {
        overflow: hidden;
        border: 1px solid darkgrey;
        background-color: #eee;
        padding: 10px;
        margin: 30px 5px 5px 5px;
    }
    .weekly-news-title {
        font-size: 20px;
        color: #167ac6;
        float: left;
        padding-bottom: 10px;
    }
    .weekly-news-sub-title {
        float: right;
        color: #767676;
    }
    .weekly-news-image-right {
        margin-left: 15px;
        margin-bottom: 15px;
        font-size: 14px;
        font-style: italic;
        float: right;
        width: 500px;
    }
    h4 {
        margin-top: 40px;
    }

    hr {
    height: 1px;
    color: #9c3636;
    background-color: #9c3636;
    border: none;
    }

</style>

<div class="container">

    <div class="row">

        <div class="col-md-12" style="padding-top: 40px;">
            <h1>
                Our Mission:
            </h1>
            <hr/>
            <p>
                At ag-Grid, our mission is simple:
            </p>
               
            <h3>
                Build the best data grid in the world.
            </h3>
            <br/>
            </p>

            <p>
                Born out of frustration with existing solutions, ag-Grid evolved from a side project to becoming the leading JavaScript datagrid on the market. We are a company built by developers for developers, and - true to our roots - we offer ag-Grid Free: an open-source project that delivers world class grid performance. ag-Grid Enterprise is our commercially-licensed offering which has enjoyed widespread adoption and permits us to keep delivering on our mission.
            </p>

            <p>    
                Our story is proof that necessity is the mother of invention. During his time working in London-based financial institutions, Niall Crosby - founder and CEO - struggled to find any datagrid component that could deliver the performance required in tandem with a complete feature list. This struggle ultimately led Niall to pulling out the keyboard one Christmas holiday period and starting ag-Grid as a side project. This was then released as open source and quickly developed a following. 
            </p>

            <p>
                Niall found himself having to devote considerable time and effort to maintaining ag-Grid, even fielding feature requests from users. It became apparent that this thing had legs - and the idea of ag-Grid Enterprise took seed in Niall’s mind. Fast forward to March 2016 and the first commercial version was launched.
            </p>

            <p>
                Today, ag-Grid is a self-funded, bootstrapped company with over 750 customers in 52 countries. Our product has resonated in the market - as our users face the same challenges Niall did - and this has been central to our rapid growth. And we’re not stopping here: we are furiously working on the next great features to continue our mission.
            </p>

            <h2>
                Our Principles:
            </h2>
            <hr/>
            <p>
                We believe that a datagrid should be agnostic to the framework that developers choose. This allows flexibility and future-proofs your development. This is also where the 'ag' in ag-Grid comes from.
            </p>

            <p>    
                Our experience is in building Enterprise applications: we know that the datagrid is at the core of an Enterprise application, and needs to deliver performance and a rich feature set. 
            </p>

            <p>
                We give away what others charge for - ag-Grid Free provides all of the features of our competion. We only charge when we go above and beyond, with features that other grids don’t provide.
            </p>
        </div> 

    </div>

    <div class="row">

        <div class="col-md-12" style="padding-top: 40px;">

            <h2 id="tech_team">
                The Technical Team:
            </h2>
            <hr/>

        </div> 

    </div>

    <div class="row" style="margin-top: 50px;">

        <div class="col-md-4">
            <div>
                <img src='images/team/niall.jpg'/>
            </div>
            <h3>Niall Crosby</h3>
            <h4>Niall Crosby, CEO & CTO</h4>
            <p>
                Niall provides the technical vision for ag-Grid, juggling this with the usual CEO duties. 15 years of experience building Enterprise applications has given Niall unique insight into the challenges while equipping him with the technical skills to deliver the correct solutions. Niall focuses primarily on developing and maintaining the core of ag-Grid and is very much at the heartbeat of the company.
            </p>
        </div>

        <div class="col-md-4">
            <div>
                <img src='images/team/sean.jpg'/>
            </div>
            <h3>Sean Landsman</h3>
            <h4>Lead Developer - Frameworks</h4>
            <p>
                Sean was the first person that Niall asked to join the team. Sean ensures that we can keep the agnostic in ag-Grid... he is responsible for integrating with all of our supported frameworks. Many of customers will be familiar with Sean as he is very active in our user forums supporting the needs of our customers. He has also recently given a number of talks at conferences where his calm manner belies his years of experience.
            </p>
        </div>

        <div class="col-md-4">
            <div>
                <img src='images/team/alberto.jpg'/>
            </div>
            <h3>Alberto Gutierrez</h3>
            <h4>Lead Developer - Data Internals</h4>
            <p>
                Alberto joined the team in early 2017 and further broadens the Enterprise applications experience. With over 15 years across multiple industries, Alberto has been involved in all aspects of the software development lifecycle. He has joined Niall in enhancing and expanding the core features of the grid as well as contributing technical and industry knowledge. 
            </p>
        </div>

    </div>

    <div class="row" style="margin-top: 50px;">

        <div class="col-md-4">
            <div>
                <img src='images/team/rob.jpg'/>
            </div>
            <h3>Rob Clarke</h3>
            <h4>Lead Developer - Enterprise Applications</h4>
            <p>
                Rob is a Software Architect and Developer who specialises in complex data-centric enterprise applications within Finance. He is expert in numerous server and client side programming languages and technologies which he uses to drive forward the core engine of ag-Grid.
            </p>
        </div>

        <div class="col-md-4">
            <div>
                <img src='images/team/petyo.jpg'/>
            </div>
            <h3>Petyo Ivanov</h3>
            <h4>Lead Developer - UI</h4>
            <p>
                With more than a decade of experience in front-end web technologies, Petyo ensures that ag-Grid takes advantage of industry best practice. He is also charged with improving the look and feel of the grid and the overall user experience.
            </p>
        </div>

        <div class="col-md-4">
            <div>
                <img src='images/team/sophia.jpg'/>
            </div>
            <h3>Sophia Lazarova</h3>
            <h4>Developer Advocate</h4>
            <p>
                Sophia is an active JavaScript community member and regularly speaks at
                meetups and conferences. As a developer advocate her goal is to help
                users of ag-Grid have an excellent experience with our product.
            </p>
        </div>

    </div>

    <div class="row">

        <div class="col-md-12" style="padding-top: 40px;">

            <h2 id="customer_team">
                The Customer Experience Team:
            </h2>
            <hr/>

        </div> 

    </div>

    <div class="row" style="margin-top: 50px;">
    
        <div class="col-md-4">
            <div>
                <img src='images/team/john.jpg'/>
            </div>
            <h3>John Masterson</h3>
            <h4>Customer Experience Manager</h4>
            <p>
                John was the first business focused hire at ag-Grid and joined in late 2016 to manage and grow the customer base. He has an operations and product management background and has always focused on the end user of technology. John is always available to deal with customer queries as well as building ag-Grid's infrastructure for growth.
            </p>
        </div>

        <div class="col-md-4">
            <div>
                <img src='images/team/bas.jpg'/>
            </div>
            <h3>Bas Rahman</h3>
            <h4>Customer Experience Team</h4>
            <p>
                Bas joined the team to manage our evergrowing customer base - she has broad experience in dealing with customers and internal stakeholders from previous roles in startups and 
                consulting companies.
            </p>
        </div>

        <div class="col-md-4">
            <div>
                <img src='images/team/dimple.jpg'/>
            </div>
            <h3>Dimple Unalkat</h3>
            <h4>Customer Experience Team</h4>
            <p>
                Dimple also joined as we expanded our customer team. She brings a wealth of sales and customer service experience from her previous roles in B2B sales.
            </p>
        </div>

    </div>

    <div class="row">

        <div class="col-md-12" style="padding-top: 40px;">

            <h2 id="contact">
                Contact Us
            </h2>
            <hr/>

        </div> 

    </div>

    <div class="row" style="margin-top: 50px;">
         <div class="col-md-6">
            <p>
            Our Address:

            <address>
            <strong>ag-Grid Ltd.</strong><br>
            The Treehouse, 2-10 Balham Station Road<br>
            London, SW12 9SG
            United Kingdom<br>

            <p> 

            <p>Email Enquiries:</p>
            <abbr title="email">accounts@ag-grid.com
            </address>

            </p>
        </div>

        <div class="col-md-6" style="border: 1px solid grey; background: #fafafa; padding: 20px;">
            <img src="../images/jobs-board.png" style="width: 150px; float: left; margin-right: 20px;"/>

            <p>
                We are always looking for Javascript Developers with Enterprise Applications experience.
            </p>
            <p>
                Check the <a href="./ag-grid-jobs-board/">jobs board</a>.
            </p>

        </div>
    </div> <!-- end row -->
</div>

</div>

<?php include("includes/footer.php"); ?>

</body>

<?php include_once("includes/analytics.php"); ?>

</html>
