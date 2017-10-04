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

<snippet language="java">@RestController
public class OlympicResultsController {
</snippet>

            <p>With this in place Spring is aware of the role we want this class to play. Now let's add method to this class
                and annotate it with <code>RequestMapping</code>:</p>

<snippet language="java">@RequestMapping("/olympicData")
public Iterable<Athlete> getOlympicData() {
    return athleteRepository.findAll();
}
</snippet>

            <p>What the <code>RequestMapping</code> does is provide a mapping to our application via a URL.</p>
            <p>In our case the full mapping would be:</p>

<snippet>http://localhost:8080/olympicData</snippet>

            <p>The base URL (<code>http://localhost:8080</code>) can vary based on how you deploy your application, but the actual mapping
            (<code>/olympicData</code>) would be the same.</p>

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
                          exampleHeight="400px">
            </show-sources>

            <p>With this in place if we now start our application and navigate to <code>http://localhost:8080/olympicData</code> in
            a browser you should see something like this (formatted here for clarity):</p>

<snippet>
[
    {
        "name": "Robin Beauregard",
        "country": {
            "id": 33,
            "name": "United States"
        },
        "results": [
            {
                "age": 25,
                "year": 2004,
                "date": "29/08/2004",
                "gold": 0,
                "silver": 0,
                "bronze": 1,
                "sport": {
                    "id": 112,
                    "name": "Waterpolo"
                }
            },
            {
                "age": 21,
                "year": 2000,
                "date": "01/10/2000",
                "gold": 0,
                "silver": 1,
                "bronze": 0,
                "sport": {
                    "id": 112,
                    "name": "Waterpolo"
                }
            }
        ]
    },
    ...further records
</snippet>

        <p>Great, so far so good!</p>

        <h3>Updating Data</h3>

        <p>So far we've been concentrating on getting data out of our database. Let's switch focus to the remaining Create,
            Update and Delete operations that CRUD provides.</p>

        <p>Before we can do so we need to consider what sort of updates we want to perform in our application.</p>

        <p>For our purposes we're going to implement the following sorts of updates:</p>

<div style="border: solid 1px lightgrey;border-radius: 5px;padding: 10px;margin-bottom: 10px">
        <table style="border-collapse:collapse;width: 100%;">
            <tr style="border-bottom:1pt solid black;">
                <th>Type of Update</th>
                <th>Parameter(s) Required</th>
            </tr>
            <tr>
                <td>Create a new <code>Result</code> for a given <code>Athlete</code></td>
                <td><code>Athlete</code>'s ID, new <code>Result</code> object to be created</td>
            </tr>
            <tr>
                <td>Update an existing <code>Result</code></td>
                <td><code>Result</code> Object</td>
            </tr>
            <tr>
                <td>Update multiple existing <code style="padding-right: 0">Result</code><span style="font-size: small">s</span></td>
                <td>List of <code>Result</code> Objects</td>
            </tr>
            <tr>
                <td>Delete an existing <code>Result</code></td>
                <td><code>Result</code> ID</td>
            </tr>
        </table>
</div>

            <p>There are of course many more types of updates you might wish to perform. The above should however illustrate
            the different types of update which you can then use in other scenarios.</p>

            <p>Let's take a look at what operations the <code>CrudRepository</code> provides for us:</p>
            
<snippet language="java">
public interface CrudRepository &lt;T, ID&gt; extends Repository&lt;T,ID&gt; {
    &lt;S extends T&gt; S save(S s);
    
    &lt;S extends T&gt; Iterable&lt;S&gt; saveAll(Iterable&lt;S&gt; iterable);
    
    Optional&lt;T&gt; findById(ID id);
    
    boolean existsById(ID id);
    
    Iterable&lt;T&gt; findAll();
    
    Iterable&lt;T&gt; findAllById(Iterable&lt;ID&gt; iterable);
    
    long count();
    
    void deleteById(ID id);
    
    void delete(T t);
    
    void deleteAll(Iterable&lt;? extends T&gt; iterable);

    void deleteAll();
}
</snippet>
            <p>As you can see, just about any operation you're likely to need has been provided here, which is great.</p>

            <p>In our simple application however, we can map our user cases to the following two methods:</p>

            <div style="border: solid 1px lightgrey;border-radius: 5px;padding: 10px;margin-bottom: 10px">
                <table style="border-collapse:collapse;width: 100%;">
                    <tr style="border-bottom:1pt solid black;">
                        <th>Type of Update</th>
                        <th><code>CrudRepository</code> Method</th>
                    </tr>
                    <tr>
                        <td>Create a new <code>Result</code> for a given <code>Athlete</code></td>
                        <td><code>&lt;S extends T&gt; S save(S s);</code></td>
                    </tr>
                    <tr>
                        <td>Update an existing <code>Result</code></td>
                        <td><code>&lt;S extends T&gt; S save(S s);</code></td>
                    </tr>
                    <tr>
                        <td>Update multiple existing <code style="padding-right: 0">Result</code><span style="font-size: small">s</span></td>
                        <td><code>&lt;S extends T&gt; Iterable&lt;S&gt; saveAll(Iterable&lt;S&gt; iterable);</code></td>
                    </tr>
                    <tr>
                        <td>Delete an existing <code>Result</code></td>
                        <td><code>void deleteById(ID id);</code></td>
                    </tr>
                </table>
            </div>

            <p>In an application with more real-world requirements you'd almost certainly make use of some of the other methods provided.</p>

            <p>As all four operations affect existing <code>Athlete</code> objects, we'll expose these operation on the
            <code>AthleteController</code> (although you might want update <code>Results</code> directly).</p>

            <h4>Testing</h4>

            <p>Before we start making changes to our <code>AthleteController</code>, how are going to test them?  We don't
            have a front end in place yet after all!</p>

            <p>We'll make use of the supplied packaged <code>jUnit</code> testing framework. The Spring Boot project we
            downloaded already includes a single test class: <code>CrudAppApplicationTests</code>. Let's rename this to
            <code>AthleteControllerTests</code> and empty the contents of the class.</p>

            <p>Let's start off with a simple test that confirms that we have the expected number of <code>Athlete</code> records in our database.
            As our controller is nothing more than a REST Service with little logic within we can make use of the Spring
                supplied <code>TestRestTemplate</code>.</p>

            <p>This class makes it very easy to perform high level REST calls, which is exactly what we're after here.</p>

            <p>Note that in a real world application you'd almost certainly want to write unit tests all the way up to integration tests.
            In this guide we're focusing more on illustrating how to do front to back end with ag-Grid, so will not delve too
            deeply into the testing side of things.</p>

            TODO AthleteControllerTests source code goes here

<snippet language="java">
// makes the rest call, converting the results within the response body to an array of Athletes
ResponseEntity<Athlete[]> response = restTemplate.getForEntity(createURLWithPort("/olympicData"), Athlete[].class);

// unpack the result
Athlete[] athletes = response.getBody();
</snippet>

            <p>We can now run the test as follows:</p>

<snippet>mvn clean test</snippet>

            <p>Great, so far so good. We've verified that we will return the expected results for first service we wrote.</p>

            <p>Let's move onto writing a test for a service we've not yet written - creating a new <code>Athlete</code>:</p>
        </div>
        <div class="col-md-3">

            <div>
                <a href="https://twitter.com/share" class="twitter-share-button"
                   data-url="https://www.ag-grid.com/ag-grid-react-datagrid/"
                   data-text="Building a CRUD application with ag-Grid" data-via="seanlandsman"
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
                    it'llLead Developer - Frameworks
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
