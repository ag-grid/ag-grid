<?php

$pageTitle = "ag-Grid Blog: Understanding AOT and Dynamic Components";
$pageDescription = "Sean Landsman takes you through AOT and Dynamic Components in Angular 2. Drawing on his experience from using them at ag-Grid. The blog post contains simple step by step guide.";
$pageKeyboards = "ag-Grid javascript datagrid angular 2 aot dynamic compontents";

include('../includes/mediaHeader.php');
?>

<h1> Understanding AOT and Dynamic Components in Angular 2</h1>
<p class="blog-author">Sean Landsman | 8th December 2016</p>

<div class="row">
    <div class="col-md-8">

        <h2>Motivation</h2>

        <p>
            ag-Grid is an enterprise datagrid that works with Angular 2.
            As ag-Grid works with many frameworks, the internals of the grid
            had to allow for Angular 2 rendering inside the grid despite ag-Grid not being written in Angular itself.
            This was done using Angular 2 Dynamic Components and we managed to do it while still supporting AOT. This blog details what we learnt along the way.
        </p>

        <h2>The Setup</h2>

        <p>
            To explain we present a simple sample application that isolates what we are trying to do.
            In our example below we are going to develop two main Modules - one will be a Library (in our case
            this was ag-Grid) that will display
            an array of dynamically created Components (similar to how ag-Grid displays Angular components inside
            the grid's cells), and the other will be our actual Application.
        </p>

        <p>The end result will be look like this:</p>
        <img src="../images/ng2_aot_final.png" style="width: 100%"/>

        <p>You can find all the code for this example over at <a href="https://github.com/seanlandsman/angular2-dynamic-components">GitHub</a>, and the live example over at <a href="https://seanlandsman.github.io/angular2-dynamic-components/">GitHub.io</a></p>

        <p>One further note - when we return to "user" below, we are referring to a user (or client) of the Library we're writing.</p>


        <h3>The Library</h3>
        <p>Our Library is going to be a simple one - all it does is display an array of dynamically created Angular 2 Components. The main component looks like this:</p>
        <snippet>
@Component({
    selector: 'grid-component',
    template: `
        &lt;div class="row" *ngFor="let cellComponentType of cellComponentTypes"&gt;
            &lt;&lt;div class="col-lg-12"&gt;
                &lt;grid-cell [componentType]="cellComponentType"&gt;&lt;/grid-cell&gt;
            &lt;/div&gt;
        &lt;/div&gt;
    `
})
export class Grid {
    @Input() componentTypes: any;

    cellComponentTypes: any[] = [];

    addDynamicCellComponent(selectedComponentType:any) {
        this.cellComponentTypes.push(selectedComponentType);
    }
}</snippet>

    <p>As you can see it's a pretty simple component - all it does is display the current <code>cellComponentTypes</code>. These are the user supplied components, and they can be any Angular 2 Component.</p>
        <p>The interesting part of the Library is in the <code>Cell</code> Component:</p>
        <snippet>
@Component({
    selector: 'grid-cell',
    template: ''
})
export class Cell implements OnInit {
    @Input() componentType: any;

    constructor(private viewContainerRef: ViewContainerRef,
                private cfr: ComponentFactoryResolver) {
    }

    ngOnInit() {
        let compFactory = this.cfr.resolveComponentFactory(this.componentType);
        this.viewContainerRef.createComponent(compFactory);
    }
}</snippet>

        <p>You'll notice that we don't have a template here - that's deliberate as the <code>Cell</code> doesn't have any content of its own - all it does is serve up the user supplied Component. The important part of this Component are these two lines:</p>
        <snippet>
let compFactory = this.cfr.resolveComponentFactory(this.componentType);</snippet>
        <p>This line asks the <code>ComponentFactoryResolver</code> to find the <code>ComponentFactory</code> for the provided Component. We'll use this factory next to create the actual component:</p>
<snippet>
this.viewContainerRef.createComponent(compFactory);</snippet>

        <p>And that's all there is to it from the Library Component side of things - we find the factory for the Component, and then create a new instance of the Component. Easy!</p>

        <p>For this to work we need to tell Angular's AOT Compiler to create factories for the user provided Components, or <code>ComponentFactoryResolver</code> won't find them. We can make use of
            <code>NgModule.entryComponents</code> for this - this will ensure that the AOT compiler creates the necessary factories, but for you purposes there is an easier way, especially from a users perspective:</p>
        <snippet>
@NgModule({
    imports: [
        BrowserModule,
        FormsModule
    ],
    declarations: [
        Grid,
        Cell
    ],
    exports: [
        Grid
    ]
})
export class GridModule {
    static withComponents(components: any[]) {
        return {
            ngModule: GridModule,
            providers: [
                {provide: ANALYZE_FOR_ENTRY_COMPONENTS, useValue: components, multi: true}
            ]
        }
    }
}</snippet>

        <p>By making use of <code>ANALYZE_FOR_ENTRY_COMPONENTS</code> here, we are able to add multiple components to the <code>NgModule.entryComponents</code> entry dynamically, in a user friendly way.</p>

        <h3>The Application</h3>

        <p>From the application side of things, the first thing we need to do is create the components we want to use in the Library - these can be any valid Angular 2 Component. In our case we have three similar Components:</p>
        <snippet>
@Component({
    selector: 'dynamic-component',
    template: '&lt;div class="img-rounded" style="background-color: lightskyblue;margin: 5px"&gt; Blue Dynamic Component! &lt;/div&gt;',
})
export class BlueDynamicComponent {
}</snippet>

        <p>All these components do is display a little styled text.</p>

        <p>To register these in both our Application, and in the Library, we need to switch to the Application Module:</p>
        <snippet>
@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        GridModule.withComponents([
            BlueDynamicComponent,
            GreenDynamicComponent,
            RedDynamicComponent
        ])
    ],
    declarations: [
        AppComponent,
        BlueDynamicComponent,
        GreenDynamicComponent,
        RedDynamicComponent
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}</snippet>

        <p>We declare our Components in the usual way, but we additionally need to register them with the Library (remember, this is the part where they'll be added to the
            Library's <code>NgModule.entryComponent</code> entry). We do this in this part of the module:</p>
        <snippet>
GridModule.withComponents([
    BlueDynamicComponent,
    GreenDynamicComponent,
    RedDynamicComponent
])</snippet>

        <p>Finally, we can take a look at the main Application Component:</p>
        <snippet>
@Component({
    selector: 'my-app',
    template: `
        &lt;div class="container-fluid"&gt;
            &lt;div class="page-header"&gt;
                &lt;h1&gt;Creating AOT Friendly Dynamic Components with Angular 2&lt;/h1&gt;
            &lt;/div&gt;
            &lt;div class="row"&gt;
                &lt;div class="col-lg-12"&gt;
                    &lt;div class="panel panel-default"&gt;
                        &lt;div class="panel-heading"&gt;Application Code&lt;/div&gt;
                        &lt;div class="panel-body"&gt;
                            &lt;div class="input-group"&gt;
                                &lt;span class="input-group-btn"&gt;
                                    &lt;button type="button" class="btn btn-primary" (click)="grid.addDynamicCellComponent(selectedComponentType)"&gt;Add Dynamic Grid component&lt;/button&gt;
                                &lt;/span&gt;

                                &lt;select class="form-control" [(ngModel)]="selectedComponentType"&gt;
                                    &lt;option *ngFor="let cellComponentType of componentTypes" [ngValue]="cellComponentType"&gt;{{cellComponentType.name}}&lt;/option&gt;
                                &lt;/select&gt;
                            &lt;/div&gt;
                        &lt;/div&gt;
                    &lt;/div&gt;
                &lt;/div&gt;
            &lt;/div&gt;
            &lt;div class="row"&gt;
                &lt;div class="col-lg-12"&gt;
                    &lt;div class="panel panel-default"&gt;
                        &lt;div class="panel-heading"&gt;Library Code&lt;/div&gt;
                        &lt;div class="panel-body"&gt;
                            &lt;grid-component #grid&gt;&lt;/grid-component&gt;
                        &lt;/div&gt;
                    &lt;/div&gt;
                &lt;/div&gt;
            &lt;/div&gt;
        &lt;/div&gt;
    `
})
export class AppComponent implements OnInit {
    @Input() componentTypes: any[] = [BlueDynamicComponent, GreenDynamicComponent, RedDynamicComponent];
    @Input() selectedComponentType: any;

    ngOnInit(): void {
        // default to the first available option
        this.selectedComponentType = this.componentTypes ? this.componentTypes[0] : null;
    }
}</snippet>

        <p>It may look like theres a lot going on here, but the bulk of the template is to make it look pretty. The key parts of this Component are:</p>

        <snippet>
&lt;button type="button" class="btn btn-primary" (click)="grid.addDynamicCellComponent(selectedComponentType)"&gt;Add Dynamic Grid component&lt;/button&gt;</snippet>

        <p>This will ask the Library to add a create a new instance of the supplied Component, and in turn render it.</p>

        <snippet>
&lt;grid-component #grid&gt;&lt;/grid-component&gt;</snippet>

        <p>And this line is our Library Component.</p>

        <p>That's it - easy to write and use (from both an Application and Library perspective), and AOT (and JIT!) friendly.</p>

        <h2>Benefits of using AOT</h2>

        <p>The speed and size of the resulting application when using AOT can be significant. In our <a href="https://github.com/ag-grid/ag-grid-angular-example">ag-grid-angular-example</a> project, we estimate the size of the resulting application
            went from 3.9Mb down to 2.4Mb - a reduction of just under 40%, without optimising for size or being particularly aggressive with rollup.</p>

        <p>Speed-wise, the loading time when using AOT is significantly more responsive on startup - this makes sense given that Angular doesn't have to compile all the code once again. Take a look at the examples project and try both the JIT and AOT versions out for yourself!</p>

        <p>There's so much more you can do if you decide to combine Angular 2 Components with ag-Grid - powerful functionality, fast grid and easy configuration. What are you waiting for?!</p>

        <div style="margin-top: 20px;">
            <a href="https://twitter.com/share" class="twitter-share-button" data-url="https://www.ag-grid.com/ag-grid-angular-aot-dynamic-components/" data-text="Understanding AOT and Dynamic Components in Angular 2" data-via="seanlandsman" data-size="large">Tweet</a>
            <script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');</script>
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
