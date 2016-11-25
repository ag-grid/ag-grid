<?php

$pageTitle = "Angular 2 Datagrid Support";
$pageDescription = "ag-Grid v7 offers full Angular 2 AOT Support - a discussion on what this means for ag-Grid.";
$pageKeyboards = "ag-Grid javascript datagrid pivot";

include('../includes/mediaHeader.php');
?>
<link inline rel="stylesheet" href="../documentation-main/documentation.css">

<div class="row">
    <div class="col-md-12" style="padding-top: 20px; padding-bottom: 20px;">
        <h2><img src="/images/angular2_large.png"/>ag-Grid v7: AOT & Angular 2 Components</h2>
    </div>
</div>

<div class="row">
    <div class="col-md-9">

        <h2>History</h2>

        <h4>ag-grid-ng2: v1 through to v5</h4>
        <p>
            Our first pass of Angular 2 support offered a wrapper that allowed users to use ag-Grid within an Angular 2 application, but without fully Angular 2 support.
            You could use ag-Grid fully - and it worked well! - but you could not use Angular 2 components, or use the power that Angular 2 offers within the grid (two-way binding and so on).
        </p>

        <h4>ag-grid-ng2: v6</h4>
        <p>
            Our second pass of Angular 2 was a fairly big leap - we were able to offer full Angular 2 Component support. You could use it just about everywhere, as Renderers, Editors and Filters!
        </p>
        <p>
            We used the <code>RuntimeCompiler</code> in the background to dynamically compile modules & components - this was great and allowed use to offer the above, as well as being able
            to offer support for template strings withing a cell (i.e. <code>template: '{{params.value * params.value}}'</code>). In the case of template strings we would dynamically create both a new Module as well as a new Component.
        </p>
        <p>
            ...<strong>but</strong>, you could not use Angular 2 Components together with AOT. You had to choose one or the other.
        </p>
        <p>You also had to supply all dependencies (Modules & child Components) at declaration time - this was necessary as we created Modules on the fly and needed to know what to use in the <code>imports</code> and <code>declarations</code>, which wasn't ideal.</p>

        <h2>v7 - The New World</h2>

        <p>With v7 we drop our reliance on the <code>RuntimeCompiler</code> and move to using the <code>ComponentFactoryResolver</code> instead. We are able to do this by making use of <code>entryComponents</code> within our <code>NgModule</code>, which tells the AOT
        compiler to create a <code>ComponentFactory</code> for the Component, and registers it with the <code>ComponentFactoryResolver</code>.</p>

<pre><span class="codeComment">// AgGridModule</span>
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
}
</pre>

<pre>
<span class="codeComment">// Dynamically instantiating the user supplied Angular 2 Component</span>
factory = this._componentFactoryResolver.resolveComponentFactory(componentType);
let component = viewContainerRef.createComponent(factory);
</pre>

        <p>With this new arrangement we can now offer full Angular 2 Component support, together with either AOT or JIT support.</p>
        <p>The only downside is that we are no longer able to offer support for template strings, as we are no longer able to dynamically create new Components and Modules. On balance we feel this trade off was a worthwhile one.</p>

        <p>The new way of declaring Components pushes the responsiblity of <code>Module</code>'s and <code>Component</code>'s up to the user, back where it belongs. It also allows for a simplified interface to the grid - instead of:</p>
<pre>{
    headerName: "Clickable Component",
    field: "name",
    cellRendererFramework: {
        component: ClickableParentComponent,
        dependencies: [ClickableComponent]
    },
    width: 200
}
</pre>

        <p>You now only need to do this:</p>
<pre>{
    headerName: "Clickable Component",
    field: "name",
    cellRendererFramework: ClickableParentComponent,
    width: 250
}
</pre>

        <h2>Benefits of using AOT</h2>

        <p>The speed and size of the resulting application when using AOT can be significant. In our <a href="https://github.com/ceolter/ag-grid-ng2-example">ag-grid-ng2-example</a> project we estimate the size of the resulting application
            went from about 3.9Mb down to 2.4Mb - a reduction of just under 40%. And this was with us not optimising for size or being particularly aggresive with rollup.</p>

        <p>Speed wise the loading time when using AOT is significantly more responsive on startup - this makes sense given that Angular doesn't have to compile all the code once again. Take a look at the examples project and try both the JIT and AOT versions out for yourself!</p>

        <p>There's so much more you can do if you decide to combine Angular 2 Components with ag-Grid - powerful functionality, fast grid and easy configuration. What are you waiting for?!</p>

        <div style="margin-top: 20px;">
            <a href="https://twitter.com/share" class="twitter-share-button" data-url="https://www.ag-grid.com/ag-grid-angular2-support/" data-text="Announcing ag-Grid v6 and Angular 2 Datagrid Support" data-via="seanlandsman" data-size="large">Tweet</a>
            <script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');</script>
        </div>

    </div>
    <div class="col-md-3">

        <div>
            <a href="https://twitter.com/share" class="twitter-share-button" data-url="https://www.ag-grid.com/ag-grid-angular2-support/" data-text="Announcing ag-Grid v6 and Angular 2 Datagrid Support" data-via="seanlandsman" data-size="large">Tweet</a>
            <script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');</script>
        </div>

        <div style="font-size: 14px; background-color: #dddddd; padding: 15px;">

            <p>
                <img src="/images/sean.png"/>
            </p>
            <p>
                About Me
            </p>
            <p>
                I'm an experienced full stack technical lead with an extensive background in enterprise solutions. Over
                19 years in the industry has taught me the value of quality code and good team collaboration. The bulk
                of my background is on the server side, but like Niall am increasingly switching focus to include front end
                technologies.
            </p>
            <p>
                Currently work on ag-Grid full time.
            </p>

            <div>
                <br/>
                <a href="https://www.linkedin.com/in/sean-landsman-9780092"><img src="/images/linked-in.png"/></a>
                <br/>
                <br/>
                <a href="https://twitter.com/seanlandsman" class="twitter-follow-button" data-show-count="false" data-size="large">@seanlandsman</a>
                <script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');</script>
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
    (function() {
        var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
        dsq.src = '//' + disqus_shortname + '.disqus.com/embed.js';
        (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
    })();
</script>
<noscript>Please enable JavaScript to view the <a href="https://disqus.com/?ref_noscript" rel="nofollow">comments powered by Disqus.</a></noscript>
<hr/>

<footer class="license">
    © ag-Grid Ltd 2015-2016
</footer>

<?php
include('../includes/mediaFooter.php');
?>
