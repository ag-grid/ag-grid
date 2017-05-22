<?php

$pageTitle = "Aurelia Datagrid Support";
$pageDescription = "ag-Grid v7 offers Auerlia Support - a discussion on what this means for ag-Grid.";
$pageKeyboards = "ag-Grid javascript datagrid aurelia framework";

include('../includes/mediaHeader.php');
?>
<link rel="stylesheet" href="../documentation-main/documentation.css">

<div class="row">
    <div class="col-md-12" style="padding-top: 20px; padding-bottom: 20px;">
        <h2><img src="/images/aurelia_large.png"/> ag-Grid - The Enterprise Datagrid For Aurelia</h2>
    </div>
</div>

<div class="row">
    <div class="col-md-9">

        <p>Here at ag-Grid, we are very excited to be able to offer support for Aurelia! Aurelia is a powerful and flexible framework that makes developing applications a breeze.</p>

        <p>In this post, I won't be documenting how to use Aurelia in ag-Grid but rather on how
        we added support for Aurelia within the grid itself. For details on how to use Aurelia in ag-Grid, take a look at the <a href="../best-aurelia-data-grid">ag-Grid Aurelia</a> documentation.</p>

        <h4>AgGridAurelia</h4>
        <p>
            Following the model used by our Angular offering, we created a new Custom Component that wraps ag-Grid, passing events & properties back and forth between the Custom Component and the grid.
            Doing this keeps ag-Grid framework agnostic, a core design principle here at ag-Grid.
        </p>
        <p>
            <code>AgGridAurelia</code> is the main Custom Component for Aurelia - it handles all core grid events and properties, as well as initial instantiation and removal.
        </p>
<pre>
@customElement('ag-grid-aurelia')
// &lt;slot> is required for @children to work.
// https://github.com/aurelia/templating/issues/451#issuecomment-254206622
@inlineView(`&lt;template>&lt;slot>&lt;/slot>&lt;/template>`)
@autoinject()
export class AgGridAurelia implements ComponentAttached, ComponentDetached {
...
</pre>
        <p>
            The grid definition (which we'll get to in a minute) consists of the parent selector (<code>ag-grid-aurelia</code>) and a number of child <code>ag-grid-column</code>'s.
        </p>
<pre>
@children('ag-grid-column')
public columns: AgGridColumn[] = [];
</pre>
        <p>During the creation and initialisation phases, we dynamically create all available grid events, set all provided gridOptions, map supplied column definitions to colDefs and finally instantiate
        ag-Grid itself:</p>
<pre><span class="codeComment">// create all available grid events</span>
// create all the events generically. this is done generically so that
// if the list of grid events change, we don't need to change this code.
ComponentUtil.EVENTS.forEach((eventName) => {
    //create an empty event
    (<any>this)[eventName] = () => {
    };
});

<span class="codeComment">// copy supplied properties to gridOptions</span>
this.gridOptions = ComponentUtil.copyAttributesToGridOptions(this.gridOptions, this);
this.gridParams = {
    globalEventListener: this.globalEventListener.bind(this),
    frameworkFactory: this.auFrameworkFactory
};

<span class="codeComment">// map supplied column definitions to expected colDefs</span>
if (this.columns && this.columns.length > 0) {
    this.gridOptions.columnDefs = this.columns
        .map((column: AgGridColumn) => {
            return column.toColDef();
        });
}

<span class="codeComment">// instantiate ag-Grid with the supplied configuration</span>
new Grid(this._nativeElement, this.gridOptions, this.gridParams);
</pre>

        <p>Note: this is an abridged version of what actually happens for brevity's sake.</p>

        <h4>Mapping Columns to Template Types</h4>
        <p>Each type of column is defined by a selector and then converted to a colDef that the grid understands. This is done in <code>AgGridColumn</code>:</p>
<pre>@autoinject()
export class AgGridColumn {
    @children('ag-grid-column')
    public childColumns:AgGridColumn[] = [];

    @child('ag-cell-template')
    public cellTemplate:AgCellTemplate;

    @child('ag-editor-template')
    public editorTemplate:AgEditorTemplate;
    ...

    public toColDef():ColDef {
        let colDef:ColDef = this.createColDefFromGridColumn();

        if (this.hasChildColumns()) {
            (<any>colDef)["children"] = this.getChildColDefs(this.childColumns);
        }

        if (this.cellTemplate) {
            colDef.cellRendererFramework = {template: this.cellTemplate.template};
            delete (<any>colDef).cellTemplate;
        }

        if (this.editorTemplate) {
            colDef.editable = true;
            colDef.cellEditorFramework = {template: this.editorTemplate.template};
            delete (<any>colDef).editorTemplate;
        }
        ...
</pre>

        <p>So for example, if we defined a column as follows:</p>
<pre>
&lt;ag-grid-column header-name="Mood" field="mood" width.bind="250" editable.bind="true">
    &lt;ag-cell-template>
      &lt;img width="20px" if.bind="params.value === 'Happy'" src="images/smiley.png"/>
      &lt;img width="20px" if.bind="params.value !== 'Happy'" src="images/smiley-sad.png"/>
    &lt;/ag-cell-template>
    &lt;ag-editor-template>
      &lt;ag-mood-editor></ag-mood-editor>
    &lt;/ag-editor-template>
&lt;/ag-grid-column>
</pre>

        <p>This in turn woud be mapped to a column with a defined cellRenderer and cellEditor.</p>

        <p>That's pretty much it! In time - and if there's sufficient interest - we'll look at being able to create Renderers,
        Editors and Filters from Components, in the same way that we do with Angular. Based on feedback we've received this
        declarative/markup driven definition works well for now.</p>

        <p>Give it a go - Aurelia is a fun framework and now you can use it with the best Enterprise Data Grid around! Take a look at our <a href="https://ceolter.github.io/ag-grid-aurelia-example/#/rich-grid" target="_blank" class="fa fa-external-link"> live examples site</a>. Feedback is always welcome! </p>
        <!-- end of content -->

        <div style="margin-top: 20px;">
            <a href="https://twitter.com/share" class="twitter-share-button" data-url="https://www.ag-grid.com/ag-grid-aurelia-support/" data-text="Announcing ag-Grid v6 and aurelia Datagrid Support" data-via="seanlandsman" data-size="large">Tweet</a>
            <script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');</script>
        </div>

    </div>
    <div class="col-md-3">

        <div>
            <a href="https://twitter.com/share" class="twitter-share-button" data-url="https://www.ag-grid.com/ag-grid-aurelia-support/" data-text="Announcing ag-Grid v6 and aurelia Datagrid Support" data-via="seanlandsman" data-size="large">Tweet</a>
            <script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');</script>
        </div>

        <div style="font-size: 14px; background-color: #dddddd; padding: 15px;">

            <p>
                <img src="/images/sean.png"/>
            </p>
            <p style="font-weight: bold;">
                Sean Landsman
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
    © ag-Grid Ltd. 2015-2017
</footer>

<?php
include('../includes/mediaFooter.php');
?>
