<framework-specific-section frameworks="vue">
|Below is an example of filter component:
</framework-specific-section>

<framework-specific-section frameworks="vue">
<snippet transform={false}>
|const YearFilter = {
|    template: `
|        &lt;div>
|        &lt;div >Select Year Range&lt;/div>
|        &lt;label>
|            &lt;input type="radio" name="year" v-model="year" v-on:change="updateFilter()" value="All"/> All
|        &lt;/label>
|        &lt;label>
|            &lt;input type="radio" name="year" v-model="year" v-on:change="updateFilter()" value="2010"/> Since 2010
|        &lt;/label>
|        &lt;/div>
|    `,
|    data: function () {
|        return {
|            year: 'All'
|        };
|    },
|    methods: {
|        updateFilter() {
|            this.params.filterChangedCallback();
|        },
|
|        doesFilterPass(params) {
|            return params.data.year >= 2010;
|        },
|
|        isFilterActive() {
|            return this.year === '2010'
|        },
|
|        // this example isn't using getModel() and setModel(),
|        // so safe to just leave these empty. don't do this in your code!!!
|        getModel() {
|        },
|
|        setModel() {
|        }
|    }
|}
</snippet>
</framework-specific-section>