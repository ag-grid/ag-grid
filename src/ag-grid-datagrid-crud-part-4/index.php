<?php

$pageTitle = "Blog: Building a CRUD Application with ag-Grid Part 4";
$pageDescription = "Building a CRUD Application with ag-Grid Part 4";
$pageKeyboards = "ag-grid datagrid crud enterprise";

include('../includes/mediaHeader.php');
?>

<div class="row">
    <div class="col-sm-2" style="padding-top: 20px;">
        <img style="vertical-align: baseline;" src="../images/logo/SVG_ag_grid_bright-bg.svg" width="120px"/>
    </div>
    <div class="col-sm-10" style="padding-top: 40px;">
        <h1 style="margin-top: 0;">Building a CRUD Application with ag-Grid - Part 4</h1>
    </div>
    <div class="row" ng-app="documentation">
        <div class="col-md-9">

            <h2>Summary</h2>

            <p>In Part 4 of this Series we create the scaffolding for our Angular application and get our data displayed
                in our first, simple, grid.</p>

            <h2>Series Chapters</h2>

            <ul>
                <li><a href="../ag-grid-datagrid-crud-part-1/">Part 1</a>: Introduction & Initial Setup: Maven, Spring
                    and JPA/Backend (Database)
                </li>
                <li><a href="../ag-grid-datagrid-crud-part-2/">Part 2</a>: Middle Tier: Exposing our data with a REST
                    Service
                </li>
                <li><a href="../ag-grid-datagrid-crud-part-3/">Part 3</a>: Front End - Initial Implementation</li>
                <li class="bold-roboto">Part 4: Front End - Grid Features & CRUD (Creation, Updates and Deletion)</li>
                <li>Part 5: Front End - Aggregation & Pivoting</li>
                <li>Part 6: Front End - Enterprise Row Model</li>
                <li>Part 7: Packaging (Optional)</li>
                <li>Part 8: Back End (Optional) - Using Oracle DB</li>
            </ul>

            <h2>Introduction</h2>

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

            <img src="./simple-editing.png" style="width: 100%">


            <h3>Persisting Our Edits</h3>

            <p>So far we're not actually doing anything with our edits - let's hook into the changes and save them down
                to the Database.</p>

            <snippet>
&lt;ag-grid-angular style="width: 100%; height: 500px;"
                 class="ag-fresh"

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
                 class="ag-fresh"

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

            <p>What? Why would we want to prevent selection on row clicks? How will we make select a row?</p>

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

            <img src="./checkbox-selection.png" style="width: 100%">

            <p>Next, let's add a button that a user can use to delete the selected rows - we'll also add a utility
                method
                that will disable the delete button if no rows are selected:</p>

            <snippet>
&lt;div&gt;
    &lt;button (click)="deleteSelectedRows()" [disabled]="!rowsSelected()"&gt;Delete Selected Row&lt;/button&gt;
&lt;/div&gt;
&lt;div&gt;
    &lt;ag-grid-angular style="width: 100%; height: 500px;"
                     class="ag-fresh"

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
    selectRows.forEach((rowToDelete) => {
        this.athleteService.delete(rowToDelete)
            .subscribe(
                success => {
                    console.log(`Deleted athlete ${rowToDelete.name}`);
                },
                error => console.log(error)
            );
    });
    this.setAthleteRowData();
}
</snippet>

            <p><code>rowsSelected()</code> will return true if the <code>api</code> is ready and if there are rows
                selected.</p>

            <p><code>deleteSelectedRows()</code> - we grab all the selected rows, then delete each row in turn. Finally,
                we call <code>this.setAthleteRowData()</code> to refresh the grid with the current data from the
                database.</p>

            <p>This is a fairly naive and inefficient implementation - there are two obvious improvements to be
                made:</p>
            <ul>
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
                &lt;option *ngFor="let country of countries" [ngValue]="country"&gt;{{ country.name }}&lt;/option&gt;
            &lt;/select&gt;
        &lt;/div&gt;
    &lt;/div&gt;
    &lt;div&gt;
        &lt;button (click)="insertNewResult()"&gt;Insert New Result&lt;/button&gt;
        &lt;ag-grid-angular style="width: 100%; height: 200px;"
                         class="ag-fresh"

                         [columnDefs]="columnDefs"
                         [rowData]="rowData"

                         (gridReady)="onGridReady($event)"
                         (rowValueChanged)="onRowValueChanged($event)"&gt;
        &lt;/ag-grid-angular&gt;
    &lt;/div&gt;
    &lt;div&gt;
        &lt;button (click)="saveAthlete()" [disabled]="!isValidAthlete()" style="float: right"&gt;Save Athlete&lt;/button&gt;
    &lt;/div&gt;
&lt;/div&gt;
</snippet>

            <p>It might look like there's a lot going on here, but what we end up with will be something that looks like
                this:</p>

            <img src="./athlete-edit-1.png" style="width: 100%">

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
                     class="ag-fresh"

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
    &lt;button (click)="deleteSelectedRows()" [disabled]="!rowsSelected() || editInProgress"&gt;Delete Selected Row&lt;/button&gt;
&lt;/div&gt;
&lt;div&gt;
    &lt;ag-grid-angular style="width: 100%; height: 500px;"
                     class="ag-fresh"

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
                             (onAthleteSaved)="onAthleteSaved($event)"&gt;&lt;/app-athlete-edit-screen&gt;
&lt;/ng-template&gt;
</snippet>

            <p>There are a number of changes above - let's walk through them:</p>

            <snippet>suppressClickEdit</snippet>

            <p>This property prevents a cell from going into edit mode when double clicked on, which is the default behaviour
            for an editable cell. In our application however we want to make use of a separate component to do this for us.</p>

            <snippet>(rowDoubleClicked)="onRowDoubleClicked($event)</snippet>

            <p>We've removed the cell edit handler we had before and replaced it with a row based one. We'll use this event
            to launch our <code>AthleteEditScreenComponent</code>.</p>

            <snippet>&lt;app-athlete-edit-screen [athlete]="athleteBeingEdited"</snippet>

            <p>When we display our <code>AthleteEditScreenComponent</code> we'll also pass in an <code>Athlete</code> now.</p>

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
            <p>Here we've made one small change to <code>onAthleteSaved</code> -  we reset <code>athleteBeingEdited</code>
            to null once a save operation is complete, so that it's ready for the next insert or edit operation.</p>

            <p>Switching our attention to <code>AthleteEditScreenComponent</code> next, we have a few small changes to make
            to take account of an existing <code>Athlete</code> being passed in to be edited:</p>

            <snippet>@Input() athlete: Athlete = null;</snippet>

            <p>Here we let Angular know that we're expecting an <code>Athlete</code> to be passed in. Something will always
            be passed in here - either a valid <code>Athlete</code> in the case of an edit operation, or <code>null</code>
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
            we also set the <code>Athlete</code> <code>ID</code> so that when it reaches our REST service we'll do an update
            on the existing record, as opposed to inserting a new record.</p>

            <p>And that's it! If we now double click on a row we'll be presented with a pre-populated <code>AthleteEditScreenComponent</code>,
            ready for us to edit.</p>

            <img src="./athlete-edit-2.png" style="width: 100%">

            <h2>Summary</h2>

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
        <div class="col-md-3">

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
