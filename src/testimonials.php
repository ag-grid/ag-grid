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

<?php $navKey = "testimonials"; include 'navbar.php'; ?>

<?php $headerTitle = "Testimonials"; include 'headerRow.php'; ?>


<div class="container">

    <div class="row">
        <div class="col-md-12">
            <div class="PageContent">
                <figure class="Testimonials-item col-md-4 col-sm-4 col-xs-12">
                  <blockquote>We love Ag-grid for its simple integration, blazing-fast performance, and friendly community.</blockquote>
                  <div class="author">
                    <h5>Lucas Val</h5><span>VP of Product Development at Hexonet Services Inc</span>
                  </div>
                </figure>
                <figure class="Testimonials-item col-md-4 col-sm-4 col-xs-12">
                  <blockquote>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.</blockquote>
                  <div class="author">
                    <h5>Joe Bloggs</h5><span>Disney World</span>
                  </div>
                </figure>
                <figure class="Testimonials-item col-md-4 col-sm-4 col-xs-12">
                  <blockquote>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.</blockquote>
                  <div class="author">
                    <h5>John Smith</h5><span>Disney World</span>
                  </div>
                </figure>
            </div>
        </div> <!-- end col -->
    </div> <!-- end row -->

    <div class="row">
        <div class="col-md-9">    
            <hr/>
            <h3>Add your own Testimonial</h3>
            <p>Use the form below to add your own testimonial:</p>
            <div id="disqus_thread"></div>
            <script type="text/javascript">
                /* * * CONFIGURATION VARIABLES * * */
                var disqus_shortname = 'aggrid';

                /* * * DON'T EDIT BELOW THIS LINE * * */
                (function() {
                    var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
                    dsq.src = '//' + disqus_shortname + '.disqus.com/embed.js';
                    (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
                })();
            </script>
            <noscript>Please enable JavaScript to view the <a href="https://disqus.com/?ref_noscript" rel="nofollow">comments powered by Disqus.</a></noscript>
        </div> <!-- end col -->
    </div> <!-- end row -->
</div>



<?php include("footer.php"); ?>

</body>

<?php include_once("analytics.php"); ?>

</html>