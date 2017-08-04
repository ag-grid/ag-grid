<h2 id="angular-header-component">
    <img src="../images/angular2_large.png" style="width: 60px;"/>
    Angular Header Component
</h2>


<h3 id="header-component">Header Component</h3>

<p>
    Implementing a header component in Angular differs from the standard header component in the following ways:
    <ul>
        <li>Implement <i>IHeaderAngularComp</i> instead of <i>IHeaderComp</i>.</li>
        <li>Use <i>colDef.headerComponentFramework</i> instead of <i>colDef.headerComponent</i>.</li>
    </ul>
</p>

<p>
    The interface <i>IHeaderAngularComp</i> is as follows:
</p>

<pre>interface IHeaderAngularComp {

    <span class="codeComment">// equivalent of init in IHeaderComp</span>
    <span class="codeComment">// IHeaderCompParams is same as non Angular version</span>
    agInit?(params: IHeaderCompParams): void;

    <span class="codeComment">// no getGui() or destroy(), all handled by Angular</span>
}</pre>

<!-- Header Component -->
<h3 id="header-group-component">Header Group Component</h3>

<p>
    Implementing a header group component in Angular differs from the standard header group component in the following ways:
<ul>
    <li>Implement <i>IHeaderGroupAngularComp</i> instead of <i>IHeaderGroupComp</i>.</li>
    <li>Use <i>colDef.headerGroupComponentFramework</i> instead of <i>colDef.headerGroupComponent</i>.</li>
</ul>
</p>

<p>
    The interface <i>IHeaderGroupAngularComp</i> is as follows:
</p>

<pre>interface IHeaderGroupAngularComp {

    <span class="codeComment">// equivalent of init in IHeaderGroupComp,</span>
    <span class="codeComment">// IHeaderGroupCompParams is same as non Angular version</span>
    agInit?(params: IHeaderGroupCompParams): void;

    <span class="codeComment">// no getGui() or destroy(), all handled by Angular</span>
}</pre>

<p>For a full working example of Header Components in Angular see
    <a href="https://github.com/ag-grid/ag-grid-angular-example">Angular Example</a>.
</p>