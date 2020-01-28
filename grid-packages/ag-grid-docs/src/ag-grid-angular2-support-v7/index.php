<?php

$pageTitle = "ag-Grid Blog: Version 7 Release - Support for Angular 2 and AOT";
$pageDescription = "Version 7 of ag-Grid sees support for Angular 2 and AOT. This is major move forward as we drop our reliance on Runtime Compiler. This blog guides you through the improvements in ag-Grid.";
$pageKeyboards = "ag-Grid javascript datagrid angular 2 aot";

include('../includes/mediaHeader.php');
?>
<link rel="stylesheet" href="../documentation-main/documentation.css">

        <h1>ag-Grid v7: AOT & Angular 2 Components</h1>
        <p class="blog-author">Sean Landsman | 30th November 2016</p>

<div class="row">
    <div class="col-md-8">

        <h2>A Brief History of Time</h2>

        <p>
            Our first pass of Angular 2 support offered a wrapper that allowed users to use ag-Grid within an Angular 2 application but without fully Angular 2 support.
            You could use ag-Grid fully - and it worked well! - but you could not use Angular 2 components, or use the power that Angular 2 offers within the grid (two-way binding and so on).
        </p>

        <p>
            Our second pass of Angular 2 was a fairly big leap - we were able to offer full Angular 2 Component support. You could use it just about everywhere, as Renderers, Editors and Filters!
        </p>
        <p>
            We used the <code>RuntimeCompiler</code> in the background to dynamically compile modules & components - this was great and allowed us to offer the above, as well as being able
            to offer support for template strings withing a cell.
        </p>
        <p>
            ...<strong>but</strong> you could not use Angular 2 Components together with AOT. You had to choose one or the other.
        </p>

        <h2>v7 - The New World</h2>

        <p>With v7, we drop our reliance on the <code>RuntimeCompiler</code> and move to using the <code>ComponentFactoryResolver</code> instead. We are able to do this by making use of <code>entryComponents</code> within our <code>NgModule</code>, which tells the AOT
        compiler to create a <code>ComponentFactory</code> for the Component, and registers it with the <code>ComponentFactoryResolver</code>.</p>

<snippet>
// AgGridModule
@NgModule({
    imports: [],
    declarations: [
        AgGridNg2,
        AgGridColumn
    ],
    exports: [
        AgGridNg2,
        AgGridColumn
    ]
})
export class AgGridModule {
    static withComponents(components:any):ModuleWithProviders {
        return {
            ngModule: AgGridModule,
            providers: [
                Ng2FrameworkFactory,
                Ng2ComponentFactory,
                {provide: BaseComponentFactory, useExisting: Ng2ComponentFactory},
                {provide: ANALYZE_FOR_ENTRY_COMPONENTS, useValue: components, multi: true}
            ],
        };
    }
}</snippet>

<snippet>
// Dynamically instantiating the user supplied Angular 2 Component
factory = this._componentFactoryResolver.resolveComponentFactory(componentType);
let component = viewContainerRef.createComponent(factory);</snippet>

        <p>With this new arrangement, we can now offer full Angular 2 Component support, together with either AOT or JIT support.</p>
        <p>The only downside is that we are no longer able to offer support for template strings, as we are no longer able to dynamically create new Components and Modules. On balance, we feel this trade off was a worthwhile one.</p>

        <p>The new way of declaring Components pushes the responsiblity of <code>Module</code>'s and <code>Component</code>'s up to the user, back where it belongs. It also allows for a simplified interface to the grid - instead of:</p>
<snippet>
{
    headerName: "Clickable Component",
    field: "name",
    cellRendererFramework: {
        component: ClickableParentComponent,
        dependencies: [ClickableComponent]
    },
    width: 200
}</snippet>

        <p>You now only need to do this:</p>
<snippet>
{
    headerName: "Clickable Component",
    field: "name",
    cellRendererFramework: ClickableParentComponent,
    width: 250
}</snippet>

        <h2>Show Me More!</h2>
        <p>Let's replicate what ag-Grid does with a more concrete example.  Let's assume a user wants to use an external component (i.e. ag-Grid) and let it do its thing but also wants to
        be able to supply domain specific components to this external component, for use within it.</p>

        <p>First, here is our domain specific Component:</p>
        <snippet>
@Component({
    selector: 'dynamic-component',
    template: '&lt;span&gt; Dynamic Component! &lt;/span&gt;',
})
export class DynamicComponent {
}</snippet>

        <p>It's not much more than a simple piece of text that we want displayed in our library.</p>

        <p>Next, here is our library component:</p>
        <snippet>
@Component({
    selector: 'grid-component',
    template: `
    &lt;button (click)="addDynamicGridComponent()"&gt;Add Dynamic Grid component&lt;/button&gt;
    &lt;br/&gt;
  `
})
export class GridComponent {
    @Input() componentType: any;

    constructor(private viewContainerRef: ViewContainerRef,
                private cfr: ComponentFactoryResolver) {
    }

    addDynamicGridComponent() {
        let compFactory = this.cfr.resolveComponentFactory(this.componentType);
        this.viewContainerRef.createComponent(compFactory);
    }
}</snippet>

        <p>In this case, we have a button that when clicked will dynamically create a supplied component type beneath it.</p>
        <p>The key part of this component is this block:</p>
        <snippet>
let compFactory = this.cfr.resolveComponentFactory(this.componentType);</snippet>

        <p>This will retrieve the <code>ComponentFactory</code> for the supplied component type, which we can then use to create new instances of it.</p>

        <p>For this to work, we need to ensure that the AOT compiler knows that it needs to create a <code>ComponentFactory</code> for the user supplied components. If we don't
        then our code would work for Just-In-Time (JIT) but not for Ahead-Of-Time (AOT) compilation.</p>

        <snippet>
@NgModule({
    declarations: [
        GridComponent
    ],
    exports: [
        GridComponent
    ]
})
export class GridComponentModule {
    static withComponents(components: any[]) {
        return {
            ngModule: GridComponentModule,
            providers: [
                {provide: ANALYZE_FOR_ENTRY_COMPONENTS, useValue: components, multi: true}
            ]
        }
    }
}</snippet>

        <p>The key part of this module is this line:</p>
        <snippet>
{provide: ANALYZE_FOR_ENTRY_COMPONENTS, useValue: components, multi: true}</snippet>
        <p>Which will add the the entries to <code>entryComponents</code>, which in turn will let the AOT compiler know to create <code>ComponentFactory</code> for the specified components.</p>

        <p>Tying this together, the user code would do the following:</p>
        <snippet>
@NgModule({
    imports: [
        BrowserModule,
        GridComponentModule.withComponents([DynamicComponent])
    ],
    declarations: [AppComponent, DynamicComponent],
    bootstrap: [AppComponent]
})
export class AppModule {
}</snippet>
        <p>And the client component would look like this:</p>
        <snippet>
@Component({
    selector: 'my-app',
    template: `&lt;grid-component [componentType]="getComponentType()"&gt;&lt;/grid-component&gt;
  `
})
export class AppComponent {
    getComponentType() : any {
        return DynamicComponent;
    }
}</snippet>

        <p>You can find all the code for the above example over at <a href="https://github.com/seanlandsman/angular2-dynamic-components">GitHub</a>.</p>

        <h2>Benefits of using AOT</h2>

        <p>The speed and size of the resulting application when using AOT can be significant. In our <a href="https://github.com/ag-grid/ag-grid-angular-example">ag-grid-angular-example</a> project, we estimate the size of the resulting application
            went from 3.9Mb down to 2.4Mb - a reduction of just under 40%, without optimising for size or being particularly aggressive with rollup.</p>

        <p>Speed-wise, the loading time when using AOT is significantly more responsive on startup - this makes sense given that Angular doesn't have to compile all the code once again. Take a look at the examples project and try both the JIT and AOT versions out for yourself!</p>

        <p>There's so much more you can do if you decide to combine Angular 2 Components with ag-Grid - powerful functionality, fast grid and easy configuration. What are you waiting for?!</p>

        <div style="margin-top: 20px;">
            <a href="https://twitter.com/share" class="twitter-share-button" data-url="https://www.ag-grid.com/ag-grid-angular2-support-v7/" data-text="Announcing ag-Grid v7 and Angular 2 Datagrid Support" data-via="seanlandsman" data-size="large">Tweet</a>
            <script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');</script>
        </div>

    </div>
    <?php include '../blog-authors/sean.php' ?>
</div>


<hr/>

<div id="disqus_thread"></div>
<script type="text/javascript">
    /* * * CONFIGURATION VARIABLES * * */
    var disqus_shortname = 'aggrid';

    /* * * DON'T EDIT BELOW THIS LINE * * */
    (function() {
        var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
        dsq.src = '//' + disqus_shortname + '.disqus.com/embed.js';
        (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
    })();
</script>
<noscript>Please enable JavaScript to view the <a href="https://disqus.com/?ref_noscript" rel="nofollow">comments powered by Disqus.</a></noscript>
<hr/>

<?php
include('../includes/mediaFooter.php');
?>
