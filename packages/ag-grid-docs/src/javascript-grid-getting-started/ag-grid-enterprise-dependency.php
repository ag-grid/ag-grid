<div class="collapsableDocs">
    <div class="collapsableDocs-header"
         onclick="javascript: this.classList.toggle('active');">
        <div style="padding: 5px;vertical-align: middle"><img src="../images/enterprise_50.png"/>&nbsp;&nbsp;<strong>Installing
                ag-Grid-Enterprise</strong>
        </div>
        <i class="fa fa-arrow-right" aria-hidden="true"></i>
    </div>

    <div class="collapsableDocs-content">

        <h3>Download ag-Grid-Enterprise</h3>

        <table>
            <tr>
                <td style="padding: 10px;"><img src="../images/bower.png"/></td>
                <td>
                    <b>Bower</b><br/>
                    bower install ag-grid-enterprise
                </td>

                <td style="width: 20px;"/>

                <td style="padding: 10px;"><img src="../images/npm.png"/></td>
                <td>
                    <b>NPM</b><br/>
                    npm install ag-grid-enterprise
                </td>

                <td style="width: 20px;"/>

                <td style="padding: 10px;"><img src="../images/github.png"/></td>
                <td>
                    <b>Github</b><br/>
                    Download from <a href="https://github.com/ag-grid/ag-grid-enterprise">Github</a>
                </td>
            </tr>
        </table>

        <h3>Referencing ag-Grid-Enterprise</h3>

        <p>
            ag-Grid-Enterprise is also distributed as both a self contained bundle and also via a CommonJS package.
        </p>

        <p>As with the ag-Grid example, all we need to do is reference the ag-grid-enterprise dependency and we're good
            to go:</p>
        <snippet>
&lt;html&gt;
&lt;head&gt;
    &lt;script src="path-to-ag-grid-enterprise/ag-grid-enterprise.js"&gt;&lt;/script&gt;
    &lt;script src="example1.js"&gt;&lt;/script&gt;
&lt;/head&gt;
&lt;body&gt;
    &lt;div id="myGrid" style="height: 100%;" class="ag-theme-balham"&gt;&lt;/div&gt;
&lt;/body&gt;
&lt;/html&gt;</snippet>
        <note>
            <strong>Self Contained Bundles</strong>

            <p>Do <b>not</b> include both ag-Grid and ag-Grid-Enterprise self contained bundles. The ag-Grid-Enterprise
                contains ag-Grid.</p>
        </note>

        <p>The creation of the Grid would be the same as the ag-Grid example above.</p>

        <h4>ag-Grid Enterprise Bundle Types</h4>
        <p>
            Again similar to ag-Grid, ag-Grid-Enterprise has 4 bundles:
        <ul>
            <li>dist/ag-grid-enterprise.js -> standard bundle containing JavaScript and CSS</li>
            <li>dist/ag-grid-enterprise.min.js -> minified bundle containing JavaScript and CSS</li>
            <li>dist/ag-grid-enterprise.noStyle.js -> standard bundle containing JavaScript without CSS</li>
            <li>dist/ag-grid-enterprise.min.noStyle.js -> minified bundle containing JavaScript without CSS</li>
        </ul>
        </p>

        <p>Even if you are using React, AngularJS 1.x, Angular, VueJS or Web Components, the above is all you need
            to
            do.
            Any grid you create will be an enterprise grid once you load the library.</p>

        <h4>CommonJS</h4>
        <p>
            If using CommonJS, you one need to include ag-Grid-Enterprise into your project. You do not need to
            execute any code inside it. When ag-Grid-Enterprise loads, it will register with ag-Grid such that the
            enterprise features are available when you use ag-Grid.
        </p>

        <snippet>
// ECMA 5 - using nodes require() method
var AgGrid = require('ag-grid');
// only include this line if you want to use ag-grid-enterprise
require('ag-grid-enterprise');

// ECMA 6 - using the system import method
import {Grid} from 'ag-grid-community';
// only include this line if you want to use ag-grid-enterprise
import 'ag-grid-enterprise';</snippet>
    </div>
</div>