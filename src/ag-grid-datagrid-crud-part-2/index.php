<?php

$pageTitle = "Blog: Building a CRUD Application with ag-Grid Part 2";
$pageDescription = "Building a CRUD Application with ag-Grid Part 2";
$pageKeyboards = "ag-grid datagrid crud enterprise";

include('../includes/mediaHeader.php');
?>

<link rel="stylesheet" href="../documentation-main/documentation.css">
<script src="../documentation-main/documentation.js"></script>

<div class="row">
    <div class="col-sm-2" style="padding-top: 20px;">
        <img style="vertical-align: baseline;" src="../images/logo/SVG_ag_grid_bright-bg.svg" width="120px"/>
    </div>
    <div class="col-sm-10" style="padding-top: 40px;">
        <h1 style="margin-top: 0;">Building a CRUD Application with ag-Grid - Part 2</h1>
    </div>
    <div class="row" ng-app="documentation">
        <div class="col-md-9">

            <h2>Summary</h2>

            <p>In Part 2 of this Series, we go into detail into the Backend - the model and how to use the H2 database.</p>

            <h2>Series Chapters</h2>

            <ul>
                <li><a href="../ag-grid-datagrid-crud-part-1">Part 1</a>: Introduction & Initial Setup</li>
                <li>Part 2: Backend (Database)</li>
                <li><a href="../ag-grid-datagrid-crud-part-3">Part 3</a>: Middle Tier (Java, Spring, Hibernate)</li>
                <li><a href="../ag-grid-datagrid-crud-part-4">Part 4</a>: Front End - Initial Implementation</li>
                <li><a href="../ag-grid-datagrid-crud-part-5">Part 5</a>: Front End - Aggregation & Pivoting</li>
                <li><a href="../ag-grid-datagrid-crud-part-6">Part 6</a>: Front End - Enterprise Row Model</li>
                <li><a href="../ag-grid-datagrid-crud-part-7">Part 7</a>: Back End (Optional) - Using Oracle DB</li>
            </ul>

        </div>
        <div class="col-md-3">

            <div>
                <a href="https://twitter.com/share" class="twitter-share-button"
                   data-url="https://www.ag-grid.com/ag-grid-react-datagrid/"
                   data-text="Building a React Datagrid Using Redux and ag-Grid" data-via="seanlandsman"
                   data-size="large">Tweet</a>
                <script>!function (d, s, id) {
                        var js, fjs = d.getElementsByTagName(s)[0], p = /^http:/.test(d.location) ? 'http' : 'https';
                        if (!d.getElementById(id)) {
                            js = d.createElement(s);
                            js.id = id;
                            js.src = p + '://platform.twitter.com/widgets.js';
                            fjs.parentNode.insertBefore(js, fjs);
                        }
                    }(document, 'script', 'twitter-wjs');</script>
            </div>

            <div style="font-size: 14px; background-color: #dddddd; padding: 15px;">

                <p><img src="../images/sean.png"/></p>
                <p style="font-weight: bold;">
                    Sean Landsman
                </p>
                <p>
                    Sean was the first person that Niall asked to join the team. Sean ensures that we can keep the
                    agnostic in ag-Grid... he is responsible for integrating with all of our supported frameworks. Many
                    of customers will be familiar with Sean as he is very active in our user forums supporting the needs
                    of our customers. He has also recently given a number of talks at conferences where his calm manner
                    belies his years of experience.
                </p>
                <p>
                    Lead Developer - Frameworks
                </p>

                <div>
                    <br/>
                    <a href="https://www.linkedin.com/in/sean-landsman-9780092"><img src="../images/linked-in.png"/></a>
                    <br/>
                    <br/>
                    <a href="https://twitter.com/seanlandsman" class="twitter-follow-button" data-show-count="false"
                       data-size="large">@seanlandsman</a>
                    <script>!function (d, s, id) {
                            var js, fjs = d.getElementsByTagName(s)[0],
                                p = /^http:/.test(d.location) ? 'http' : 'https';
                            if (!d.getElementById(id)) {
                                js = d.createElement(s);
                                js.id = id;
                                js.src = p + '://platform.twitter.com/widgets.js';
                                fjs.parentNode.insertBefore(js, fjs);
                            }
                        }(document, 'script', 'twitter-wjs');</script>
                </div>

            </div>

        </div>
    </div>


    <hr/>

    <div id="disqus_thread"></div>
    <script type="text/javascript">
        /* * * CONFIGURATION VARIABLES * * */
        var disqus_shortname = 'aggrid';

        /* * * DON'T EDIT BELOW THIS LINE * * */
        (function () {
            var dsq = document.createElement('script');
            dsq.type = 'text/javascript';
            dsq.async = true;
            dsq.src = '//' + disqus_shortname + '.disqus.com/embed.js';
            (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
        })();
    </script>
    <noscript>Please enable JavaScript to view the <a href="https://disqus.com/?ref_noscript" rel="nofollow">comments
            powered by Disqus.</a></noscript>
    <hr/>

    <footer class="license">
        © ag-Grid Ltd. 2015-2017
    </footer>

    <?php
    include('../includes/mediaFooter.php');
    ?>
