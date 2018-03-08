<?php

$pageTitle = "ag-Grid Blog: Building a CRUD Application with ag-Grid Part 4";
$pageDescription = "In Part 4 of this Series hook up the front end all the way down to the database, including support for all
            CRUD operations (create, read, update and deletion).";
$pageKeyboards = "ag-grid datagrid crud enterprise";

include('../includes/mediaHeader.php');
?>

<script type="text/javascript" src="/dist/thickbox/thickbox.js"></script>
<link rel="stylesheet" href="/dist/thickbox/thickbox.css" type="text/css" media="screen"/>

<h1>Building a CRUD Application with ag-Grid - Part 4</h1>
<p class="blog-author">Sean Landsman | 5th December 2017</p>

<div>
    <a href="https://twitter.com/share" class="twitter-share-button"
       data-url="https://www.ag-grid.com/ag-grid-datagrid-crud-part-4/"
       data-text="Building a CRUD application with ag-Grid Part 4" data-via="seanlandsman"
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
    <div class="col-md-8">

        <h2>Summary</h2>

        <p>In Part 4 of this Series hook up the front end all the way down to the database, including support for all
            CRUD operations (create, read, update and deletion).</p>

        <h2>Series Chapters</h2>

        <ul class="content">
            <li><a href="../ag-grid-datagrid-crud-part-1/">Part 1</a>: Introduction & Initial Setup: Maven, Spring
                and JPA/Backend (Database)
            </li>
            <li><a href="../ag-grid-datagrid-crud-part-2/">Part 2</a>: Middle Tier: Exposing our data with a REST
                Service
            </li>
            <li><a href="../ag-grid-datagrid-crud-part-3/">Part 3</a>: Front End - Initial Implementation</li>
            <li class="bold-roboto">Part 4: Front End - Grid Features & CRUD (Creation, Reads, Updates and Deletion)</li>
        </ul>

        <h2>Introduction</h2>

        <note img="'../ag-grid-datagrid-crud-part-1/updated_transparent.png'" height="'50'" width="'123'">
            <p>While writing this part of the blog I uncovered two bugs in work done so far.</p>
            <p>If you've been following this series so far please take a quick look at both parts
                <a href="../ag-grid-datagrid-crud-part-1/">1</a> and <a href="../ag-grid-datagrid-crud-part-2/">2</a>
                to see the changes made (look for <code>Updated!</code>).</p>
            <p>The lesson here? Write tests before you write code, and write them often!</p>
        </note>

        <note>The completed code for this blog series can be found <a
                    href="https://github.com/seanlandsman/ag-grid-crud">here (once the series is complete)</a>,
            with this particular section being under <a
                    href="https://github.com/seanlandsman/ag-grid-crud/tree/part-4">Part
                4</a></note>

        <p style="margin-top: 15px">In this part we'll be building on the simple grid we have so far and get our
            simple CRUD operations hooked
            up to the backend.</p>

        <h3>Simple Inline Editing</h3>

        <p>Let's start off with the simplest of the CRUD operations - Updates. Specifically, we'll start off with
            inline editing of "simple" values - values that contain a single value (i.e. aren't complex
            objects).</p>

        <p>Of the values we currently display, only <code>name</code> and <code>country</code> fall into this
            category,
            so let's start off with these.</p>

        <p>In the case of the <code>country</code> column we only want to allow selection of a value from a
            predefined
            list, so we'll need to retrieve all possible values up front so that we can offer the user a choice at
            the right time.</p>

        <p>Later, we'll need to do the same for <code>sport</code> values, so let's create a new service
            that will retrieve static data (data that won't be changed by the user) for us.</p>

        <p>First we need to create a new Spring <code>Controller</code> in the middle tier that we can use to access
            the
            static data. I won't go into this service too much as we've already covered using
            <code>Controller</code>s
            in a previous part of this series:</p>

        <snippet language="java">
@CrossOrigin(origins = "http://localhost:4200")
@RestController
public class StaticDataController {
    private CountryRepository countryRepository;
    private SportRepository sportRepository;

    public StaticDataController(CountryRepository countryRepository,
                                SportRepository sportRepository) {
        this.countryRepository = countryRepository;
        this.sportRepository = sportRepository;
    }

    @GetMapping("/countries")
    public Iterable&lt;Country&gt; getCountries() {
        return countryRepository.findAll();
    }

    @GetMapping("/sports")
    public Iterable&lt;Sport&gt; getSports() {
        return sportRepository.findAll();
    }
}
</snippet>

        <p>Here we're simply retrieving all possible values for <code>country</code> and <code>sport</code>
            respectively.</p>

        <p>Next, let's create an Angular <code>Service</code> that will call this rest end point:</p>

        <snippet>
@Injectable()
export class StaticDataService {
    private apiRootUrl = 'http://localhost:8090';

    private countriesUrl = this.apiRootUrl + '/countries';
    private sportsUrl = this.apiRootUrl + '/sports';

    static alphabeticalSort() {
        return (a: StaticData, b: StaticData) =&gt; a.name.localeCompare(b.name);
    }

    constructor(private http: Http) {
    }

    countries(): Observable&lt;Country[]&gt; {
        return this.http.get(this.countriesUrl)
                        .map((response: Response) =&gt; response.json())
                        .catch(this.defaultErrorHandler());
    }

    sports(): Observable&lt;Sport[]&gt; {
        return this.http.get(this.sportsUrl)
                        .map((response: Response) =&gt; response.json())
                        .catch(this.defaultErrorHandler());
    }

    private defaultErrorHandler() {
        return (error: any) =&gt; Observable.throw(error.json().error || 'Server error');
    }
}
</snippet>

        <p>Again we won't go into this as we've already covered accessing data from the REST endpoint in an earlier
            part.
            We have added a static method here (<code>alphabeticalSort</code>) that we'll use later, but this is
            just a
            utility method used for display purposes.</p>

        <p>Now that we have this in place we can start making changes to your Grid - first, we need to make these
            two
            columns editable. As we want users to select from a predefined list in the case of <code>country</code>
            so we'll make use of the ag-Grid supplied <code>richSelect</code> editor here (you could also use the
            <code>select</code> editor if you're using the free version of ag-Grid).
        </p>

        <p><code>richSelect</code> requires it's values up front, so let's access all countries in the contructor -
            once we have them we can define our column definitions with these values provided:</p>

        <snippet>
// inject the athleteService & staticDataService
constructor(private athleteService: AthleteService,
            staticDataService: StaticDataService) {

    staticDataService.countries().subscribe(
            countries => this.columnDefs = this.createColumnDefs(countries),
            error => console.log(error)
        );
}
</snippet>

        <p>With our new <code>StaticDataService</code> injected, we subscribe to the <code>countries</code>
            <code>Observable</code>, and once complete call <code>this.createColumnDefs(countries)</code> with the
            values
            we've just retrieved.</p>

        <snippet>
// create some simple column definitions
private createColumnDefs(countries: Country[]) {
    return [
        {
            field: 'name',
            editable: true
        },
        {
            field: 'country',
            cellRenderer: (params) => params.data.country.name,
            editable: true,
            cellEditor: 'richSelect',
            cellEditorParams: {
                values: countries,
                cellRenderer: (params) => params.value.name
            }
        },
        {
            field: 'results',
            valueGetter: (params) => params.data.results.length
        }
    ]
}
</snippet>

        <p>Let's break this method down:</p>

        <snippet>editable: true</snippet>

        <p>This makes the column editable.</p>

        <snippet>cellRenderer: (params) => params.data.country.name,</snippet>

        <p>As the <code>country </code> data we'll get back from the <code>StaticDataService</code> is a complex
            value
            (it has both <code>id</code> and a <code>name</code> properties) we need to let ag-Grid know how to
            display this.</p>

        <p>There are a variety of options here, but a simple solution is to provide a <code>cellRenderer</code> as
            we've done here.</p>
        <p>The <code>cellRenderer</code> will be provided with the current row data (along with other useful
            information -
            see the docs for further information) so we can access the row data (<code>params.data</code>), then the
            country column
            (<code>params.data.country</code>) and finally the <code>country</code> value: <code>params.data.country.name</code>.
        </p>

        <snippet>cellEditor: 'richSelect'</snippet>

        <p>We're going to make use of the ag-Grid <code>richSelect</code> select editor - this allows for
            customisation
            of values in the dropdown. We're not doing this in this first pass, but will in a later section.</p>

        <snippet>cellEditorParams: {
    values: countries,
    cellRenderer: (params) => params.value.name
}
</snippet>

        <p>At a minimum the <code>richSelect</code> requires the values to display, which is what
            <code>values</code> does here.</p>

        <p>As above though, the list of <code>country</code> are complex objects, so we need to let ag-Grid know
            what
            value to actually display. </p>

        <p>This time the params contains only the values in the <code>richSelect</code>, but the idea is the same -
            access the
            <code>country</code> <code>name</code> value to be displayed.</p>

        <p>With this in place we can now edit both the <code>name</code> and <code>country</code> columns:</p>

        <a href="./simple-editing.png" class="thickbox"><img src="./simple-editing.png" style="width: 100%"/></a>

        <h3>Persisting Our Edits</h3>

        <p>So far we're not actually doing anything with our edits - let's hook into the changes and save them down
            to the Database.</p>

        <snippet>
&lt;ag-grid-angular style="width: 100%; height: 500px;"
         class="ag-theme-balham"

         [columnDefs]="columnDefs"
         [rowData]="rowData"

         suppressHorizontalScroll

         (gridReady)="onGridReady($event)"
         (cellValueChanged)="onCellValueChanged($event)"&gt;
&lt;/ag-grid-angular&gt;
</snippet>

        <p>Here we hook into the <code>cellValueChanged</code> - we'll use this hook to save changed values.</p>

        <snippet>
onCellValueChanged(params: any) {
    this.athleteService.save(params.data)
                       .subscribe(
                           savedAthlete => {
                               console.log('Athlete Saved');
                               this.setAthleteRowData();
                           },
                           error => console.log(error)
                       )
}
</snippet>

        <p>Once a cell value has been changed, this method will be called. We call the <code>AthleteService</code>
            to save the row data (<code>params.data</code> contains the row data), and on successful save update the
            row
            data once again.</p>

        <p>What's great about this is that the <code>save</code> method requires an <code>Athlete</code> and as our
            row data consists of an array of <code>Athlete</code> so this mapping will happy for free.</p>

        <p>On both success and error we output a message in the console - of course in a real world application we'd
            provide
            a proper message of some sort to the users, but for this pass of the work a console message will be
            fine.</p>

        <p>You can test your changes by doing a force refresh - you should find the new values are in the Grid -
            the old values have been overwritten.</p>

        <p>Note: As we're using an in memory database, changes will not be permanently persisted. If you stop and
            restart the
            Java application the original values will be displayed once more.</p>

        <p>We can't edit the <code>Results</code> column yet - this is simply a sum of underlying data. We'll get to
            this
            later.</p>

        <p>Note we're refreshing the entire grid data each time a cell value changes - this is very inefficient.
            We'll look
            at making use of ag-Grid <a href="../javascript-grid-data-update">Update</a> functionality so that we
            only
            redraw changed rows, not the entire grid.</p>

        <h3>Record Deletion</h3>

        <p>Next let's take a look record deletion - this is probably the easiest of the CRUD operations to
            implement.</p>

        <p>We'll allow the users to select one or more records and then provide a button that when clicked will
            delete the
            selected records.</p>

        <p>First, let's enable <code>rowSelection</code> within the Grid:</p>

        <snippet language="html">
&lt;ag-grid-angular style="width: 100%; height: 500px;"
         class="ag-theme-balham"

         [columnDefs]="columnDefs"
         [rowData]="rowData"

         rowSelection="multiple"

         suppressRowClickSelection
         suppressHorizontalScroll

         (gridReady)="onGridReady($event)"
         (cellValueChanged)="onCellValueChanged($event)"&gt;
&lt;/ag-grid-angular&gt;
</snippet>

        <p>Here <code>rowSelection="multiple"</code> allows for one or more rows to be selected, and <code>suppressRowClickSelection</code>
            prevents rows from being selected by clicking on a row.</p>

        <p>What? Why would we want to prevent selection on row clicks? How will we select a row?</p>

        <p>Well, how about we add a checkbox to each row, making this our row selection mechanism?</p>

        <p>The benefits of this approach is that rows won't be selected when a row is being edited. Separating the
            selection
            into a deliberate action (a user needs to click in the checkbox) makes the operation clearer (and
            safer!).</p>

        <p>Adding a checkbox to a column is easy - all we need to do is add <code>checkboxSelection: true</code> to
            our column definition:</p>

        <snippet>
{
    field: 'name',
    editable: true,
    checkboxSelection: true
}
</snippet>

        <a href="./checkbox-selection.png" class="thickbox"><img src="./checkbox-selection.png"
                                                                 style="width: 100%"/></a>

        <p>Next, let's add a button that a user can use to delete the selected rows - we'll also add a utility
            method
            that will disable the delete button if no rows are selected:</p>

        <snippet>
&lt;div&gt;
    &lt;button (click)="deleteSelectedRows()" [disabled]="!rowsSelected()"&gt;
            Delete Selected Row
    &lt;/button&gt;
&lt;/div&gt;
&lt;div&gt;
    &lt;ag-grid-angular style="width: 100%; height: 500px;"
                 class="ag-theme-balham"

                 [columnDefs]="columnDefs"
                 [rowData]="rowData"

                 rowSelection="multiple"

                 suppressRowClickSelection
                 suppressHorizontalScroll

                 (gridReady)="onGridReady($event)"
                 (cellValueChanged)="onCellValueChanged($event)"&gt;
    &lt;/ag-grid-angular&gt;
&lt;/div&gt;
</snippet>

        <p>And the corresponding method implementations in our Grid component:</p>

        <snippet>
rowsSelected() {
    return this.api && this.api.getSelectedRows().length > 0;
}

deleteSelectedRows() {
    const selectRows = this.api.getSelectedRows();

    // create an Observable for each row to delete
    const deleteSubscriptions = selectRows.map((rowToDelete) => {
        return this.athleteService.delete(rowToDelete);
    });

    // then subscribe to these and once all done, refresh the grid data
    Observable.forkJoin(...deleteSubscriptions)
              .subscribe(results => this.setAthleteRowData())
}
</snippet>

        <p><code>rowsSelected()</code> will return true if the <code>api</code> is ready and if there are rows
            selected.</p>

        <p><code>deleteSelectedRows()</code> - we grab all the selected rows, then delete each row in turn. Finally,
            we call <code>this.setAthleteRowData()</code> to refresh the grid with the current data from the
            database.</p>

        <p>This is a fairly naive and inefficient implementation - there are two obvious improvements to be
            made:</p>
        <ul class="content">
            <li>Batch the deletes - let the middle/backend do the work</li>
            <li>Make use of ag-Grid <a href="../javascript-grid-data-update">Update</a> functionality so that we
                only
                redraw changed/deleted rows, not the entire grid
            </li>
        </ul>

        <p>We'll cover these improvements in a later iteration.</p>

        <h3>Record Creation/Insertion</h3>

        <p>Ok, let's look at something a bit more challenging - inserting new <code>Athlete</code> data. Adding new
            data to the Grid itself is easy, but in order to add a full <code>Athlete</code>, including
            <code>Result</code>
            information, requires a bit more work on the Angular side than we've used so far.</p>

        <p>First, let's create a new component that we'll use for both new record creation, as well as record
            updates later on.</p>

        <p>We'll make use of the Angular CLI to do this for us:</p>

        <snippet>ng g c athlete-edit-screen</snippet>

        <p><code>g</code> is shorthand for generate and <code>c</code> is shorthand for component.</p>

        <p>Let's replace the contents of the template () as follows:</p>

        <snippet language="html">
&lt;div&gt;
    &lt;div style="display: inline-block"&gt;
        &lt;div style="float: left"&gt;
            Name: &lt;input [(ngModel)]="name"/&gt;
        &lt;/div&gt;
        &lt;div style="float: left; padding-left: 10px"&gt;
            Country:
            &lt;select [(ngModel)]="country"&gt;
                &lt;option disabled selected&gt;Country...&lt;/option&gt;
                &lt;option *ngFor="let country of countries" [ngValue]="country"&gt;
                    {{ country.name }}
                &lt;/option&gt;
            &lt;/select&gt;
        &lt;/div&gt;
    &lt;/div&gt;
    &lt;div&gt;
        &lt;button (click)="insertNewResult()"&gt;Insert New Result&lt;/button&gt;
        &lt;ag-grid-angular style="width: 100%; height: 200px;"
                         class="ag-theme-balham"

                         [columnDefs]="columnDefs"
                         [rowData]="rowData"

                         (gridReady)="onGridReady($event)"
                         (rowValueChanged)="onRowValueChanged($event)"&gt;
        &lt;/ag-grid-angular&gt;
    &lt;/div&gt;
    &lt;div&gt;
        &lt;button (click)="saveAthlete()" [disabled]="!isValidAthlete()" style="float: right"&gt;
            Save Athlete
        &lt;/button&gt;
    &lt;/div&gt;
&lt;/div&gt;
</snippet>

        <p>It might look like there's a lot going on here, but what we end up with will be something that looks like
            this:</p>

        <a href="./athlete-edit-1.png" class="thickbox"><img src="./athlete-edit-1.png" style="width: 100%"/></a>

        <p>In a nutshell this screen will show us the full details of an <code>Athlete</code>. In the top row we
            have the <code>name</code> and <code>country</code> fields, and below this we'll list the various
            <code>result</code>'s, if any.</p>

        <p>The Grid that displays the results could have been extracted into it's own component but in the interests
            of expediency
            I've opted to keep it a bit simpler for this demo.</p>

        <p>The corresponding component class breaks down as follows:</p>

        <snippet>
constructor(staticDataService: StaticDataService) {
    staticDataService.countries().subscribe(
        countries => this.countries = countries.sort(StaticDataService.alphabeticalSort()),
        error => console.log(error)
    );

    staticDataService.sports().subscribe(
        sports => {
            // store reference to sports, after sorting alphabetically
            this.sports = sports.sort(StaticDataService.alphabeticalSort());

            // create the column defs
            this.columnDefs = this.createColumnDefs(this.sports)
        },
        error => console.log(error)
    );
}
</snippet>

        <p>Here we retrieve the static <code>sport</code> and <code>country</code> data. The <code>country</code>
            data will be used in the corresponding dropdown on the edit screen, while the <code>sport</code> data is
            passed
            to the column definition code (in the same way we did in the grid component above), to be made available
            in a
            <code>richSelect</code> column.</p>

        <snippet>
insertNewResult() {
    // insert a blank new row, providing the first sport as a default in the sport column
    const updates = this.api.updateRowData(
        {
            add: [{
                sport: this.sports[0]
            }]
        }
    );

    this.api.startEditingCell({
        rowIndex: updates.add[0].rowIndex,
        colKey: 'age'
    });
}
</snippet>

        <p>This is what gets executed when a use want to select a new <code>result</code>. We create a new empty
            record (defaulting the <code>sport</code> <code>richSelect</code> to the first available sport) and ask
            the grid to create a new row for us using <code>this.api.updateRowData</code>.</p>

        <p>The same mechanism can be used for updates as well as deletions - see the corresponding
            <a href="../javascript-grid-data-update">Update</a> documentation for more information around this
            powerful
            piece of functionality that the Grid offers.</p>

        <p>Once the new row has been inserted the Grid provides the new row information to us. Using this we can
            automatically
            start editing the new row (using <code>this.api.startEditingCell</code>) - in this case we start editing
            the first available cell: <code>age</code>.</p>

        <snippet>
@Output() onAthleteSaved = new EventEmitter&lt;Athlete&gt;();

saveAthlete() {
    const athlete = new Athlete();

    athlete.name = this.name;
    athlete.country = this.country;

    athlete.results = [];
    this.api.forEachNode((node) =&gt; {
        const {data} = node;
        athlete.results.push(&lt;Result&gt; {
            id: data.id,
            age: data.age,
            year: data.year,
            date: data.date,
            bronze: data.bronze,
            silver: data.silver,
            gold: data.gold,
            sport: data.sport
        });
    });

    this.onAthleteSaved.emit(athlete);
}
</snippet>

        <p>This is probably the most important part of this class: when a user click on <code>Save Athlete</code>
            the <code>saveAthlete</code> method is invoked. We create an <code>Athlete</code> object and populate it
            with
            our forms details. We then let the parent component (<code>GridComponent</code> in this case) know that
            the save
            is complete, passing in the new <code>Athlete</code>.</p>

        <p>Note: There are of course a few things missing in our implementation here - we're performing only minimal
            validation,
            and the form could do with a cancel button too. As this is for illustrative purposes only, this will do,
            but in
            a real application you'd probably want to flesh this out further.</p>

        <p>The full <code>AthleteEditScreenComponent</code> component isn't described here, primarily as the rest of
            it is either standard Angular functionality (i.e. simple property binding), or has been covered earlier
            in this part of the blog above.</p>

        <p>To finish this section off, let's take a look at how the parent <code>GridComponent</code> component
            process
            the save operation.</p>

        <p>We've updated our template to include the new <code>GridComponent</code>, only showing it if we set the
            <code>editInProgress</code>
            flag:</p>

        <snippet language="html">
&lt;div&gt;
    &lt;button (click)="insertNewRow()" [disabled]="editInProgress"&gt;Insert New Row&lt;/button&gt;
    &lt;button (click)="deleteSelectedRows()" [disabled]="!rowsSelected()"&gt;Delete Selected Row&lt;/button&gt;
&lt;/div&gt;
&lt;div&gt;
    &lt;ag-grid-angular style="width: 100%; height: 500px;"
                 class="ag-theme-balham"

                 [columnDefs]="columnDefs"
                 [rowData]="rowData"

                 rowSelection="multiple"

                 suppressRowClickSelection
                 suppressHorizontalScroll

                 (gridReady)="onGridReady($event)"
                 (cellValueChanged)="onCellValueChanged($event)"&gt;
    &lt;/ag-grid-angular&gt;
&lt;/div&gt;

&lt;ng-template [ngIf]="editInProgress"&gt;
    &lt;app-athlete-edit-screen (onAthleteSaved)="onAthleteSaved($event)"&gt;&lt;/app-athlete-edit-screen&gt;
&lt;/ng-template&gt;
</snippet>

        <p>Note that the <code>GridComponent</code> is listening for save completion here:</p>
        <snippet>(onAthleteSaved)="onAthleteSaved($event)"</snippet>

        <p>And in our <code>GridComponent</code> we process the save operation from
            <code>AthleteEditScreenComponent</code>
            as follows:</p>

        <snippet>
onAthleteSaved(savedAthlete: Athlete) {
    this.athleteService.save(savedAthlete)
                       .subscribe(
                           success => {
                               console.log('Athlete saved');
                               this.setAthleteRowData();
                           },
                           error => console.log(error)
                       );

    this.editInProgress = false;
}
</snippet>

        <p>Here we pass the new <code>Athlete</code> to our <code>AthleteService</code> to be persisted, and one
            saved
            reload the grid data.</p>

        <p>As above, this refreshing of the entire grid data is very inefficient - again, we'll look at improving
            this in
            a later iteration of this.</p>

        <p>Finally, we hide the edit screen once more.</p>

        <p>As above, in a real application some sort of validation would occur here, to ensure that valid data has
            been
            returned - again, we're skipping this for legibility.</p>

        <h3>Record Update/Edit</h3>

        <p>Our last piece of the CRUD operation to completed is the Update part - here we'll take an existing <code>Athlete</code>
            record and allow a user to edit it.</p>

        <p>We'll be making use of the <code>AthleteEditScreenComponent</code> we created above - this time however
            we'll
            pass in an existing record to edit. The rest of the functionality should remain largely unaltered.</p>

        <p>First, we'll update our <code>GridComponent</code> - we'll remove the cell by cell edit functionality we
            added
            earlier, and replace it with an entire record (row) based approach.</p>

        <snippet language="html">
&lt;div&gt;
    &lt;button (click)="insertNewRow()" [disabled]="editInProgress"&gt;Insert New Row&lt;/button&gt;
    &lt;button (click)="deleteSelectedRows()"
            [disabled]="!rowsSelected() || editInProgress"&gt;
            Delete Selected Row
    &lt;/button&gt;
&lt;/div&gt;
&lt;div&gt;
    &lt;ag-grid-angular style="width: 100%; height: 500px;"
                 class="ag-theme-balham"

                 [columnDefs]="columnDefs"
                 [rowData]="rowData"

                 rowSelection="multiple"

                 suppressRowClickSelection
                 suppressHorizontalScroll
                 suppressClickEdit

                 (gridReady)="onGridReady($event)"
                 (rowDoubleClicked)="onRowDoubleClicked($event)"&gt;
    &lt;/ag-grid-angular&gt;
&lt;/div&gt;

&lt;ng-template [ngIf]="editInProgress"&gt;
    &lt;app-athlete-edit-screen [athlete]="athleteBeingEdited"
                         (onAthleteSaved)="onAthleteSaved($event)"&gt;
    &lt;/app-athlete-edit-screen&gt;
&lt;/ng-template&gt;
</snippet>

        <p>There are a number of changes above - let's walk through them:</p>

        <snippet>suppressClickEdit</snippet>

        <p>This property prevents a cell from going into edit mode when double clicked on, which is the default
            behaviour
            for an editable cell. In our application however we want to make use of a separate component to do this for
            us.</p>

        <snippet>(rowDoubleClicked)="onRowDoubleClicked($event)</snippet>

        <p>We've removed the cell edit handler we had before and replaced it with a row based one. We'll use this event
            to launch our <code>AthleteEditScreenComponent</code>.</p>

        <snippet>&lt;app-athlete-edit-screen [athlete]="athleteBeingEdited"</snippet>

        <p>When we display our <code>AthleteEditScreenComponent</code> we'll also pass in an <code>Athlete</code> now.
        </p>

        <p>When creating new a new <code>Athlete</code> this refence will be <code>null</code>, but when we edit an
            existing row we'll pass in the row (or <code>Athlete</code>, as each row of data is an <code>Athlete</code>)
            to be edited with our <code>AthleteEditScreenComponent</code>.</p>

        <snippet>
private athleteBeingEdited: Athlete = null;
onRowDoubleClicked(params: any) {
    if (this.editInProgress) {
        return;
    }

    this.athleteBeingEdited = &lt;Athlete&gt;params.data;
    this.editInProgress = true;
}
</snippet>
        <p>This handler will be invoked when a user double clicks on a row. If an edit is already in progress we'll
            ignore the request, but if not we'll store the row double clicked on - this will be passed to the <code>AthleteEditScreenComponent</code>
            via property binding.</p>

        <p>Finally, we set the <code>editInProgress</code> property which will cause the <code>AthleteEditScreenComponent</code>
            to be displayed.</p>

        <snippet>
onAthleteSaved(savedAthlete: Athlete) {
    this.athleteService.save(savedAthlete)
                       .subscribe(
                           success => {
                               console.log('Athlete saved');
                               this.setAthleteRowData();
                           },
                           error => console.log(error)
                       );

    this.athleteBeingEdited = null;
    this.editInProgress = false;
}
</snippet>
        <p>Here we've made one small change to <code>onAthleteSaved</code> - we reset <code>athleteBeingEdited</code>
            to null once a save operation is complete, so that it's ready for the next insert or edit operation.</p>

        <p>Switching our attention to <code>AthleteEditScreenComponent</code> next, we have a few small changes to make
            to take account of an existing <code>Athlete</code> being passed in to be edited:</p>

        <snippet>@Input() athlete: Athlete = null;</snippet>

        <p>Here we let Angular know that we're expecting an <code>Athlete</code> to be passed in. Something will always
            be passed in here - either a valid <code>Athlete</code> in the case of an edit operation, or
            <code>null</code>
            in the case of an insert operation.</p>

        <snippet>
ngOnInit() {
    if (this.athlete) {
        this.name = this.athlete.name;
        this.country = this.athlete.country;
        this.rowData = this.athlete.results.slice(0);
    }
}
</snippet>

        <p>When our component is initialised we check if an <code>Athlete</code> has been supplied - if it has, then we
            populate our components fields with the details passed in, ready for the user to edit.</p>

        <snippet>
saveAthlete() {
    const athlete = new Athlete();

    athlete.id = this.athlete ? this.athlete.id : null;
</snippet>
        <p>And finally, we check again if we're editing an <code>Athlete</code> when the use clicks save. If we are,
            we also set the <code>Athlete</code> <code>ID</code> so that when it reaches our REST service we'll do an
            update
            on the existing record, as opposed to inserting a new record.</p>

        <p>And that's it! If we now double click on a row we'll be presented with a pre-populated <code>AthleteEditScreenComponent</code>,
            ready for us to edit.</p>

        <a href="./athlete-edit-2.png" class="thickbox"><img src="./athlete-edit-2.png" style="width: 100%"/></a>


        <p>With a little styling applied, we'll end up with this: </p>
        <a href="./fist-pass-complete.png" class="thickbox"><img src="./fist-pass-complete.png"
                                                                 style="width: 100%"/></a>

        <h4>Optimistic Locking</h4>

        <p>We've adopted an optimistic locking stragety here - we assume we can edit/delete something and that no one
            else
            has modified what we're attempting to edit before us.</p>

        <p>This is a fairly mechanism to use, but it has it's downsides. It we attempt to edit/delete something that
            another
            user has edited before us, we'll get an error. This again is normal and in a real application you would code
            for this - either let the user know that this has occurred, or do a check before the user attempts it (or
            both).</p>

        <p>This optimistic locking is by an large handled for us by Spring JPA by the use of versioning. Each time a
            record is
            changes the version will be bumped up and the result stored in the DB. When a change is attemped Spring JPA
            will check
            the current version against the version in the DB - if they're the the same the edit can continue, but if
            not an error will
            be raised.</p>

        <p>This versioning is done by adding the following to the <code>Entity</code>'s we want to version - in our case
            we only need to do this for <code>Athlete</code> and <code>Result</code> (<code>Country</code> and <code>Sport</code>
            cannot be edited).</p>

        <snippet language="java">
@Entity
public class Athlete {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Version()
    private Long version = 0L;
</snippet>

        <p>Here the <code>@Version</code> annotation let's Spring JPA know that we want to version this class - the
            rest just happens automagically!</p>


        <h3>Section Break!</h3>
        <p>This will serve as a good place to do a quick check - we've done an awful lot of coding here, with lots to
            digest.</p>

        <p>The code to this point can be found in the <a href="">Part-4a</a> branch in Github, but you can also see the
            main
            classes etc below.</p>

        <show-sources example=""
                      sources="{
                    [
                        { root: './crud-app/', files: 'app.module.ts' },
                        { root: './crud-app/grid/', files: 'grid.component.ts,grid.component.html' },
                        { root: './crud-app/athlete-edit-screen/', files: 'athlete-edit-screen.component.ts,athlete-edit-screen.component.html' },
                        { root: './crud-app/services/', files: 'athlete.service.ts,static-data.service.ts' },
                        { root: './crud-app/model/', files: 'athlete.model.ts,country.model.ts,result.model.ts,sport.model.ts,static-data.model.ts' }
                    ]
                  }"
                      language="ts"
                      highlight="true"
                      exampleHeight="500px">
        </show-sources>

        <h2>Home Stretch - Final Improvements</h2>

        <p>We're pretty much there now - we'll make two more sets of improvements to what we have so far.</p>

        <p>The first is around look & feel/usability, and the second will be around reducing unnecessary Grid redraws
            (and network calls).</p>

        <h3>Usability - Overlay Edit Component</h3>

        <p>At the moment the <code>AthleteEditScreenComponent</code> appears below the application (specifically below
            the grid).
            This works just fine, but visually it would look & feel better if it would appear over the Grid - make it
            feel
            as if the <code>AthleteEditScreenComponent</code> was part of the Grid itself.</p>

        <p>In order to do this we need capture the Grid co-ordinates and supply them to
            <code>AthleteEditScreenComponent</code>
            when it's about to be displayed, so that <code>AthleteEditScreenComponent</code> can position itself
            accordingly.</p>

        <p>First, let's capture the Grid co-ordinates:</p>

        <snippet language="html">
&lt;ag-grid-angular style="width: 100%; height: 500px;"
         class="ag-theme-balham"

         #grid

         [columnDefs]="columnDefs"
         [rowData]="rowData"

</snippet>

        <p>Here we grab a reference to the grid with <code>#grid</code> - we'll use it to grab the Grids dimensions and
            co-ordinates:</p>

        <snippet>
@ViewChild('grid', {read: ElementRef}) public grid;
private containerCoords: {} = null;

private updateContainerCoords() {
    this.containerCoords = {
        top: this.grid.nativeElement.offsetTop,
        left: this.grid.nativeElement.offsetLeft,
        height: this.grid.nativeElement.offsetHeight,
        width: this.grid.nativeElement.offsetWidth
    };
}
</snippet>

        <p>We store the Grid dimensions and co-ordinates here - we'll update this information just before the <code>AthleteEditScreenComponent</code>
            is displayed (just before a new row is inserted, or when an existing row is double clicked/edited).</p>

        <p>We pass this information to the <code>AthleteEditScreenComponent</code>:</p>

        <snippet language="html">
&lt;ng-template [ngIf]="editInProgress"&gt;
    &lt;app-athlete-edit-screen [athlete]="athleteBeingEdited"
                         [containerCoords]="containerCoords"
                         (onAthleteSaved)="onAthleteSaved($event)"&gt;
    &lt;/app-athlete-edit-screen&gt;
&lt;/ng-template&gt;
</snippet>

        <p>Let's now switch to the <code>AthleteEditScreenComponent</code> and see how we use this.</p>

        <p>In our <code>AthleteEditScreenComponent</code> template we'll store a reference to the main div, and bind to
            the top & left co-ordinates:</p>
        <snippet>
&lt;div class="input-panel" [style.width]="width" [style.top]="top" [style.left]="left" #panel&gt;
&lt;div style="display: inline-block"&gt;
</snippet>

        <p>Then in the <code>AthleteEditScreenComponent</code> component itself:</p>

        <snippet>
// to position this component relative to the containing component
@Input() containerCoords: any = null;
@ViewChild('panel', {read: ElementRef}) public panel;
private width: any;
private left: any;
private top: any;

ngOnInit() {
    this.setPanelCoordinates();
    ... rest of the method
}

private setPanelCoordinates() {
    // make our width 100pixels smaller than the container
    this.width = (this.containerCoords.width - 100);

    // set our left position to be the container left position plus half the difference in widths between this
    // component and the container, minus the 15px padding
    this.left = Math.floor(this.containerCoords.left + (this.containerCoords.width - this.width) / 2 - 15) + 'px';

    // set our left position to be the container top position plus half the difference in height between this
    // component and the container
    this.top = Math.floor(this.containerCoords.top + (this.containerCoords.height - this.panel.nativeElement.offsetHeight) / 2) + 'px';

    // add the px suffix back in (omitted above so that maths can work)
    this.width = this.width + 'px'
}
</snippet>

        <p>With this in place our <code>AthleteEditScreenComponent</code> will position itself within the Grid, which
            makes
            for a better visual experience:</p>

        <a href="./final-app.png" class="thickbox"><img src="./final-app.png" style="width: 100%"/></a>

        <h3>Performance Improvements</h3>

        <p>As we saw earlier, we retrieve the entire Grid data and redraw the entire Grid each time we make a change
            (on either create, update or delete). This is needlessly inefficient, and the Grid can help us do less
            network & Grid draws via use of it's <a href="../javascript-grid-data-update">Update</a> functionality.</p>

        <p>First, we need to define a functional that will allow the Grid to uniquely identify each row in order to
            find data within it.</p>

        <p>We do this by defining a <code>getRowNodeId</code> function and binding to it:</p>

        <snippet language="html">
&lt;ag-grid-angular style="width: 100%; height: 500px;"
         class="ag-theme-balham"

         ...reset of grid definition

         [getRowNodeId]="getRowNodeId"
</snippet>

        <p>And in our Grid component itself:</p>

        <snippet>
getRowNodeId(params) {
    return params.id;
}
</snippet>

        <p>Our data has an obvious attribute to use to uniquely identify each row - the <code>ID</code> attribute.</p>

        <p>We can now use the Grids <code>api.updateRowData</code> functionality to only update/redraw changed rows -
            not the entire grid.</p>

        <p>When we delete row(s):</p>

        <snippet>
deleteSelectedRows() {
    const selectRows = this.api.getSelectedRows();

    // create an Observable for each row to delete
    const deleteSubscriptions = selectRows.map((rowToDelete) => {
        return this.athleteService.delete(rowToDelete);
    });

    // then subscribe to these and once all done, update the grid
    Observable.forkJoin(...deleteSubscriptions)
              .subscribe(
                  results => {
                      // only redraw removed rows...
                      this.api.updateRowData(
                          {
                              remove: selectRows
                          }
                      );
                  }
              );
}
</snippet>

        <p>Once all the rows have been successfully deleted we let the grid know which rows to remove. This results
            is a much faster user experience in that the Grid only redraws removed rows, and that we now no longer make
            another network call to retrieve the latest Grid data.</p>

        <p>When we create or insert rows:</p>

        <snippet>
onAthleteSaved(athleteToSave: Athlete) {
    this.athleteService.save(athleteToSave)
                       .subscribe(
                           savedAthlete => {
                               console.log('Athlete saved', savedAthlete.name);

                               const added = [];
                               const updated = [];
                               if (athleteToSave.id) {
                                   updated.push(savedAthlete);
                               } else {
                                   added.push(savedAthlete);
                               }

                               this.api.updateRowData(
                                   {
                                       add: added,
                                       update: updated
                                   }
                               );
                           },
                           error => console.log(error)
                       );

    this.athleteBeingEdited = null;
    this.editInProgress = false;
}
</snippet>

        <p>The <code>onAthleteSaved</code> method is called when we create a new record, or when we edit an existing
            one.</p>

        <p>In order to tell the Grid if rows are being added or updated, we'll check for the existence of the <code>Athlete</code>
            <code>ID</code> - if it's present we're doing an update, but if it's not we're performing an add.</p>

        <p>With this information we can let the Grid know to either add or update the effected row:</p>

        <snippet>
this.api.updateRowData(
    {
        add: added,
        update: updated
    }
);
</snippet>

        <p>As with the delete improvement above this results in a much faster refresh and a far better user
            experience.</p>

        <p>We've only scratched the surface on what we can do with the Grid here - I suggest you have a look at the
            <a href="../javascript-grid-data-update">Update</a> documentation for more information on what's possible.
        </p>

        <show-sources example=""
                      sources="{
                    [
                        { root: './crud-app-final/', files: 'app.module.ts' },
                        { root: './crud-app-final/grid/', files: 'grid.component.ts,grid.component.html' },
                        { root: './crud-app-final/athlete-edit-screen/', files: 'athlete-edit-screen.component.ts,athlete-edit-screen.component.html' },
                        { root: './crud-app-final/services/', files: 'athlete.service.ts,static-data.service.ts' },
                        { root: './crud-app-final/model/', files: 'athlete.model.ts,country.model.ts,result.model.ts,sport.model.ts,static-data.model.ts' }
                    ]
                  }"
                      language="ts"
                      highlight="true"
                      exampleHeight="500px">
        </show-sources>


        <h2>Summary</h2>

        <p>Well this was a huge part of this series. We covered a lot of material and a lof ground, but we end up with
            a fair example of how you might write your own CRUD application using ag-Grid.</p>

        <p>We've skipped a lot too though - there's very little in the way of validation or error handling here, mostly
            to focus on the important ideas I'm trying to convey, but these are critical and shouldn't be skipped your
            side!</p>

        <p>I hope that this has been helpful - if you have any question please let me know below.</p>

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
                           data-url="https://www.ag-grid.com/ag-grid-datagrid-crud-part-4/"
                           data-text="Building a CRUD Application with ag-Grid Part 4 #angular #aggrid #crud"
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
