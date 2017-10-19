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

            <p>In Part 2 of this Series, we go into more detail into the Middle Tier, exposing our data via a REST
                service.</p>

            <h2>Series Chapters</h2>

            <ul>
                <li><a href="../ag-grid-datagrid-crud-part-1/">Part 1</a>: Introduction & Initial Setup: Maven, Spring
                    and JPA/Backend (Database)
                </li>
                <li class="bold-roboto">Part 2: Middle Tier: Exposing our data with a REST Service</li>
                <li>Part 3: Front End - Initial Implementation</li>
                <li>Part 4: Front End - Grid Features & CRUD (Creation, Updates and Deletion)</li>
                <li>Part 5: Front End - Aggregation & Pivoting</li>
                <li>Part 6: Front End - Enterprise Row Model</li>
                <li>Part 7: Packaging (Optional)</li>
                <li>Part 8: Back End (Optional) - Using Oracle DB</li>
            </ul>

            <h2>Introduction</h2>

            <note>The completed code for this blog series can be found <a
                        href="https://github.com/seanlandsman/ag-grid-crud">here (once the series is complete)</a>,
                with this particular section being under <a
                        href="https://github.com/seanlandsman/ag-grid-crud/tree/part-2">Part
                    2</a></note>

            <p>
                In order for our data to be useful we need to make it available to users. One of hte easiest ways to do
                that
                is to expose it as a <a href="https://en.wikipedia.org/wiki/Representational_state_transfer">REST
                    Service</a>,
                which ties in nicely with CRUD operations - there is a one to one mapping with each of the Create,
                Retrieve, Update and Delete
                operations that CRUD specifies.
            </p>

            <p>We'll again make use of Spring to expose the data via a REST service. Again we do this as Spring will
                remove a great
                deal of the boilerplate that providing this functionality by hand would necessitate.</p>

            <h3>Rest Controllers</h3>

            <p>We can provide REST services via Rest Controllers. In most of the services we'll expose we'll generally
                just
                pass through to one of the methods provided by our <code>Repositories</code>. In a real world
                application you'd
                want to provide authentication of user requests and so on. </p>

            <p>To define a <code>RestController</code> all we need to do is annotate a class as follows:</p>

            <snippet language="java">@RestController
                public class AthleteController {
            </snippet>

            <p>We want to return all the Olympic Data we have in the first pass and in order to do that we need to use
                our </code>AthleteRepository</p>. Let's create a constructor that will take this repository (Spring will
            automatically inject it for us) and create a method that uses it:

            <snippet language="java">
                private AthleteRepository athleteRepository;

                public AthleteController(AthleteRepository athleteRepository) {
                this.athleteRepository = athleteRepository;
                }

                @GetMapping("/athletes")
                public Iterable
                <Athlete> getAthletes() {
                    return athleteRepository.findAll();
                    }
            </snippet>

            <p>What the <code>GetMapping</code> does is provide a mapping to our application via a URL.</p>
            <p>In our case the full mapping would be:</p>

            <snippet>http://localhost:8080/athletes</snippet>

            <p>The base URL (<code>http://localhost:8080</code>) can vary based on how you deploy your application, but
                the actual mapping
                (<code>/athletes</code>) would be the same.</p>

            <p>As you can see from our implementation we're simply delegating down to the repository in this case,
                returning the data
                it provides. Again in a real world application you might want to secure your information in some
                way.</p>

            <p>(Scroll <a href="#athleteController">down</a> to see the full source code for
                <code>AthleteController</code>.)</p>

            <p>With this in place if we now start our application and navigate to
                <code>http://localhost:8080/athletes</code> in
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

            <p>So far we've been concentrating on getting data out of our database. Let's switch focus to the remaining
                Create,
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
                        <td>Update multiple existing <code style="padding-right: 0">Result</code><span
                                    style="font-size: small">s</span></td>
                        <td>List of <code>Result</code> Objects</td>
                    </tr>
                    <tr>
                        <td>Delete an existing <code>Result</code></td>
                        <td><code>Result</code> ID</td>
                    </tr>
                </table>
            </div>

            <p>There are of course many more types of updates you might wish to perform. The above should however
                illustrate
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
            <p>As you can see, just about any operation you're likely to need has been provided here, which is
                great.</p>

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
                        <td>Update multiple existing <code style="padding-right: 0">Result</code><span
                                    style="font-size: small">s</span></td>
                        <td><code>&lt;S extends T&gt; Iterable&lt;S&gt; saveAll(Iterable&lt;S&gt; iterable);</code></td>
                    </tr>
                    <tr>
                        <td>Delete an existing <code>Result</code></td>
                        <td><code>void deleteById(ID id);</code></td>
                    </tr>
                </table>
            </div>

            <p>In an application with more real-world requirements you'd almost certainly make use of some of the other
                methods provided.</p>

            <p>As all four operations affect existing <code>Athlete</code> objects, we'll expose these operation on the
                <code>AthleteController</code> (although you might want update <code>Results</code> directly).</p>

            <h3>AthleteController</h3>

            <p>The completed controller is pretty simple - each of the calls for the above requirements simply delegates
                to the <code>AthleteRepository</code>.</p>

            <p>Again, in a real-world application your controller would probably delegate to a <code>Service</code> that
                might
                perform some business specific logic.</p>


            <h4>Testing Our Progress</h4>

            <p>We'll make use of the supplied packaged <code>jUnit</code> testing framework. The Spring Boot project we
                downloaded already includes a single test class: <code>CrudAppApplicationTests</code>. Let's rename this
                to
                <code>AthleteControllerTests</code> and empty the contents of the class.</p>

            <p>We'll start off with a simple test that confirms that we have the expected number of <code>Athlete</code>
                records in our database.
                As our controller is nothing more than a REST Service with little logic within we can make use of the
                Spring
                supplied <code>TestRestTemplate</code>.</p>

            <p>This class makes it very easy to perform high level REST calls, which is exactly what we're after
                here.</p>

            <p>Note that in a real world application you'd almost certainly want to write unit tests all the way up to
                integration tests.
                In this guide we're focusing more on illustrating how to do front to back end with ag-Grid, so will not
                delve too
                deeply into the testing side of things.</p>

            <snippet language="java">
                // makes the rest call, converting the results within the response body to an array of Athletes
                ResponseEntity
                <Athlete
                        []> response = restTemplate.getForEntity(createURLWithPort("/athletes"), Athlete[].class);

                    // unpack the result
                    Athlete[] athletes = response.getBody();
            </snippet>

            <p>The rest of the tests follow the same pattern - the completed <code>AthleteController</code> and
                <code>AthleteControllerTests</code> can be seen here:</p>

            <show-sources id="athleteController"
                          example=""
                          sources="{
                            [
                                { root: './crud-app/controllers/', files: 'AthleteController.java,AthleteControllerTests.java' },
                            ]
                          }"
                          language="java"
                          highlight="true"
                          exampleHeight="665px">
            </show-sources>

            <p style="margin-top: 15px">With all of that in place, we can now run the test as follows:</p>

            <snippet>mvn clean test</snippet>

            <snippet>
                Results :

                Tests run: 5, Failures: 0, Errors: 0, Skipped: 0

                [INFO] ------------------------------------------------------------------------
                [INFO] BUILD SUCCESS
                [INFO] ------------------------------------------------------------------------
                [INFO] Total time: 14.679 s
                [INFO] Finished at: 2017-10-04T15:37:17+01:00
                [INFO] Final Memory: 31M/321M
                [INFO] ------------------------------------------------------------------------
            </snippet>
            <p>Great, so far so good. We've verified that the middle tier code we've written for the 4 use-cases above
                will work
                once invoked by the front end!</p>

            <h2>Summary</h2>

            <p>We have now completed our backend and middle tier implementation, all ready to make a start on the front
                end!</p>

            <p>In the next part we'll complete the scaffolding for our Angular application, including displaying our
                data in our
                first grid.</p>

            <p>See you next time!</p>
        </div>
        <div class="col-md-3">

            <div>
                <a href="https://twitter.com/share" class="twitter-share-button"
                   data-url="https://www.ag-grid.com/ag-grid-datagrid-crud-part-2/"
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
