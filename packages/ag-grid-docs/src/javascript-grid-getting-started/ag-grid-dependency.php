<h3>Download ag-Grid</h3>

<table class="content">
    <tr>
        <td style="padding: 10px;"><img src="../images/bower.png"/></td>
        <td>
            <b>Bower</b><br/>
            bower install ag-grid-community
        </td>

        <td style="width: 20px;"/>

        <td style="padding: 10px;"><img src="../images/npm.png"/></td>
        <td>
            <b>NPM</b><br/>
            npm install ag-grid-community
        </td>

        <td style="width: 20px;"/>

        <td style="padding: 10px;"><img src="../images/github.png"/></td>
        <td>
            <b>Github</b><br/>
            Download from <a href="https://github.com/ag-grid/ag-grid/tree/master/packages/ag-grid-community">Github</a>
        </td>
    </tr>
</table>

<h3>Referencing ag-Grid</h3>

<p>
    ag-Grid is distributed as both a self contained bundle (that places ag-Grid on the global scope)
    and also via a CommonJS package.
</p>

<p>Using the bundled version is the quickest way to get going - reference this version in your HTML file is all you need
    to do.</p>
<p>You also need to provide a block (a div is the most common) element for the Grid to use - assign it an ID which you
    can then use later
    when instantiating the Grid.</p>

<snippet language="html">
&lt;html&gt;
&lt;head&gt;
    &lt;script src="path-to-ag-grid/ag-grid-community.js"&gt;&lt;/script&gt;
    &lt;script src="example1.js"&gt;&lt;/script&gt;
&lt;/head&gt;
&lt;body&gt;
    &lt;div id="myGrid" style="height: 100%;" class="ag-theme-balham"&gt;&lt;/div&gt;
&lt;/body&gt;
&lt;/html&gt;</snippet>