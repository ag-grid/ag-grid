<?php

$pageTitle = "Blog: Building a CRUD Application with ag-Grid Part 2";
$pageDescription = "Building a CRUD Application with ag-Grid Part 2";
$pageKeyboards = "ag-grid datagrid crud enterprise";

include('../includes/mediaHeader.php');
?>

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

            <p>In Part 2 of this Series, we go into more detail into the Middle Tier, exposing our data via a REST service.</p>

            <h2>Series Chapters</h2>

            <ul>
                <li><a href="../ag-grid-datagrid-crud-part-1">Part 1</a>: Introduction & Initial Setup: Maven, Spring and JPA/Backend (Database)</li>
                <li>Part 2: Middle Tier: Exposing our data with a REST Service</li>
                <li><a href="../ag-grid-datagrid-crud-part-3">Part 3</a>: Front End - Initial Implementation</li>
                <li><a href="../ag-grid-datagrid-crud-part-4">Part 4</a>: Front End - Aggregation & Pivoting</li>
                <li><a href="../ag-grid-datagrid-crud-part-5">Part 5</a>: Front End - Enterprise Row Model</li>
                <li><a href="../ag-grid-datagrid-crud-part-6">Part 6</a>: Back End (Optional) - Using Oracle DB</li>
            </ul>

            <h2>Introduction</h2>
            <p>
                In order for our data to be useful we need to make it available to users. One of hte easiest ways to do that
                is to expose it as a <a href="https://en.wikipedia.org/wiki/Representational_state_transfer">REST Service</a>,
                which ties in nicely with CRUD operations - there is a one to one mapping with each of the Create, Retrieve, Update and Delete
                operations that CRUD specifies.
            </p>

            <p>We'll again make use of Spring to expose the data via a REST service. Again we do this as Spring will remove a great
            deal of the boilerplate that providing this functionality by hand would necessitate.</p>

            <h3>Rest Controllers</h3>

            <p>We can provide REST services via Rest Controllers. In most of the services we'll expose we'll generally just
            pass through to one of the methods provided by our <code>Repositories</code>. In a real world application you'd
            want to provide authentication of user requests and so on. </p>

            <p>To define a <code>RestController</code> all we need to do is annotate a class as follows:</p>

<snippet language="java">
@RestController
public class OlympicResultsController {
</snippet>

            <p>With this in place Spring is aware of the role we want this class to play. Now let's add method to this class
                and annotate it with <code>RequestMapping</code>:</p>

<snippet language="java">
@RequestMapping("/olympicData")
public Iterable<Athlete> getOlympicData() {
    return athleteRepository.findAll();
}
</snippet>

            <p>What the <code>RequestMapping</code> does is provide a mapping to our application via a URL.</p>
            <p>In our case the full mapping would be:</p>

<snippet>http://localhost:8080/olympicData</snippet>

            <p>The base URL (http://localhost:8080) can vary based on how you deploy your application, but the actual mapping
            (/olympicData) would be the same.</p>

            <p>As you can see from our implementation we're simply delegating down to the repository in this case, returning the data
            it provides. Again in a real world application you might want to secure your information in some way.</p>

            <show-sources example=""
                          sources="{
                            [
                                { root: './crud-app/controllers/', files: 'OlympicResultsController.java' },
                            ]
                          }"
                          language="java"
                          highlight="true"
                          exampleHeight="500px">
            </show-sources>
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
