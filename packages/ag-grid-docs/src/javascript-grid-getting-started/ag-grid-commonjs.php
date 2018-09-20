<h4>CommonJS</h4>

<p>
    To use CommonJS, it's best to download the packages via NPM and then either <i>require</i> (ECMA 5) or
    <i>import</i> (ECMA 6)
    them into your project.
</p>

<snippet>
// ECMA 5 - using nodes require() method
var AgGrid = require('ag-grid');

// ECMA 6 - using the system import method
import {Grid} from 'ag-grid-community';</snippet>
