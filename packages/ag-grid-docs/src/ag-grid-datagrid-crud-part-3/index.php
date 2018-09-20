<?php

$pageTitle = "ag-Grid Blog: Building a CRUD Application with ag-Grid Part 3";
$pageDescription = "In Part 3 of this series, we create the scaffolding for our Angular application and get our data displayed in our first, simple, datagrid.";
$pageKeyboards = "ag-grid datagrid crud enterprise";

$socialUrl = "https://www.ag-grid.com/ag-grid-datagrid-crud-part-3/";
$socialImage = "https://www.ag-grid.com/ag-grid-datagrid-crud-part-1/crud_overview.png?".uniqid();

include('../includes/mediaHeader.php');
?>

<h1>Building a CRUD Application with ag-Grid - Part 3</h1>
<p class="blog-author">Sean Landsman | 21st November 2017</p>

<div>
    <a href="https://twitter.com/share" class="twitter-share-button"
       data-url="https://www.ag-grid.com/ag-grid-datagrid-crud-part-3/"
       data-text="Building a CRUD application with ag-Grid Part 3" data-via="seanlandsman"
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

    <div class="row">
        <div class="col-md-8" ng-app="documentation">

            <h2>Summary</h2>

            <p>In Part 3 of this Series we create the scaffolding for our Angular application and get our data displayed
                in our first, simple, grid.</p>

            <h2>Series Chapters</h2>

            <ul class="content">
                <li><a href="../ag-grid-datagrid-crud-part-1/">Part 1</a>: Introduction & Initial Setup: Maven, Spring
                    and JPA/Backend (Database)
                </li>
                <li><a href="../ag-grid-datagrid-crud-part-2/">Part 2</a>: Middle Tier: Exposing our data with a REST
                    Service
                </li>
                <li class="bold-roboto">Part 3: Front End - Initial Implementation</li>
                <li>Part 4: Front End - Grid Features & CRUD (Creation, Updates and Deletion)</li>
            </ul>

            <h2>Introduction</h2>

            <note>The completed code for this blog series can be found <a
                        href="https://github.com/seanlandsman/ag-grid-crud">here (once the series is complete)</a>,
                with this particular section being under <a
                        href="https://github.com/seanlandsman/ag-grid-crud/tree/part-3">Part
                    3</a></note>

            <p>
                In order for our data to be useful we need to make it available to users. So far we've exposed our data
                via REST service in the previous <a href="../ag-grid-datagrid-crud-part-3/">part</a>, but now let's make
                it
                available to our users in the browser.
            </p>

            <p>We'll be running an Angular application. One of the quickest way to spin up an Angular application is to
                make
                use of the <a href="https://cli.angular.io/">Angular CLI</a>, which we'll make use of here.</p>

            <h3>Scaffolding with Angular CLI</h3>

            <p>First things first, let's install Angular CLI. In our case we're going to install it globally as it's
                easier
                to use this way, but you can install it locally (i.e. local to your project) if you prefer.</p>

            <snippet>npm install -g @angular/cli</snippet>

            <p>Next we'll create a new Angular application in the root of the project:</p>

            <snippet>ng new frontend</snippet>

            <p>Angular CLI will create a scaffolded project all ready to go - we can test it as follows:</p>

            <snippet>cd frontend
ng serve
</snippet>

            <p>You can now navigate to <code>http://localhost:4200/</code> and see the results of the scaffolding:</p>

            <img src="angular-cli-default.png" alt="Angular CLI" 
                 style="border: solid 1px lightgrey;border-radius: 5px;width: 100%;margin-bottom: 15px">

            <h2>Development</h2>

            <p>There are a number of ways you might structure your overall application - in this series we're going to
                keep
                the front and backends separate both in structure and in execution, at least when in development
                mode.</p>

            <p>Doing so makes front end development easier and allows us to separate the two tiers (front and middle).
                We'll cover
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

            <img src="front-end-arch.png" width="100%" alt="Front End Architecture"/>

            <p>As a first pass let's attempt to retrieve all Olympic Data from the server. In order to do that we're
                going to break our front end application into further packages: one for our <code>model</code> and
                another
                for our <code>services.</code></p>

            <p>The <code>model</code> classes are pretty simple and are pretty much mirrors of their Java counterparts:
            </p>

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
}
</snippet>

            <p>There's a fair bit going on here - we're creating a <code>Service</code> that will make use of Angular's
                <code>Http</code> service. In order to access it we use Angular Dependency Injection facility, so all we
                need to
                do is specify it in our constructor.</p>

            <p>In the <code>findAll</code> method we're providing an <code>Observable</code> that will make a call to
                our
                REST endpoint, and on retrieval, map it to the model classes we created above. We actually get a lot of
                functionality
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

            <p>Ok, great - we should be good to go now right? Unfortunately not - if we run both the front and backend
                as it stands we'll get the following error: </p>

            <img src="./cors.png" width="100%" alt="Error">

            <p>The problem here is that our Angular application is running in <code>localhost:4200</code>, but our
                backend
                application is running on <code>localhost:8080</code>. The browser will by default prevent this due to
                the risk of
                malicious indirection - you can read more about <a
                        href="https://en.wikipedia.org/wiki/Cross-origin_resource_sharing">CORS</a> here, but for now we
                have
                an easy solution to this.</p>

            <p>Let's head back to our <code>AthleteController.java</code> controller and enable CORS:</p>

<snippet language="ts">
@CrossOrigin(origins = "http://localhost:4200")
@RestController
public class AthleteController {
... rest of the class
</snippet>

            <p>With this one line we're good to go. Note that in a real application you'd probably want to only enable
                CORS
                for local development (perhaps with Spring profiles). You also want to be able to externalise the ports
                you run on
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

            <img src="./first-call.png" style="width:100%; margin-bottom: 15px" alt="localhost:4200">

            <p>Great, good progress so far - we now know we can call the backend successfully!</p>

            <h2>ag-Grid</h2>

            <p>We're finally in a position to start hooking our data into ag-Grid!</p>

            <p>First, let's install the ag-Grid dependencies - as we're going to be using a few of the Enterprise
                features
                that ag-Grid offers we'll install both the <code>ag-grid</code> and <code>ag-grid-enterprise</code>
                dependencies.</p>

            <p>If you're not using any of the Enterprise features then you only need to install the <code>ag-grid</code>
                dependency.</p>

            <snippet>npm install --save ag-grid-community ag-grid-enterprise ag-grid-angular</snippet>

            <p>The <code>ag-grid-angular</code> is what allows us to talk to the grid and provides the rich Angular
                functionality
                we want.</p>

            <p>We also need to let the Angular CLI know about the styles we want to use. In our demo we're going to use
                the
                <a href="https://www.ag-grid.com/javascript-grid-themes/fresh-theme.php">Fresh Theme</a>, but there are
                others available - please see the <a href="https://www.ag-grid.com/javascript-grid-styling/">Themes
                    Documentation</a>
                for more details.</p>

            <p>In order to let the CLI know about the styles we want to add we need to add them to the <code>.angular-cli.json</code>
                file. Look for the styles section and add the following CSS entries:</p>

<snippet>
"styles": [
    "styles.css",
    "../node_modules/ag-grid/dist/styles/ag-grid.css",
    "../node_modules/ag-grid/dist/styles/ag-theme-balham.css"
],
</snippet>

            <p><code>styles.css</code> is a style file generated by Angular CLI - you can either keep it or remove it.
                We
                won't be using it in our demo here.</p>

            <p>Next we need to add the <code>AgGridModule</code> to our application. We do this by adding it to our
                <code>app.module.ts</code>:</p>

<snippet language="ts">
... other imports
import {AgGridModule} from 'ag-grid-angular';

@NgModule({
    declarations: [
    AppComponent
    ],
    imports: [
        BrowserModule,
        HttpModule,
        AgGridModule
    ...rest of module
</snippet>

            <p>We now have the ag-Grid dependencies all setup - our next step is to actually use ag-Grid to display some
                data.</p>

            <h3>Our Grid Component</h3>

            <p>Let's create a new component that will be responsible for displaying our data in ag-Grid:</p>

            <snippet>ng generate component Grid</snippet>

            <p>This will create a new Angular component for us and automatically register it in our Angular module.</p>

<snippet>
installing component
create src/app/grid/grid.component.css
create src/app/grid/grid.component.html
create src/app/grid/grid.component.spec.ts
create src/app/grid/grid.component.ts
update src/app/app.module.ts
</snippet>

            <p>Let's open up our new Component and inject our <code>AthleteService</code> as before. The <code>AthleteService</code>
                will be responsible for supplying data to the Grid. Later, it will also be responsible for updates &
                deletions too.</p>

            <p>We also need two properties for our component: one for row data and one for column definitions - at a
                minimum the grid require what columns you want in the Grid, as well as what data to display.</p>

            <p>Finally, we'll hook into the <code>gridReady</code> event from the Grid. We do this for two reasons:
                firstly,
                to access the <code>GridApi</code> and <code>ColumnApi</code> and secondly to auto resize the columns on
                initialisation.</p>

<snippet language="ts">
export class GridComponent implements OnInit {
    // row data and column definitions
    private rowData: Athlete[];
    private columnDefs: ColDef[];

    // gridApi and columnApi
    private api: GridApi;
    private columnApi: ColumnApi;

    // inject the athleteService
    constructor(private athleteService: AthleteService) {
        this.columnDefs = this.createColumnDefs();
    }

    // on init, subscribe to the athelete data
    ngOnInit() {
        this.athleteService.findAll().subscribe(
            athletes => {
                this.rowData = athletes
            },
            error => {
                console.log(error);
            }
        )
    }

    // one grid initialisation, grap the APIs and auto resize the columns to fit the available space
    onGridReady(params): void {
        this.api = params.api;
        this.columnApi = params.columnApi;

        this.api.sizeColumnsToFit();
    }

    // create some simple column definitions
    private createColumnDefs() {
        return [
            {field: 'id'},
            {field: 'name'},
            {field: 'country'},
            {field: 'results'}
        ]
    }
}
</snippet>

            <p>And our view template looks like this:</p>

<snippet language="html">
&lt;ag-grid-angular style="width: 100%; height: 800px;"
    class="ag-theme-balham"
    (gridReady)="onGridReady($event)"
    [columnDefs]="columnDefs"
    [rowData]="rowData"&gt;
&lt;/ag-grid-angular&gt;
</snippet>

            <p>Notice that this is where we're binding to the row data and column definitions, as well as hooking into
                the <code>gridReady</code> event. There are other ways of doing this, but this is clearer and more
                idiomatic
                from an Angular perspective.</p>

            <p>As we're now using the <code>AthleteService</code> in our Grid Component, we can remove it from <code>app.component.ts</code>.
            </p>

            <p>Finally, we can hook our component into <code>app.component.html</code>:</p>

            <snippet language="html">&lt;app-grid&gt;&lt;/app-grid&gt;</snippet>

            <p>With this in place we can now run our application...but we don't see quite what we're hoping for:</p>

            <img src="./grid-first-pass.png" width="100%" alt="datagrid">

            <p>The reason for this is pretty simple - both <code>Country</code> and <code>Results</code> are complex
                data.
                They don't have a simple key-value relationship unlike the rest of the data.</p>

            <p>We can fix this easily by making use of a <a
                        href="https://www.ag-grid.com/javascript-grid-value-getters/">
                    Value Getter</a> which will convert the complex raw data into
                something more display friendly:</p>

<snippet language="ts">
private createColumnDefs() {
    return [
        {field: 'id'},
        {field: 'name'},
        {field: 'country', valueGetter: (params) => params.data.country.name},
        {field: 'results', valueGetter: (params) => params.data.results.length}
    ]
}
</snippet>

            <p>Here the <code>valueGetter</code> callback will be called for every row for <code>country</code> and
                <code>results</code>,
                where we return the <code>country name</code> and <code>results length</code> respectively.</p>

            <img src="./grid-second-pass.png" width="100%" alt="grid second pass">

            <show-sources example=""
                          sources="{
                            [
                                { root: './crud-app-final/', files: 'app.module.ts,app.component.ts,app.component.html,grid.component.html,grid.component.ts' }
                            ]
                          }"
                          language="java"
                          highlight="true"
                          exampleHeight="500px">
            </show-sources>

            <h2 style="margin-top: 10px">Summary</h2>

            <p>That might have seemed like a fair bit of work, but it's worth noting that we only had to import a single
                module
                and then reference the grid in a single component to get a grid up and running.</p>

            <p>With the addition of a few simple properties we can enable filtering, sorting and so on. We can also
                start working
                providing the rest of the CRUD operations (creation, updates and deletions).</p>

            <p>We'll take a look at all that and more in the next part of the series.</p>

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
                               data-url="https://www.ag-grid.com/ag-grid-datagrid-crud-part-3/"
                               data-text="Building a CRUD Application with ag-Grid Part 3 #angular #aggrid #crud" data-via="seanlandsman"
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
                        </td>
                    </tr>
                </table>
            </div>

        </div>

        <?php
        include '../blog-authors/sean.php';
        ?>
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
