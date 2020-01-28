<?php

$pageTitle = "ag-Grid Blog: Building a CRUD Application with ag-Grid Part 2";
$pageDescription = "In Part 2 of this Series, we go into more detail into the Middle Tier, exposing our data via a REST service.";
$pageKeyboards = "ag-grid datagrid crud enterprise";

$socialUrl = "https://www.ag-grid.com/ag-grid-datagrid-crud-part-2/";
$socialImage = "https://www.ag-grid.com/ag-grid-datagrid-crud-part-1/crud_overview.png?" . uniqid();

include('../includes/mediaHeader.php');
?>

<h1 style="margin-top: 0;">Building a CRUD Application with ag-Grid - Part 2</h1>
<p class="blog-author">Sean Landsman | 7th November 2017</p>
<div>
    <a href="https://twitter.com/share" class="twitter-share-button"
       data-url="https://www.ag-grid.com/ag-grid-datagrid-crud-part-2/"
       data-text="Building a CRUD application with ag-Grid Part 2" data-via="seanlandsman"
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
<div class="row" ng-app="documentation">
    <div class="col-md-8">

        <h2>Summary</h2>

        <p>In Part 2 of this Series, we go into more detail into the Middle Tier, exposing our data via a REST
            service.</p>

        <h2>Series Chapters</h2>

        <ul class="content">
            <li><a href="../ag-grid-datagrid-crud-part-1/">Part 1</a>: Introduction & Initial Setup: Maven, Spring
                and JPA/Backend (Database)
            </li>
            <li class="bold-roboto">Part 2: Middle Tier: Exposing our data with a REST Service</li>
            <li><a href="../ag-grid-datagrid-crud-part-3/">Part 3</a>: Front End - Initial Implementation</li>
            <li>Part 4: Front End - Grid Features & CRUD (Creation, Updates and Deletion)</li>
        </ul>

        <h2>Introduction</h2>

        <note>The completed code for this blog series can be found <a
                    href="https://github.com/seanlandsman/ag-grid-crud">here (once the series is complete)</a>,
            with this particular section being under <a
                    href="https://github.com/seanlandsman/ag-grid-crud/tree/part-2">Part
                2</a></note>

        <note img="'../ag-grid-datagrid-crud-part-1/updated_transparent.png'" height="'50'" width="'123'">
            <p>One part of this entry of the series have been updated as the result of a bug I found later on.</p>
            <p>Look for the <code>Updated!</code> note (like this one) - its in <code>AthleteController</code> section.
            </p>
            <p>The lesson here? Write more tests folks!</p>
        </note>

        <p>
            In order for our data to be useful we need to make it available to users. One of the easiest ways to do
            that
            is to expose it as a <a href="https://en.wikipedia.org/wiki/Representational_state_transfer">REST
                Service</a>,
            which ties in nicely with CRUD operations - there is a one to one mapping with each of the Create,
            Retrieve, Update and Delete
            operations that CRUD specifies.
        </p>

        <p>We'll again make use of Spring to expose the data via a REST service. We do this using Spring,
            doing so by hand would be tedious and involve a great deal of boilerplate.</p>

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
            our <code>AthleteRepository</code>. Let's create a constructor that will take this repository (Spring will
            automatically inject it for us) and create a method that uses it:</p>

        <snippet language="java">private AthleteRepository athleteRepository;

public AthleteController(AthleteRepository athleteRepository) {
    this.athleteRepository = athleteRepository;
}

@GetMapping("/athletes")
public Iterable &lt;Athlete&gt; getAthletes() {
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
  }
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

        <snippet language="java">public interface CrudRepository &lt;T, ID&gt; extends Repository&lt;T,ID&gt; {
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
                    <td>Update an existing <code>Athlete</code>, supplying a "detached" version<span
                                style="font-weight: bold">*</span></td>
                    <td><code>&lt;S extends T&gt; S save(S s);</code></td>
                </tr>
                <tr>
                    <td>Update multiple existing <code style="padding-right: 0">Result</code><span
                                style="font-size: small">s</span></td>
                    <td nowrap><code>Iterable&lt;S&gt; saveAll(Iterable&lt;S&gt; iterable);</code></td>
                </tr>
                <tr>
                    <td>Delete an existing <code>Result</code></td>
                    <td><code>void deleteById(ID id);</code></td>
                </tr>
            </table>
        </div>

        <p><span style="font-weight: bold">*</span> A detached version being a version Spring/JPA/Hibernate is not
            currently aware of. This will be the case when we pass in an existing <code>Athlete</code> via the REST
            service, later.</p>

        <p>In an application with more real-world requirements you'd almost certainly make use of some of the other
            methods provided.</p>

        <p>As all four operations affect existing <code>Athlete</code> objects, we'll expose these operation on the
            <code>AthleteController</code> (although you might want update <code>Results</code> directly).</p>

        <h3>AthleteController</h3>

        <note img="'../ag-grid-datagrid-crud-part-1/updated_transparent.png'" height="'50'" width="'123'">
            <p>Added a new test to test the scenario where we supply a detached <code>Athlete</code> in to be
                updated/saved.</p>
        </note>

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

        <snippet language="java">// makes the rest call, converting the results within the response body to an array of Athletes
ResponseEntity&lt;Athlete[]&gt; response = restTemplate.getForEntity(createURLWithPort("/athletes"), Athlete[].class);

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
[INFO] Results:
[INFO]
[INFO] Tests run: 6, Failures: 0, Errors: 0, Skipped: 0
[INFO]
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time: 14.372 s
[INFO] Finished at: 2017-11-30T15:49:20Z
[INFO] Final Memory: 37M/383M
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

        <div style="background-color: #eee; padding: 10px; display: inline-block;">

            <div style="margin-bottom: 5px;">If you liked this article then please share</div>

            <table style="background-color: #eee;">
                <tr>
                    <td>
                        <script type="text/javascript" src="//www.redditstatic.com/button/button1.js"></script>
                    </td>
                    <td>
                        &nbsp;&nbsp;&nbsp;
                    </td>
                    <td>
                        <a href="https://twitter.com/share" class="twitter-share-button"
                           data-url="https://www.ag-grid.com/ag-grid-datagrid-crud-part-2/"
                           data-text="Building a CRUD Application with ag-Grid Part 2 #angular #aggrid #crud"
                           data-via="seanlandsman"
                           data-size="large">Tweet</a>
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
                    </td>
                </tr>
            </table>
        </div>

    </div>

    <?php include '../blog-authors/sean.php'; ?>
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

<?php
include('../includes/mediaFooter.php');
?>
