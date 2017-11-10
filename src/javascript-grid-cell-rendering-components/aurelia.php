<!-- Aurelia from here -->
<h2 id="aureliaCellRendering">
    <img src="../images/aurelia_large.png" style="width: 60px;"/>
    Aurelia Cell Rendering
</h2>

<div class="note" style="margin-bottom: 20px">
    <img align="left" src="../images/note.png" style="margin-right: 10px;" />
    <p>This section explains how to utilise ag-Grid cellRenders using Aurelia. You should read about how
    <a href="/">Cell Rendering works in ag-Grid</a> first before trying to
    understand this section.</p>
</div>

<p>
    It is possible to provide Aurelia Component cell renderer's for ag-Grid to use, with support for two way binding. All of the information above is
    relevant to Aurelia cell renderer's. This section explains how to apply this logic to your Aurelia component.
</p>

<p>
    For examples on Aurelia cellRendering, see the
    <a href="https://github.com/ag-grid/ag-grid-angular-example">ag-grid-aurelia-example</a> on Github.</p>
</p>

<h3 id="specifying-a-aurelia-cell-renderer"><img src="../images/aurelia_large.png" style="width: 20px;"/> Specifying a Aurelia Cell Renderer</h3>

<p>
    If you are using the ag-grid-aurelia component to create the ag-Grid instance,
    then you will have the option of additionally specifying the cell renderer's
    as aurelia components. You have two options that are described below:
<ol>
    <li>Templates</li>
    <li>Cell Renderer Functions or Cell Renderer Components</li>
</ol>

    We only mention Templates here - using functions or regular components is discussed above in earlier sections.
</p>


<h3 id="cell-renderers-from-templates"><img src="../images/aurelia_large.png" style="width: 20px;"/> Cell Renderer's from Templates</h3>
<snippet>
// create your cellRenderer as an Aurelia template
&lt;ag-grid-aurelia #agGrid style="width: 100%; height: 100%;" class="ag-theme-fresh"
                 grid-options.bind="gridOptions"&gt;
  &lt;ag-grid-column header-name="Mood" field="mood" width.bind="150" editable.bind="true"&gt;
    &lt;ag-cell-template&gt;
      &lt;img width="20px" if.bind="params.value === 'Happy'" src="images/smiley.png"/&gt;
      &lt;img width="20px" if.bind="params.value !== 'Happy'" src="images/smiley-sad.png"/&gt;
    &lt;/ag-cell-template&gt;
  &lt;/ag-grid-column&gt;
&lt;/ag-grid-aurelia&gt;</snippet>

<p>The advantage of using Templates for your renderers is that you have the ability to use Aurelia's dynamic data binding facilties.</p>

<br/>
<note>The full <a href="https://github.com/ag-grid/ag-grid-aurelia-example">ag-grid-aurelia-example</a> repo shows many more examples for rendering, including grouped rows, full width renderers and filters.</note>