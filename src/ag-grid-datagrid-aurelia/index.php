<?php

$pageTitle = "ag-Grid Blog: Announcing Aurelia Datagrid support";
$pageDescription = "We're delighted to announce that we will be supporting Aurelia. You can now use the leading Javascript datagrid with this powerful and flexible framework. Its part of our commitment to support emerging frameworks in the JavaScript space. This blog gives a step-by-step guide to building an Aurelia application with the ag-Grid datagrid.";
$pageKeyboards = "ag-grid datagrid aurelia framework";

include('../includes/mediaHeader.php');
?>

<!-- <link rel="stylesheet" href="../documentation-main/documentation.css"> -->

        <h1> ag-Grid - The Enterprise Datagrid For Aurelia</h1>
        <p class="blog-author">Sean Landsman | 30th November 2016</p>

<div class="row">
    <div class="col-md-8">

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
<snippet>
@customElement('ag-grid-aurelia')
// &lt;slot&gt; is required for @children to work.
// https://github.com/aurelia/templating/issues/451#issuecomment-254206622
@inlineView(`&lt;template&gt;&lt;slot&gt;&lt;/slot&gt;&lt;/template&gt;`)
@autoinject()
export class AgGridAurelia implements ComponentAttached, ComponentDetached {
...</snippet>
        <p>
            The grid definition (which we'll get to in a minute) consists of the parent selector (<code>ag-grid-aurelia</code>) and a number of child <code>ag-grid-column</code>'s.
        </p>
<snippet>
@children('ag-grid-column')
public columns: AgGridColumn[] = [];</snippet>
        <p>During the creation and initialisation phases, we dynamically create all available grid events, set all provided gridOptions, map supplied column definitions to colDefs and finally instantiate
        ag-Grid itself:</p>
<snippet>
// create all available grid events
// create all the events generically. this is done generically so that
// if the list of grid events change, we don't need to change this code.
ComponentUtil.EVENTS.forEach((eventName) =&gt; {
    //create an empty event
    (&lt;any&gt;this)[eventName] = () =&gt; {
    };
});

// copy supplied properties to gridOptions
this.gridOptions = ComponentUtil.copyAttributesToGridOptions(this.gridOptions, this);
this.gridParams = {
    globalEventListener: this.globalEventListener.bind(this),
    frameworkFactory: this.auFrameworkFactory
};

// map supplied column definitions to expected colDefs
if (this.columns && this.columns.length &gt; 0) {
    this.gridOptions.columnDefs = this.columns
        .map((column: AgGridColumn) =&gt; {
            return column.toColDef();
        });
}

// instantiate ag-Grid with the supplied configuration
new Grid(this._nativeElement, this.gridOptions, this.gridParams);</snippet>

        <p>Note: this is an abridged version of what actually happens for brevity's sake.</p>

        <h4>Mapping Columns to Template Types</h4>
        <p>Each type of column is defined by a selector and then converted to a colDef that the grid understands. This is done in <code>AgGridColumn</code>:</p>
<snippet>
@autoinject()
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
            (&lt;any&gt;colDef)["children"] = this.getChildColDefs(this.childColumns);
        }

        if (this.cellTemplate) {
            colDef.cellRendererFramework = {template: this.cellTemplate.template};
            delete (&lt;any&gt;colDef).cellTemplate;
        }

        if (this.editorTemplate) {
            colDef.editable = true;
            colDef.cellEditorFramework = {template: this.editorTemplate.template};
            delete (&lt;any&gt;colDef).editorTemplate;
        }
        ...</snippet>

        <p>So for example, if we defined a column as follows:</p>
<snippet>
&lt;ag-grid-column header-name="Mood" field="mood" width.bind="250" editable.bind="true"&gt;
    &lt;ag-cell-template&gt;
      &lt;img width="20px" if.bind="params.value === 'Happy'" src="images/smiley.png"/&gt;
      &lt;img width="20px" if.bind="params.value !== 'Happy'" src="images/smiley-sad.png"/&gt;
    &lt;/ag-cell-template&gt;
    &lt;ag-editor-template&gt;
      &lt;ag-mood-editor&gt;&lt;/ag-mood-editor&gt;
    &lt;/ag-editor-template&gt;
&lt;/ag-grid-column&gt;</snippet>

        <p>This in turn woud be mapped to a column with a defined cell renderer and cell editor.</p>

        <p>That's pretty much it! In time - and if there's sufficient interest - we'll look at being able to create Renderers,
        Editors and Filters from Components, in the same way that we do with Angular. Based on feedback we've received this
        declarative/markup driven definition works well for now.</p>

        <p>Give it a go - Aurelia is a fun framework and now you can use it with the best Enterprise Data Grid around! Take a look at our <a href="https://ag-grid.github.io/ag-grid-aurelia-example/#/rich-grid" target="_blank" class="fa fa-external-link"> live examples site</a>. Feedback is always welcome! </p>
        <!-- end of content -->

        <div style="margin-top: 20px;">
            <a href="https://twitter.com/share" class="twitter-share-button" data-url="https://www.ag-grid.com/ag-grid-aurelia-support/" data-text="Announcing ag-Grid v6 and aurelia Datagrid Support" data-via="seanlandsman" data-size="large">Tweet</a>
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