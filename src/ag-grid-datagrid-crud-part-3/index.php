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
        <h1 style="margin-top: 0;">Building a CRUD Application with ag-Grid - Part 3</h1>
    </div>
    <div class="row" ng-app="documentation">
        <div class="col-md-9">

            <h2>Summary</h2>

            <p>In Part 3 of this Series, we create the scaffolding for our Angular application, and get our data displayed
                in our first, simple, grid.</p>

            <h2>Series Chapters</h2>

            <ul>
                <li><a href="../ag-grid-datagrid-crud-part-1/">Part 1</a>: Introduction & Initial Setup: Maven, Spring and JPA/Backend (Database)</li>
                <li><a href="../ag-grid-datagrid-crud-part-2/">Part 2</a>: Middle Tier: Exposing our data with a REST Service</li>
                <li>Part 3: Front End - Initial Implementation</li>
                <li>Part 4: Front End - Aggregation & Pivoting</li>
                <li>Part 5: Front End - Enterprise Row Model</li>
                <li>Part 6: Back End (Optional) - Using Oracle DB</li>
            </ul>

            <h2>Introduction</h2>

            <note>The completed code for this blog series can be found <a
                        href="https://github.com/seanlandsman/ag-grid-crud">here (once the series is complete)</a>,
                with this particular section being under <a
                        href="https://github.com/seanlandsman/ag-grid-crud/tree/part-3">Part
                    3</a></note>

            <p>
                In order for our data to be useful we need to make it available to users. So far we've exposed our data
                via REST service in the previous <a href="../ag-grid-datagrid-crud-part-2/">part</a>, but now let's make it
                available to our users in the browser.
            </p>

            <p>We'll be running an Angular application. One of the quickest way to spin up an Angular application is to make
            use of the <a href="https://cli.angular.io/">Angular CLI</a>, which we'll make use of here.</p>

            <p>For a quick standalone guide on getting up an running with ag-Grid, Angular and Angular CLI please see <a
                        href="../ag-grid-angular-angularcli/">here</a>.</p>

            <h3>Scaffolding with Angular CLI</h3>

            <p>First things first, let's install Angular CLI. In our case we're going to install it globally as it's easier
            to use this way, but you can install it locally (i.e. local to your project) if you prefer.</p>

            <snippet>npm install -g @angular/cli</snippet>

            <p>Next we'll create a new Angular application in the root of the project:</p>

            <snippet>ng new frontend</snippet>

            <p>Angular CLI will create a scaffolded project all ready to go - we can test it as follows:</p>

<snippet>cd frontend
ng serve</snippet>

            <p>You can now navigate to <code>http://localhost:4200/</code> and see the results of the scaffolding:</p>

            <img src="angular-cli-default.png" style="border: solid 1px lightgrey;border-radius: 5px;width: 100%;margin-bottom: 15px">

            <h2>Development</h2>

            <p>There are a number of ways you might structure your overall application - in this series we're going to keep
                the front and backends separate both in structure and in execution, at least when in development mode.</p>

            <p>Doing so makes front end development easier and allows us to separate the two tiers (front and middle). We'll cover
            application packaging (into a single deployable artifact) later in the series.</p>

            <p>We'll run the <code>server</code> and <code>front end</code> code separately in development mode:</p>

<snippet>
// server
mvn spring-boot:run

// in a separate terminal/window, serve the front end code
ng serve
</snippet>

            <h3>First Call to the Server</h3>

            <p>We'll make use of a simple Application architecture in the frontend:</p>

            <img src="front-end-arch.png" width="100%" />

            <p>As a first pass let's attempt to retrieve all Olympic Data from the server. In order to do that we're
            going to break our front end application into further packages: one for our <code>model</code> and another
            for our <code>services.</code></p>

            <p>The <code>model</code> classes are pretty simple and are pretty much mirrors of their Java counterparts:</p>

<snippet language="ts">
import {Country} from './country.model';
import {Result} from './result.model';

export class Athlete {
    id: number;
    name: string;
    country: Country;
    results: Result[];
}
</snippet>

            <p>We'll also create a <code>AthleteService</code> that will interact with our REST endpoint:</p>

<snippet language="ts">
import {Injectable} from '@angular/core';
import {Athlete} from '../model/athlete.model';
import {Http, Response} from '@angular/http';
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/catch';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class AthleteService {

    private apiUrl = 'http://localhost:8080/athletes';

    constructor(private http: Http) {
    }

    findAll(): Observable&lt;Athlete[]&gt; {
        return this.http.get(this.apiUrl)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
    }
}</snippet>

            <p>There's a fair bit going on here - we're creating a <code>Service</code> that will make use of Angular's
            <code>Http</code> service. In order to access it we use Angular Dependency Injection facility, so all we need to
            do is specify it in our constructor.</p>

            <p>In the <code>findAll</code> method we're providing an <code>Observable</code> that will make a call to our
            REST endpoint and on retrieval map it to the model classes we created above. We actually get a lot of functionality
            from not too many lines of code here, which is great.</p>

            <p>So far so good - let's plug this service into our application next:</p>

<snippet language="ts">
export class AppComponent implements OnInit {
    private athletes: Athlete[];

    constructor(private athleteService: AthleteService) {
    }

    ngOnInit() {
        this.athleteService.findAll().subscribe(
            athletes => {
                this.athletes = athletes
            },
            error => {
                console.log(error);
            }
        )
    }
}
</snippet>

            <p>We'll create a quick template to output our results:</p>

<snippet language="html" ng-non-bindable>&lt;div *ngFor="let athlete of athletes"&gt;
    &lt;span&gt;{{athlete.id}}&lt;/span&gt;
    &lt;span&gt;{{athlete.name}}&lt;/span&gt;
    &lt;span&gt;{{athlete?.country?.name}}&lt;/span&gt;
    &lt;span&gt;{{athlete?.results?.length}}&lt;/span&gt;
&lt;/div&gt;
</snippet>

            <show-sources example=""
                          sources="{
                            [
                                { root: './crud-app/', files: 'app.component.ts,app.component.html' },
                                { root: './crud-app/services/', files: 'athlete.service.ts' },
                                { root: './crud-app/model/', files: 'athlete.model.ts,country.model.ts,result.model.ts,sport.model.ts' }
                            ]
                          }"
                          language="ts"
                          highlight="true"
                          exampleHeight="500px">
            </show-sources>

            <p>Ok, great - we should be good to go now right?  Unfortunately not - if we run both the front and backend
                as it stands we'll get the following error: </p>

            <img src="./cors.png" width="100%">

            <p>The problem here is that our Angular application is running in <code>localhost:4200</code>, but our backend
            application is running on <code>localhost:8080</code>. The browser will by default prevent this due to the risk of
            malicious indirection - you can read more about <a
                        href="https://en.wikipedia.org/wiki/Cross-origin_resource_sharing">CORS</a> here, but for now we have
            an easy solution to this.</p>

            <p>Let's head back to our <code>AthleteController.java</code> controller and enable CORS:</p>

<snippet language="ts">
@CrossOrigin(origins = "http://localhost:4200")
@RestController
public class AthleteController {
    ... rest of the class
</snippet>

            <p>With this one line we're good to go. Note that in a real application you'd probably want to only enable CORS
            for local development (perhaps with Spring profiles). You also want to be able to externalise the ports you run on
            via the use of properties.</p>

            <show-sources example=""
                          sources="{
                            [
                                { root: './crud-app/', files: 'AthleteController.java' }
                            ]
                          }"
                          language="java"
                          highlight="true"
                          exampleHeight="500px">
            </show-sources>


            <p>Ok, let's try that again - let's start our applications and checkout the results:</p>

<snippet>
// server
mvn spring-boot:run

// in a separate terminal/window, serve the front end code
ng serve
</snippet>

            <p>Once both have started you can navigate to <a href="localhost:4200" target="_blank">localhost:4200</a>.
            You should see something like this: </p>

            <img src="./first-call.png" width="100%">

            <p>Great! Good progress so far - we now know we can call the backend succesfully!</p>

            <h2>Summary</h2>

            <p>See you next time!</p>
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
