<?php

$pageTitle = "ag-Grid Blog: Building a CRUD Application with ag-Grid Part 1";
$pageDescription = "Welcome to the first part of the ultimate series on how to build CRUD applications with ag-Grid. It takes you through how to build an application from start to finish.";
$pageKeyboards = "ag-grid datagrid crud enterprise";

$socialUrl = "https://www.ag-grid.com/ag-grid-datagrid-crud-part-1/";
$socialImage = "https://www.ag-grid.com/ag-grid-datagrid-crud-part-1/crud_overview.png?" . uniqid();

include('../includes/mediaHeader.php');
?>

<script type="text/javascript" src="/dist/thickbox/thickbox.js"></script>
<link rel="stylesheet" href="/dist/thickbox/thickbox.css" type="text/css" media="screen" />

<h1 style="margin-top: 0;">Building a CRUD Application with ag-Grid - Part 1</h1>
<p class="blog-author">Sean Landsman | 24th October 2017</p>
<div>
    <a href="https://twitter.com/share" class="twitter-share-button"
       data-url="https://www.ag-grid.com/ag-grid-datagrid-crud-part-1/"
       data-text="Building a CRUD Application with ag-Grid #angular #aggrid #crud"
       data-via="seanlandsman"
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

        <h2>Motivation</h2>

        <p>
            One of the most common scenarios in an Enterprise application is the
            <span class="bold-roboto" style="font-size: larger">C</span>reation,
            <span class="bold-roboto" style="font-size: larger">R</span>etrieval,
            <span class="bold-roboto" style="font-size: larger">U</span>pdating and
            <span class="bold-roboto" style="font-size: larger">D</span>eletion (CRUD!) of records in some backend
            somewhere.
        </p>

        <p>Although there are many ways to implement the backend in a system like this, I describe a simple
            setup here.
            The idea is that I want to convey how simple this can be. Once you're happy with the overall
            concepts it should
            be a trivial exercise to swap out the backend for your preferred one. You will then be able to
            maintain and reuse most
            of the middle and front tiers of the application described.</p>

        <h2>Series Chapters</h2>

        <ul class="content">
            <li class="bold-roboto">Part 1: Introduction & Initial Setup: Maven, Spring and JPA/Backend (Database)
            </li>
            <li><a href="../ag-grid-datagrid-crud-part-2/">Part 2</a>: Middle Tier: Exposing our data with a REST
                Service
            </li>
            <li><a href="../ag-grid-datagrid-crud-part-3/">Part 3</a>: Front End - Initial Implementation</li>
            <li>Part 4: Front End - Grid Features & CRUD (Creation, Updates and Deletion)</li>
        </ul>

        <p>The links above will become active as we publish the the following part of the blog series.</p>

        <h2>Introduction</h2>

        <p>Our application will use the following technologies:</p>

        <ul class="content">
            <li><code>Backend</code>: H2 for the Database (Oracle in a later, optional, chapter)</li>
            <li><code>Middle Tier</code>: Java, Spring, Hibernate</li>
            <li><code>Front End</code>: ag-Grid, Angular 4.x</li>
        </ul>

        <h3>Our Application</h3>

        <note>The completed code for this blog series can be found <a
                    href="https://github.com/seanlandsman/ag-grid-crud">here (once the series is complete)</a>,
            with this particular section being under <a
                    href="https://github.com/seanlandsman/ag-grid-crud/tree/part-1">Part
                1</a></note>

        <note img="'./updated_transparent.png'" height="'50'" width="'123'">
            <p>Two parts of this entry of the series have been updated as the result of a bug I found later on.</p>
            <p>Look for the <code>Updated!</code> note (like this one) - one change is in the Data Model section, while
                the other
                is in the Bootstrapping section.</p>
            <p>The lesson here? Write more tests folks!</p>
        </note>

        <p>Our application will be a reporting tool that looks at past Olympics results. Users will be able to see
            historic results for the Olympic Games from 2000 to 2012 (7 games in all) and be able to see who won the
            most medals for a given year,
            who
            won the most often, which country is - on average - the most successful, and so on.</p>

        <p>In order to focus on the concepts being discussed, the application is deliberately simple - we'll
            implement
            this using a traditional 3 tier model:</p>

        <div style="width:100%;display: flex;justify-content: center;">
            <img src="./three_tier.png" style="margin-left: -150px;height: 325px">
        </div>

        <p>Or alternatively, you can break it down as follows:</p>

        <img src="./architecture.png" style="width: 100%">

        <h2>Initial Setup</h2>

        <h3>Prerequisites</h3>

        <p>In order to follow through this series, a number of tools are required. Please see their
            documentation on
            how to download and install it for your particular Operating System.</p>

        <p>Subsequent sections will assume these tools have been installed and are available for use.</p>

        <ul class="content">
            <li><a href="http://www.oracle.com/technetwork/java/javase/downloads/index.html" target="_blank"> Java 8
                    <i class="fa fa-external-link"></i></a></li>
            <li><a href="https://maven.apache.org/" target="_blank"> Maven 5 <i class="fa fa-external-link"></i></a>
            </li>
            <li><a href="https://nodejs.org/en/" target="_blank"> NodeJS 6 (includes npm) <i
                            class="fa fa-external-link"></i></a></li>
            <li><a href="https://git-scm.com/downloads" target="_blank"> Git <i class="fa fa-external-link"></i></a>
            </li>
        </ul>

        <h3>Spring Initializr</h3>

        <p>For the Backend and Middle Tier, we'll be making use of both Maven and Spring (covered more later in the
            Series). In order to get up and running quickly, we'll make use of Spring Initializr.</p>

        <p>Spring Initializr provides a mechanism to get a Maven setup with specified key dependencies up and
            running
            with very little effort.</p>

        <p>First, let's navigate to <a href="http://start.spring.io/" target="_blank">http://start.spring.io/</a> to
            get started.</p>

        <p>Once there, ensure you fill in the fields as follows:</p>

        <a href="./initialzr.png" class="thickbox"><img src="./initialzr.png" style="width: 100%"/></a>

        <p>The <code>Group</code> and <code>Artifact</code> can be anything you like. For Spring Boot I've chosen
            2.0.0 (SNAPSHOT) as
            this is the latest available version for Spring 5 at the time of writing - if you have a newer version
            available that will be fine too.</p>

        <p>In the <code>Search for dependencies</code> field search for <code>web</code>, <code>jpa</code> and
            finally
            <code>h2</code>, selecting each as the auto-complete presents a match.</p>

        <p>Alternatively you can click on the <code>Switch to the full version</code> link and select the above
            dependencies
            manually.</p>

        <p>Once done, click on <code>Generate Project</code> - you'll get a dialog to download the generated bundle.
            Save
            this to your chosen project location and once downloaded unzip it to a sub-directory called
            <code>backend</code>.
        </p>

        <p>You should see the following project structures:</p>

        <snippet>
└── backend
   ├── LICENSE
   ├── mvnw
   ├── mvnw.cmd
   ├── pom.xml
   └── src
   ├── main
   │   ├── java
   │   │   └── com
   │   │   └── aggrid
   │   │   └── crudapp
   │   │   └── CrudAppApplication.java
   │   └── resources
   │   ├── application.properties
   │   ├── static
   │   └── templates
   └── test
   └── java
   └── com
   └── aggrid
   └── crudapp
      └── CrudAppApplicationTests.java</snippet>

        <p>Maven provides a standard project structure, including a default Application file (<code>CrudAppApplication.java</code>)
            and default, starting, test file (<code>CrudAppApplicationTests.java</code>).</p>

        <note>We have unzipped the generated project into a directory called <code>backend</code> as I prefer to
            keep the
            back and front end separate. Each tier can in effect be considered an application in its own right -
            this
            is especially true as your application grows in code and complexity.
        </note>


        <p>Navigate to the <code>backend</code> directory; let's download the dependencies and do a quick sanity
            check:</p>

        <snippet language="sh">mvn test</snippet>

        <p>You should see a long output while mvn downloads all dependencies - this might take a little time
            depending on your
            internet speed. The above command will install all dependencies, compile the code and then run
            tests.</p>

        <p>As it stands the test doesn't do anything so you should see a message letting you know that the build was
            successful.</p>

        <h2>Running the Application</h2>

        <p>You can launch the application in one of 2 ways:</p>

        <h4>In an IDE</h4>

        <p>If you're using an IDE you can run <code>src/main/java/com/aggrid/crudapp/CrudAppApplication.java</code>
            - this will launch the application.</p>

        <h4>Via Maven</h4>

        <snippet language="sh">mvn spring-boot:run</snippet>

        <p>In either case the application will launch, but not actually do much at this stage.</p>

        <h2>Data Model</h2>

        <note img="'./updated_transparent.png'" height="'50'" width="'123'">
            <p>This section has been updated to simplify the model - there is now no join table<br/>(it was
                unnecessary - not sure why I added it!).</p> The <code>Athlete</code> and
            <code>Result</code> classes have been updated to reflect this change.
        </note>

        <p>Our database model is pretty simple - we have 4 entities here:</p>

        <table>
            <tr style="vertical-align: top">
                <td><code>Athlete</code></td>
                <td>The main entity - from this we can get the Results and Country associated to
                    the Athlete
                </td>
            </tr>
            <tr style="vertical-align: top">
                <td><code>Sport</code></td>
                <td>Sports completed in - static data</td>
            </tr>
            <tr style="vertical-align: top">
                <td><code>Country</code></td>
                <td>All Countries that completed - static data</td>
            </tr>
            <tr style="vertical-align: top">
                <td><code>Result</code></td>
                <td>Joins the tables above and captures each medal won, by which athlete in which
                    sport, as well as the year, date and age of the athlete at the time of the event
                </td>
            </tr>
        </table>

        <img src="./erd_model.png" style="width: 100%">

        <p>This information could be modelled better, but it's based on the data available (i.e. if we had the
            Athletes
            date of birth, we wouldn't need the age row in <code>Result</code> - it could be computed).</p>

        <p>Converting this to our middle tier, we'll need the following four JPA Entities: <code>Athlete</code>,
            <code>Sport</code>, <code>Medal</code> and <code>Country</code></p>

        <p><code>Sport</code> and <code>Country</code> are simple entities as these are primarily there as static
            data. <code>Result</code> and <code>Athlete</code> are the most interesting of these entities.</p>

        <p><code>Result</code> has a <code>OneToOne</code> mapping to <code>Sport</code>, and has a
            <code>ManyToOne</code>
            mapping to <code>Athlete</code>. <code>Athlete</code> in turn has a <code>OneToOne</code> mapping to
            <code>Country</code>, and a <code>OneToMany</code> mapping to <code>Result</code>.</p>

        <p>This reflects the ERD (entity relationship diagram) model above.</p>

        <p>We define each of these as JPA Entities by annotating the class with <code>@Entity</code>.
            we
            also let Spring know that we want the <code>id</code> field to be the ID by annotating the field with
            <code>@Id</code>
            and finally annotate the field with <code>@GeneratedValue(strategy = GenerationType.AUTO)</code> to have
            Spring/H2
            auto-generate IDs for us.</p>

        <show-sources example=""
                      sources="{
                            [
                                { root: './crud-app/model/', files: 'Sport.java,Country.java,Result.java,Athlete.java' },
                            ]
                          }"
                      language="java"
                      highlight="true"
                      exampleHeight="500px">
        </show-sources>

        <p style="margin-top: 20px">There is obvious code duplication here which we could refactor, but for
            simplicities sake we've left the duplication in place.</p>

        <p>With the above configuration Hibernate will create the following physical model for us:</p>

        <img src="./physical_model.png" style="width: 100%">

        <h3>Repositories</h3>

        <p>So far we have entities and their mapping - this is great, but to be useful we need a facility to be able
            to perform read/writes/deletions of data. Spring makes this easy for us by providing the <code>CrudRepository</code>
            interface which we can extend. With very little effort we get a great deal of functionality - this is a
            real time saver.</p>

        <p>Below are the 4 <code>Repositories</code> we'll use in this application - one for each of the entities
            described above:</p>

        <show-sources example=""
                      sources="{
                            [
                                { root: './crud-app/repositories/', files: 'AthleteRepository.java,CountryRepository.java,ResultRepository.java,SportRepository.java' },
                            ]
                          }"
                      language="java"
                      highlight="true"
                      exampleHeight="170px">
        </show-sources>

        <h3>H2 Console</h3>

        <p>We can take a look at the generated model for us in <code>H2</code> but opening up the <code>H2</code>
            Console.
            This is disabled by default - we need to update <code>/src/main/resources/application.properties</code>
            to enable it:</p>

        <snippet>spring.h2.console.enabled=true</snippet>
        <p>We can then navigate to <a href="http://localhost:8080/h2-console/" target="_blank">http://localhost:8080/h2-console/</a>
            and take a look at what we have.</p>

        <note>Be sure that the JDBC URL field is set to <code>jdbc:h2:mem:testdb</code>. H2 will cache any previous
            URLs
            you might have used, but the in memory H2 one we're using here will be <code>jdbc:h2:mem:testdb</code>.
        </note>

        <img src="./h2_console.png" style="width: 100%">

        <h3 style="margin-top: 15px">Test Data - Bootstrapping</h3>

        <note img="'./updated_transparent.png'" height="'50'" width="'123'">
            <p>This section has been updated when I discovered I was incorrectly inserting duplicate
                <code>Athlete</code>
                with it.
            <p>Write tests before you write code, and write them often!</p>
        </note>

        <p>In order to get the data we have (<code>src/main/resources/olympicWinners.csv</code>) into the
            <code>H2</code> database, we'll make use of Spring's
            <code>ApplicationListener&lt;ContextRefreshedEvent&gt;</code> facility to load the test data and save it
            to the database.</p>

        <p>We'll make use of a third-party library called <code>Jackson</code> to convert the CSV to Java POJOs, so
            add this
            to your Maven pom.xml file, within the <code>dependencies</code> block:</p>
        <snippet>&lt;dependency&gt;
    &lt;groupId&gt;com.fasterxml.jackson.dataformat&lt;/groupId&gt;
    &lt;artifactId&gt;jackson-dataformat-csv&lt;/artifactId&gt;
    &lt;version&gt;2.9.1&lt;/version&gt;
    &lt;scope&gt;test&lt;/scope&gt;
&lt;/dependency&gt;            </snippet>

        <p>Note that we're only using this library for local testing, so it has the <code>test</code> scope.</p>

        <show-sources example=""
                      sources="{
                                        [
                                            { root: './crud-app/bootstrap/', files: 'Bootstrap.java,CsvLoader.java,RawOlympicWinnerRecord.java' }
                                        ]
                                      }"
                      language="java"
                      highlight="true"
                      exampleHeight="500px">
        </show-sources>

        <p style="margin-top: 20px">On startup the data in <code>src/main/resources/olympicWinners.csv</code> will be
            loaded, parsed and
            inserted in the database, ready for us to query.</p>

        <p>Let's start the application and then fire up the <code>H2</code> console to test what we have. If we run
            the following query in the <code>H2</code> console:</p>

        <snippet language="sql">select a.name, c.name, r.age, c.name, r.year, r.date,s.name,r.gold,r.silver,r.bronze
from athlete a, country c, athlete_result ar, result r, sport s
where a.country_id = c.id
and ar.athlete_id = a.id
and ar.result_id = r.id
and r.sport_id = s.id
</snippet>

        <img src="./h2_query.png" style="width: 100%">

        <h2 style="margin-top: 15px">Optional - Spring DevTools</h2>

        <p>Spring Boot offers a development utility called Spring DevTools. This is an optional dependency, but
            makes local development much easier.</p>

        <p>Let's add the <code>DevTools</code> to our Maven pom.xml file:</p>

        <snippet>&lt;dependency&gt;
    &lt;groupId&gt;org.springframework.boot&lt;/groupId&gt;
    &lt;artifactId&gt;spring-boot-devtools&lt;/artifactId&gt;
    &lt;optional&gt;true&lt;/optional&gt;
&lt;/dependency&gt;
</snippet>

        <p>With this in place if you're running your application and find you need to make a change you can do so,
            rebuild the project, and refresh the browser/end point without needing to restart your entire
            application.</p>

        <p>This can be a real time saver, so adding this is recommended. Please refer to the <a
                    href="https://docs.spring.io/spring-boot/docs/current/reference/html/using-boot-devtools.html">Spring
                Boot DevTools</a>
            documentation for more details about this.</p>

        <h2>Summary</h2>

        <p>This first part of the series is by necessity a bit by the numbers. It's worth noting however if you
            simply run
            the commands above (and created the Java classes listed) you'd be up and running with a fully fledged
            CRUD system -
            all within no more than 30 minutes, which is pretty amazing.</p>

        <p>In order to access the CRUD features we've just implemented we need to provide this to the front end -
            we'll start
            covering that in the next part of this series!</p>

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
                           data-url="https://www.ag-grid.com/ag-grid-datagrid-crud-part-1/"
                           data-text="Building a CRUD Application with ag-Grid #angular #aggrid #crud"
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
