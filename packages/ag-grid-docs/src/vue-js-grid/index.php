<?php

$pageTitle = "ag-Grid Blog: Using VueJS Components in ag-Grid";
$pageDescription = "VueJS is a fantastic framework that has experienced amazing growth since it was first released in early 2014. We here at ag-Grid are proud to be able to announce support for VueJS, offering native support of VueJS components within the grid itself. This blog post covers using VueJS Components in ag-Grid";
$pageKeyboards = "VueJS Vue Component ag-Grid";

include('../includes/mediaHeader.php');
?>

<link rel="stylesheet" href="../documentation-main/documentation.css">
<script src="../documentation-main/documentation.js"></script>


<h1><img src="../images/vue_large.png"/>VueJS Grid</h1>
<h3>Using ag-Grid inside a VueJS application</h3>
<p class="blog-author">Sean Landsman | 14th March 2017</p>

<div class="row" ng-app="documentation">
    <div class="col-md-9">

        <h2>Introduction</h2>

        <p>VueJS is a fantastic framework that has experienced amazing growth since it was first released in early 2014.
            We here at ag-Grid are proud to be able to announce support for VueJS, offering native support of VueJS components
        within the grid itself.</p>

        <p>We'll walk through creating a simple VueJS application with ag-Grid at its core, using VueJS components to add dynamic
        functionality to the experience, making good use of what both VueJS and ag-Grid offers us.</p>

        <h2>Munros?</h2>

        <p>Wikipedia tells us that the Munros are:</p>

        <blockquote>A Munro top is a summit that is not regarded as a separate mountain and which is over 3,000 feet.
            In the 2012 revision of the tables, published by the Scottish Mountaineering Club, there are 282 Munros and
            227 further subsidiary tops.</blockquote>

        <p>As a keen mountain walker I've always wanted to do the Munros. I haven't managed to do any of them yet, but
        being optimistic let's walk through the creation of an application that allows us to view information about Munros
            and track our progress in actually climibing them!</p>

        <note>The code for this blog can be found at <a href="https://github.com/seanlandsman/ag-grid-vue-munros">https://github.com/seanlandsman/ag-grid-vue-munros</a></note>

        <note>Full information how to configure and VueJS components within ag-Grid can be found in the <a href="../javascript-grid-getting-started/?framework=vue">Getting Started</a>
        guide.</note>

        <h2>Let's Get Started</h2>

        <p>First, we need to create the boilerplate for our application - for this we'll use the <a href="https://github.com/vuejs/vue-cli" target="_blank">vue-cli</a> to spin
        up a simple Webpack configuration:</p>

        <snippet>
vue init webpack munro-app</snippet>

        <p>We don't need <code>vue-router</code> and for the purposes of this application we won't use ESLint or Karma/Mocha:</p>

<snippet>
? Project name munro-app
? Project description A Vue.js project
? Author Sean Landsman &lt;your@email.com&gt;
? Vue build standalone
? Install vue-router? No
? Use ESLint to lint your code? No
? Setup unit tests with Karma + Mocha? No
? Setup e2e tests with Nightwatch? No</snippet>

        <p>Once done follow the instructions that follow:</p>
<snippet>
cd munro-app
npm install
npm run dev</snippet>

        <p>After this we'll end up with a simple folder structure and working skeleton application.</p>

        <p>Next let's install the ag-Grid dependencies we'll need:</p>

<snippet>
npm install ag-grid-community --save
npm install ag-grid-vue --save</snippet>

        <p>We'll also use <code>whatwg-fetch</code> to pull in our Munro.json data file:</p>

<snippet>
npm install whatwg-fetch --save</snippet>

        <p>One last piece of housekeeping - delete <code>src/components/Hello.vue</code>.</p>

        <h3>Show me the Munros!</h3>

        <p>To start with let's just display some basic Munro information in a simple grid.</p>

        <p>Let's create a Grid component that will retrieve the Munro information and render it.</p>
        
        <p>The <code>MunroGrid</code> component looks like this:</p>
<snippet>
// MunroGrid.vue
&lt;template&gt;
    &lt;ag-grid-vue class="ag-theme-fresh grid"
                 :gridOptions="gridOptions"
                 :rowData="rowData"
                 :rowDataChanged="onRowDataChanged"&gt;

    &lt;/ag-grid-vue&gt;
&lt;/template&gt;

&lt;script&gt;
    import Vue from "vue";
    import {AgGridVue} from "ag-grid-vue";
    import 'whatwg-fetch'

    export default {
        name: 'munro-grid',
        data () {
            return {
                gridOptions: null,
                rowData: null
            }
        },
        components: {
            AgGridVue
        },
        methods: {
            loadRowData() {
                fetch('/static/munros.json')
                    .then((response) =&gt; {
                        return response.json()
                    })
                    .then((json) =&gt; {
                        this.rowData = json;
                    });
            },
            createColDefs() {
                return [
                    {headerName: "Hill Name", field: "hillname", width: 225, suppressSizeToFit: true},
                    {headerName: "Grid Reference", field: "gr6"},
                    {headerName: "Height (m)", field: "height"},
                    {headerName: "Latitude", field: "latitude"},
                    {headerName: "Longitude", field: "longitude"},
                    {headerName: "Climbed?", field: "climbed"}
                ];
            },
            onRowDataChanged() {
                Vue.nextTick(() =&gt; {
                        this.gridOptions.api.sizeColumnsToFit();
                    }
                );

            }
        },
        created() {
            this.gridOptions = {};
            this.gridOptions.columnDefs = this.createColDefs();
            this.loadRowData();
        }
    }
&lt;/script&gt;

&lt;style scoped&gt;
    .grid {
        height: 255px;
    }
&lt;/style&gt;</snippet>

        <p>The main parts of this component are:</p>

        <ul>
            <li><code>import {AgGridVue} from "ag-grid-vue";</code>: Here we import the ag-Grid Vue component - this is the ag-Grid component that provides the main grid functionality.</li>
            <li><code>createColDefs</code>: Defines our columns. This is a simple table, so we simple list the header names and fields to use in the grid.</li>
            <li><code>loadRowData</code>: Retrieves the Munro data and set's it as the Grid's rowData.</li>
            <li><code>onRowDataChanged</code>: Automatically resizes columns so they fill out the available space nicely.</li>
        </ul>

        <p>With our component ready, we now need to add it to our application. Update <code>src/App.vue</code> with the following:</p>
        
<snippet>
// App.vue
&lt;template&gt;
  &lt;div id="app"&gt;
      &lt;munro-grid&gt;&lt;/munro-grid&gt;
  &lt;/div&gt;
&lt;/template&gt;

&lt;script&gt;
    import MunroGrid from './components/MunroGrid';

    export default {
        name: 'app',
        data() {
            return {
            }
        },
        components: {
            MunroGrid
        }
    }
&lt;/script&gt;</snippet>

        <p>Finally, we need to pull in the ag-Grid CSS. Update <code>src/main.js</code> to import the required files:</p>

<snippet>
// main.js
import Vue from "vue";
import App from "./App";

import "../node_modules/ag-grid/dist/styles/ag-grid.css";
import "../node_modules/ag-grid/dist/styles/ag-theme-fresh.css";

...other imports</snippet>

        <p>With all that in place we can spin up the application once again - this is what you should see:</p>

        <img src="../images/vue_munro_1.png" style="width: 100%;padding-bottom: 10px">

        <h3>Show me a Munro!</h3>

        <p>Ok, so far so good.  But wouldn't it be nice to get a view of a Munro when we clicked on it? I think so - let's
        create a new component we'll call <code>MunroDetail</code> that will show some key information about a Munro, as well as display an image of it:</p>

<snippet>
// MunroDetail.vue
&lt;template&gt;
    &lt;div class="detail" v-if="selectedMunro"&gt;
        &lt;table class="table"&gt;
            &lt;tr&gt;
                &lt;td colspan="2"&gt;
                    {{selectedMunro.hillname}}
                &lt;/td&gt;
            &lt;/tr&gt;
            &lt;tr&gt;
                &lt;td class="key"&gt;
                    Elevation
                &lt;/td&gt;
                &lt;td&gt;
                    {{selectedMunro.height}}
                &lt;/td&gt;
            &lt;/tr&gt;
            &lt;tr&gt;
                &lt;td class="key"&gt;
                    &lt;div class="title"&gt;Latitude&lt;/div&gt;
                &lt;/td&gt;
                &lt;td&gt;
                    {{selectedMunro.latitude}}
                &lt;/td&gt;
            &lt;/tr&gt;
            &lt;tr&gt;
                &lt;td class="key"&gt;
                    Longitude
                &lt;/td&gt;
                &lt;td&gt;
                    {{selectedMunro.longitude}}
                &lt;/td&gt;
            &lt;/tr&gt;
            &lt;tr&gt;
                &lt;td colspan="2"&gt;
                    &lt;span v-if="!showImage" class="image-prompt" @click="showImage=true"&gt;Click Here For Image of {{selectedMunro.hillname}}&lt;/span&gt;
                &lt;/td&gt;
            &lt;/tr&gt;
        &lt;/table&gt;
        &lt;div class="image-area"&gt;
            &lt;img v-if="showImage" class="image" :src="selectedMunro.image"/&gt;
        &lt;/div&gt;
    &lt;/div&gt;
&lt;/template&gt;

&lt;script&gt;
    export default {
        name: 'munro-detail',
        props: ['selectedMunro'],
        data () {
            return {
                showImage: false
            }
        },
        updated() {
            this.showImage=false;
        }
    }
&lt;/script&gt;

&lt;style scoped&gt;
    .detail {
        display: inline-block;
        width: 100%;
    }

    .table {
        border: 1px solid #999999;
        table-layout: fixed;
        width: 100%;
    }

    .key {
        color: blue;
    }

    .image-prompt {
        padding-top: 10px;
        padding-bottom: 10px;
    }

    .image {
        width: 100%;
    }
&lt;/style&gt;</snippet>

        <p>Nothing too complicated here - we have a simple table that will present some key information about a Munro,
            and will show an image when a prompt is clicked on (<code>@click="showImage=true"</code>).</p>

        <p>Note we're making use of a cool VueJS feature called <code>scoped</code> CSS - this will ensure any CSS we list here
        will only affect the component we're working on. Very nice indeed.</p>

        <p>Now let's update <code>MunroGrid</code> so that when a row is clicked on we emit an event to let users know:</p>
<snippet>
// MunroGrid.vue
&lt;template&gt;
    &lt;ag-grid-vue class="ag-theme-fresh grid"
                 :gridOptions="gridOptions"
                 :rowData="rowData"
                 :rowClicked="onRowClicked"
                 :rowDataChanged="onRowDataChanged"&gt;

    &lt;/ag-grid-vue&gt;
&lt;/template&gt;

&lt;script&gt;
    import Vue from "vue";
    import {AgGridVue} from "ag-grid-vue";
    import 'whatwg-fetch'

    export default {
        name: 'munro-grid',
        data () {
            return {
                gridOptions: null,
                rowData: null
            }
        },
        components: {
            AgGridVue
        },
        methods: {
            loadRowData() {
                fetch('/static/munros.json')
                    .then((response) =&gt; {
                        return response.json()
                    })
                    .then((json) =&gt; {
                        this.rowData = json;
                    });
            },
            createColDefs() {
                return [
                    {headerName: "Hill Name", field: "hillname", width: 225, suppressSizeToFit: true},
                    {headerName: "Grid Reference", field: "gr6"},
                    {headerName: "Height (m)", field: "height"},
                    {headerName: "Latitude", field: "latitude"},
                    {headerName: "Longitude", field: "longitude"},
                    {headerName: "Climbed?", field: "climbed"}
                ];
            },
            onRowClicked(params) {
                this.$emit("munroSelected", params.node.data)
            },
            onRowDataChanged() {
                Vue.nextTick(() =&gt; {
                        this.gridOptions.api.sizeColumnsToFit();
                    }
                );

            }
        },
        created() {
            this.gridOptions = {};
            this.gridOptions.columnDefs = this.createColDefs();
            this.loadRowData();
        }
    }
&lt;/script&gt;

&lt;style scoped&gt;
    .grid {
        height: 255px;
    }
&lt;/style&gt;</snippet>

        <p>The only change we've made here to listen for <code>rowClicked</code> event from the Grid and then to emit these
        events up:</p>
<snippet>
onRowClicked(params) {
    this.$emit("munroSelected", params.node.data)
},</snippet>

        <p>Easy!</p>


        <p>So now we have have a component to display the Munro and have updated our Grid component to broadcast Munro selection.
            Let's add our <code>MunroDetail</code>to our main <code>App.vue</code>, as well as tie up a row being selected in <code>MunroGrid</code>
            to displaying the information in <code>MunroDetail</code>:</p>
<snippet>
// App.vue
&lt;template&gt;
    &lt;div id="app"&gt;
        &lt;div id="contentwrapper"&gt;
            &lt;div id="contentcolumn"&gt;
                &lt;div class="innertube"&gt;
                    &lt;munro-detail :selectedMunro="selectedMunro"&gt;&lt;/munro-detail&gt;
                &lt;/div&gt;
            &lt;/div&gt;
        &lt;/div&gt;
        &lt;div id="leftcolumn"&gt;
            &lt;div class="innertube"&gt;
                &lt;munro-grid @munroSelected="munroSelected"&gt;&lt;/munro-grid&gt;
            &lt;/div&gt;
        &lt;/div&gt;
    &lt;/div&gt;
&lt;/template&gt;

&lt;script&gt;
    import MunroGrid from './components/MunroGrid';
    import MunroDetail from './components/MunroDetail';

    export default {
        name: 'app',
        data() {
            return {
                selectedMunro: null
            }
        },
        components: {
            MunroGrid,
            MunroDetail
        },
        methods: {
            munroSelected(munro) {
                this.selectedMunro = munro;
            }
        }
    }
&lt;/script&gt;

&lt;style scoped&gt;
    body {
        margin: 0;
        padding: 0;
        line-height: 1.5em;
    }

    #contentwrapper {
        float: left;
        width: 100%;
    }

    #contentcolumn {
        margin-left: 60%;
        max-width: 40%;
    }

    #leftcolumn {
        float: left;
        width: 60%;
        margin-left: -100%;
    }

    .innertube {
        margin: 10px;
        margin-top: 0;
    }

    @media (max-width: 600px) {
        #contentwrapper {
            float: none;
        }

        #leftcolumn {
            float: none;
            width: 100%;
            margin-left: 0;
        }

        #contentcolumn {
            margin-left: 0;
        }
    }
&lt;/style&gt;</snippet>

        <p>Key parts of our updates are:</p>
        <ul>
            <li><code>&lt;munro-grid @munroSelected="munroSelected"&gt;&lt;/munro-grid&gt;</code>: Listen for the <code>munroSelected</code>
                event from <code>MunroGrid</code> and store the selected Munro in a variable called <code>this.selectedMunro = munro;</code>.</li>
            <li><code>&lt;munro-detail :selectedMunro="selectedMunro">&lt;/munro-detail&gt;</code>: Pass in a selected Munro (if any)
                to the <code>MunroDetail</code> component for rendering.</li>
        </ul>

        <p>The rest of the new code is layout code to ensure that <code>MunroGrid</code> and <code>MunroDetail</code> display side-by-side
        and that <code>MunroDetail</code> can "flex" as the window changes size.</p>

        <p>If we spin the application up now we'll see this:</p>

        <img src="../images/vue_munro_2.png" style="width: 100%;padding-bottom: 10px">

        <p>When a row is clicked on we'll then see this: </p>

        <img src="../images/vue_munro_3.png" style="width: 100%;padding-bottom: 10px">

        <p>And finally, when the prompt is clicked on we'll see this:</p>

        <img src="../images/vue_munro_4.png" style="width: 100%;padding-bottom: 10px">

        <p>So far so good - we have two VueJs components talking to each other, and are able to see the detail we wanted to see!</p>

        <h3>Too Much Information!</h3>

        <p>But I think we can do more here. How about we write a new VueJS component that will allow us to filter
        based on Munro height?</p>

        <p>I'd like to have this as a horizontal slider with the grid filtering as we slide - let's see what we can come up with.</p>

<snippet>
// SliderComponent.vue
&lt;template&gt;
    &lt;span class="slider"&gt;
        &lt;input type="range" :min="min" :max="max" :step="step" :value="value" @input="onSliderChanging" @change="onSliderChanged" /&gt; {{ value }}
    &lt;/span&gt;
&lt;/template&gt;

&lt;script&gt;
    export default {
        name: 'slider',
        props: {
            min: {
                type: Number,
                default: 0
            },
            max: {
                type: Number,
                default: 100
            },
            step: {
                type: Number,
                default: 1
            },
            initialValue: {
                type: Number,
                default: 0
            },
        },
        data () {
            return {
                value: this.initialValue,
                currentTimout: null
            }
        },
        methods: {
            // for updates while the user is still actively dragging
            onSliderChanging($event) {
                this.value = $event.target.value;
            },
            // for when the user has chosen a value
            onSliderChanged($event) {
                this.value = $event.target.value;
                this.$emit("valueChanged", this.value)
            }
        }
    }
&lt;/script&gt;

&lt;style scoped&gt;
    .slider {
        border: 1px solid lightgrey;
        padding-top: 4px;
        padding-right: 4px;
        z-index: 1;
    }
&lt;/style&gt;</snippet>

        <p>Here we have a simple slider control - it takes in a few properties to control its behaviour and initial state,
            and fires an event when the user changes its value.</p>

        <p>Now let's create a new Filter component for use in the Grid. This new Filter will make use of the <code>SliderComponent</code>
        we've just created.</p>

<snippet>
// SliderFilter.vue
&lt;template&gt;
    &lt;slider :min="min" :max="max" :step="step" :initialValue="initialValue" @valueChanged="filterValueChanged"&gt;&lt;/slider&gt;
&lt;/template&gt;

&lt;script&gt;
    import Vue from "vue";
    import Slider from './SliderComponent.vue';

    export default Vue.extend({
        name: 'slider-filter',
        data() {
            return {
                value: 0,
                valueGetter: null,
                min: null,
                max: null,
                step: null,
                initialValue: null
            }
        },
        components: {
            Slider
        },
        methods: {
            isFilterActive() {
                return true;
            },

            doesFilterPass(params){
                return this.valueGetter(params.node) &lt;= this.value;
            },

            getModel() {
                return {value: this.value};
            },

            setModel(model) {
                this.value = model.value;
            },

            filterValueChanged(value) {
                this.value = value;
                this.params.filterChangedCallback();
            }
        },
        created() {
            this.valueGetter = this.params.valueGetter;

            this.min = this.params.min;
            this.max = this.params.max;
            this.step = this.params.step;
            this.initialValue = this.params.initialValue;
        }
    })
&lt;/script&gt;</snippet>

        <p>This too is a simple component - we remember to enclose our logic with <code>Vue.extend</code> as this is
        what allows the Grid to create components dynamically, and the rest is normal ag-Grid logic.</p>

        <p>Note here that we're being passed in the <code>SliderComponent</code> initial values via the <code>params</code>
        value - this is how ag-Grid passes in information to a Dynamic Vue component.</p>

        <p>Note too that we're listening for events from <code>SliderComponent</code> in order to update the reflect the
            filtered state in <code>filterValueChanged</code>.</p>

        <p>And finally, let's add the new <code>SliderFilter</code> to <code>MunroGrid</code>:</p>
        
<snippet>
&lt;template&gt;
    &lt;ag-grid-vue class="ag-theme-fresh grid"
                 :gridOptions="gridOptions"
                 :rowData="rowData"
                 :rowClicked="onRowClicked"
                 :rowDataChanged="onRowDataChanged"&gt;
    &lt;/ag-grid-vue&gt;
&lt;/template&gt;

&lt;script&gt;
    import Vue from "vue";
    import {AgGridVue} from "ag-grid-vue";
    import 'whatwg-fetch'

    import SliderFilter from './SilderFilter.vue';

    export default {
        name: 'munro-grid',
        data () {
            return {
                gridOptions: null,
                rowData: null
            }
        },
        components: {
            AgGridVue
        },
        methods: {
            loadRowData() {
                fetch('/static/munros.json')
                    .then((response) =&gt; {
                        return response.json()
                    })
                    .then((json) =&gt; {
                        this.rowData = json;
                    });
            },
            createColDefs() {
                return [
                    {headerName: "Hill Name", field: "hillname", width: 225, suppressSizeToFit: true},
                    {headerName: "Grid Reference", field: "gr6"},
                    {
                        headerName: "Height (m)",
                        field: "height",
                        filterFramework: SliderFilter,
                        filterParams: {
                            min: 900,
                            max: 1500,
                            step: 100,
                            initialValue: 1500
                        }
                    },
                    {headerName: "Latitude", field: "latitude"},
                    {headerName: "Longitude", field: "longitude"},
                    {headerName: "Climbed?", field: "climbed"}
                ];
            },
            onRowClicked(params) {
                this.$emit("munroSelected", params.node.data)
            },
            onRowDataChanged() {
                Vue.nextTick(() =&gt; {
                        this.gridOptions.api.sizeColumnsToFit();
                    }
                );
            }
        },
        created() {
            this.gridOptions = {
                enableFilter:true
            };
            this.gridOptions.columnDefs = this.createColDefs();
            this.loadRowData();
        }
    }
&lt;/script&gt;

&lt;style scoped&gt;
    .grid {
        height: 255px;
    }
&lt;/style&gt;</snippet>

        <img src="../images/vue_munro_5.png" style="width: 100%;padding-bottom: 10px">

        <p>So it very little time we have an application that downloads and renders data in ag-Grid, renders chosen information
        in another VueJS component, and finally allow us to dynamically filter our data with a very quick and easy slider control.</p>

        <p>Brilliant! I've found VueJS to be a really fun framework to use - it was very quick to ramp up and write something like this,
        so I encourage you to give it a go.</p>

        <div style="margin-top: 20px;">
            <a href="https://twitter.com/share" class="twitter-share-button"
               data-url="https://www.ag-grid.com/vue-js-grid/"
               data-text="Using VueJS Components in ag-Grid" data-via="seanlandsman"
               data-size="large">Tweet</a>
            <script>!function (d, s, id) {
                    var js, fjs = d.getElementsByTagName(s)[0], p = /^http:/.test(d.location) ? 'http' : 'https';
                    if (!d.getElementById(id)) {
                        js = d.createElement(s);
                        js.id = id;
                        js.src = p + '://platform.twitter.com/widgets.js';
                        fjs.parentNode.insertBefore(js, fjs);
                    }
                }(document, 'script', 'twitter-wjs');</script>
        </div>

    </div>
    <div class="col-md-3">

        <div>
            <a href="https://twitter.com/share" class="twitter-share-button"
               data-url="https://www.ag-grid.com/vue-js-grid/"
               data-text="Using VueJS Components in ag-Grid" data-via="seanlandsman"
               data-size="large">Tweet</a>
            <script>!function (d, s, id) {
                    var js, fjs = d.getElementsByTagName(s)[0], p = /^http:/.test(d.location) ? 'http' : 'https';
                    if (!d.getElementById(id)) {
                        js = d.createElement(s);
                        js.id = id;
                        js.src = p + '://platform.twitter.com/widgets.js';
                        fjs.parentNode.insertBefore(js, fjs);
                    }
                }(document, 'script', 'twitter-wjs');</script>
        </div>

        <div style="font-size: 14px; background-color: #dddddd; padding: 15px;">

            <p><img src="../images/sean.png"/></p>
            <p style="font-weight: bold;">
                Sean Landsman
            </p>
            <p>
                I'm an experienced full stack technical lead with an extensive background in enterprise solutions. Over
                19 years in the industry has taught me the value of quality code and good team collaboration. The bulk
                of my background is on the server side, but like Niall am increasingly switching focus to include front
                end
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
                <a href="https://twitter.com/seanlandsman" class="twitter-follow-button" data-show-count="false"
                   data-size="large">@seanlandsman</a>
                <script>!function (d, s, id) {
                        var js, fjs = d.getElementsByTagName(s)[0], p = /^http:/.test(d.location) ? 'http' : 'https';
                        if (!d.getElementById(id)) {
                            js = d.createElement(s);
                            js.id = id;
                            js.src = p + '://platform.twitter.com/widgets.js';
                            fjs.parentNode.insertBefore(js, fjs);
                        }
                    }(document, 'script', 'twitter-wjs');</script>
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

<footer class="license">
    © ag-Grid Ltd. 2015-2017
</footer>

<?php
include('../includes/mediaFooter.php');
?>
