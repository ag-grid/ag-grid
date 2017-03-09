<!-- Aurelia from here -->
<h2 id="aureliaCellRendering">
    <img src="../images/aurelia_large.png" style="width: 60px;"/>
    Aurelia Cell Rendering
</h2>

<div class="note" style="margin-bottom: 20px">
    <img align="left" src="../images/note.png" style="margin-right: 10px;" />
    <p>This section explains how to utilise ag-Grid cellRenders using Aurelia. You should read about how
    <a href="../javascript-grid-cell-rendering/">Cell Rendering works in ag-Grid</a> first before trying to
    understand this section.</p>
</div>

<p>
    It is possible to provide Aurelia Component cellRenderers for ag-Grid to use, with support for two way binding. All of the information above is
    relevant to Aurelia cellRenderers. This section explains how to apply this logic to your Aurelia component.
</p>

<p>
    For examples on Aurelia cellRendering, see the
    <a href="https://github.com/ceolter/ag-grid-angular-example">ag-grid-aurelia-example</a> on Github.</p>
</p>

<h3 id="specifying-a-aurelia-cell-renderer"><img src="../images/aurelia_large.png" style="width: 20px;"/> Specifying a Aurelia cellRenderer</h3>

<p>
    If you are using the ag-grid-aurelia component to create the ag-Grid instance,
    then you will have the option of additionally specifying the cellRenderers
    as aurelia components. You have two options that are described below:
<ol>
    <li>Templates</li>
    <li>cellRenderer Functions or cellRenderer Components</li>
</ol>

    We only mention Templates here - using functions or regular components is discussed above in earlier sections.
</p>


<h3 id="cell-renderers-from-templates"><img src="../images/aurelia_large.png" style="width: 20px;"/> cellRenderers from Templates</h3>
<pre><span class="codeComment">// create your cellRenderer as an Aurelia template</span>
&lt;ag-grid-aurelia #agGrid style="width: 100%; height: 100%;" class="ag-fresh"
                 grid-options.bind="gridOptions">
  &lt;ag-grid-column header-name="Mood" field="mood" width.bind="150" editable.bind="true">
    &lt;ag-cell-template>
      &lt;img width="20px" if.bind="params.value === 'Happy'" src="images/smiley.png"/>
      &lt;img width="20px" if.bind="params.value !== 'Happy'" src="images/smiley-sad.png"/>
    &lt;/ag-cell-template>
  &lt;/ag-grid-column>
&lt;/ag-grid-aurelia>
</pre>

<p>The advantage of using Templates for your renderers is that you have the ability to use Aurelia's dynamic data binding facilties.</p>

<h3 id="example-rendering-using-templates">Example: Rendering using Templates</h3>
<p>
    Using Templates in the Cell Renderers - here we're using a Template (<code>ag-cell-template</code>) to render the Mood column depending on the underlying value
    of the "mood" field.
</p>

<show-example example="../aurelia-example/#/editor/true"
              jsfile="../aurelia-example/components/editor-example/editor-example.ts"
              html="../aurelia-example/components/editor-example/editor-example.html"></show-example>

<h3 id="example-rendering-using-regular-cell-renderer-components">Example: Rendering using regular cellRenderer Components</h3>
<p>
    A Rich Grid leveraging regular Cell Renderer Components
</p>

<show-example example="../aurelia-example/#/richgrid-declarative/true"
          jsfile="../aurelia-example/components/rich-grid-declarative-example/rich-grid-declarative-example.ts"
          html="../aurelia-example/components/rich-grid-declarative-example/rich-grid-declarative-example.html"
          exampleHeight="525px"></show-example>

<br/>
<note>The full <a href="https://github.com/ceolter/ag-grid-aurelia-example">ag-grid-aurelia-example</a> repo shows many more examples for rendering, including grouped rows, full width renderers and filters.</note>