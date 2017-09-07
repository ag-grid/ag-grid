<?php
$key = "Getting Started ng2";
$pageTitle = "Angular 2 Datagrid";
$pageDescription = "Demonstrate the best Angular 2 datagrid. Shows and example of a datagrid for using with Angular 2.";
$pageKeyboards = "Angular 2 Grid";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h1>ag-Grid Angular 2 Beta Release (ag-grid-angular 7.0.0-beta.x)</h1>

    <p>
        Prior releases of ag-grid-angular allowed for either AOT (ahead-of-time) compilation <strong>or</strong> Dynamic Angular 2 Components.
        This beta release allows for both to be used together, but does drop the ability to define use cell templates.
        This is a breaking change - the API is very different (out of necessity) so please try this beta and provide feedback to <a href="https://github.com/ag-grid/ag-grid-angular">ag-grid-angular</a>
    </p>

    <note>The beta is in a fork of the core ng2 code - this is deliberate due the breaking nature of this release. The beta is available at <a href="https://github.com/seanlandsman/ag-grid-angular">forked ag-grid-angular</a>
        and <a href="https://github.com/seanlandsman/ag-grid-angular-example">forked ag-grid-angular-example</a>, but please provide feedback at <a href="https://github.com/ag-grid/ag-grid-angular">ag-grid-angular</a></note>

    <h2>Some History</h2>

    <p>
        When we first released support for Angular 2 Components we used <code>DynamicComponentLoader</code>, but shortly after getting this to work it was deprecated. We then started using
        the <code>RuntimeCompiler</code> which worked well and is stable, but is <code>not</code> included in the generated output when using AOT - this exclusion reduces the size of the necessary Angular 2
        code included when using AOT, but does mean that we had to offer our users a choice of either using AOT or Dynamic Components, not both together.
    </p>

    <p>
        Since then we have continued to investigate and learn and have now switched to using <code>ngModule.entryComponents</code> which will allow us to offer the full Angular 2 experience, which is great!
        But..the trade-off is that we have to drop support for template strings in cell definitions.  This is because previously we were able to create Components dynamically and wrap the template string, but
        with the new mechanism the responsibility for the Component is pushed up to the client - we no longer create Components dynamically (we create new instances of supplied components, but not new Component types).
    </p>

    <h3>The New World</h3>

    <p>
        To define the Angular 2 Components you wish to use in the grid, you need to supply them in the module:
    </p>
<snippet>
@NgModule({
    imports: [
        BrowserModule,
        AgGridModule.withComponents(
            [
                SquareComponent,
                CubeComponent,
                ..other Angular 2 components
            ]),
        FormsModule
    ],
    declarations: [
        AppComponent,
        RichGridComponent,
        RichGridDeclarativeComponent,
        FromComponentComponent,
        SquareComponent,
        ..other declarations
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}</snippet>

    <p>The key part of this is that you need to supply any Angular 2 Components in <code>AgGridModule.withComponents</code> - this makes them available to ag-grid.
        If you're not using Angular 2 Components in the grid then you can simply pass in no arguments.</p>

    <p>The column definition is simpler now - you only need to supply the component:</p>
<snippet>
{
    headerName: "Square Component",
    field: "value",
    cellRendererFramework: SquareComponent,
    editable:true,
    colId: "square",
    width: 200
},
...other column definitions</snippet>

    <p>Note here that previously you would have needed to supply either dependent modules (ie FormsModule) or dependant Components as part of the <code>cellRendererFramework</code>,
        but the responsibility for this now moves to the module (where it belongs). If your components need something from a module add the module and an import, and if your Component
        is dependant (or uses) another component, you need to add it the <code>withComponents</code> and <code>declarations</code> part of the module definition</p>

    <h3>ag-Grid Angular 2 Examples</h3>

    <p>
        The <a href="https://github.com/seanlandsman/ag-grid-angular-example">examples project</a> provides two ways to build and run the examples:
        <ul>
            <li>JIT</li>
            <li>AOT</li>
        </ul>
    </p>

    <h3>JIT (Just In Time) Compilation</h3>
    <p>
<snippet>
TypeScript Compilation
npm run tsc
Launch the lite-server and run the JIT version (by default at http://localhost:3000/)
npm run lite</snippet>

    <p>The key part of the JIT index.html (in the root of the project) looks like this:</p>
<snippet>
&lt;script src="systemjs.config.js"&gt;&lt;/script&gt;
&lt;script&gt;
    System.import('app').catch(function (err) {
        console.error(err);
    });
&lt;/script&gt;</snippet>

    <h3>AOT (Ahead of Time) Compilation</h3>
    <p>
<snippet>
TypeScript Compilation, Minifying and Rollup
npm run build:aot
Run the lite-server and run the AOT bundled version (by default at http://localhost:3000/)
npm run lite:aot</snippet>

    We use systemjs-builder for rollup and minification here. All AOT artifacts and assets will be under the <code>aot</code> directory.
    </p>

    <p>The key part of the AOT index.html (under aot/) looks like this:</p>
    <snippet>
&lt;script src="systemjs.config.js"&gt;&lt;/script&gt;
&lt;body&gt;
&lt;my-app&gt;Loading...&lt;/my-app&gt;
&lt;/body&gt;
&lt;script src="./dist/bundle.js"&gt;&lt;/script&gt;</snippet>

</div>

<?php include '../documentation-main/documentation_footer.php'; ?>
