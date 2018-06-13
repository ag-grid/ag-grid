<!-- Aurelia from here -->
<h2 id="aureliaCellRendering"> Aurelia Cell Rendering </h2>

<p>
    It is possible to provide Aurelia cell renderers for ag-Grid to use if you are are using the
    Aurelia version of ag-Grid.
</p>

<p>
    For examples on Aurelia cellRendering, see the
    <a href="https://github.com/ag-grid/ag-grid-aurelia-example">ag-grid-aurelia-example</a> on Github.</p>
</p>

<h3 id="specifying-a-aurelia-cell-renderer"> Specifying a Aurelia Cell Renderer</h3>

<p>
    If you are using the ag-grid-aurelia component to create the ag-Grid instance,
    then you will have the option of additionally specifying the cell renderers
    as aurelia components. You have two options that are described below:
</p>

<ol class="content">
    <li>Templates</li>
    <li>Cell Renderer Functions or Cell Renderer Components</li>
</ol>

<p>
    We only mention Templates here - using functions or regular components is discussed above in earlier sections.
</p>


<h3 id="cell-renderers-from-templates"> Cell Renderers from Templates</h3>

<snippet>
// create your cellRenderer as an Aurelia template
&lt;ag-grid-aurelia #agGrid style="width: 100%; height: 100%;" class="ag-theme-balham"
                 grid-options.bind="gridOptions"&gt;
  &lt;ag-grid-column header-name="Mood" field="mood" width.bind="150" editable.bind="true"&gt;
    &lt;ag-cell-template&gt;
      &lt;img width="20px" if.bind="params.value === 'Happy'" src="images/smiley.png"/&gt;
      &lt;img width="20px" if.bind="params.value !== 'Happy'" src="images/smiley-sad.png"/&gt;
    &lt;/ag-cell-template&gt;
  &lt;/ag-grid-column&gt;
&lt;/ag-grid-aurelia&gt;</snippet>

<p>The advantage of using Templates for your renderers is that you have the ability to use Aurelia's dynamic data binding facilties.</p>

<note>The full <a href="https://github.com/ag-grid/ag-grid-aurelia-example">ag-grid-aurelia-example</a> repo shows many more examples for rendering, including grouped rows, full width renderers and filters.</note>