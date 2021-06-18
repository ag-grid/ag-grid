export default {
    template: `
      <div style="display: inline-block; width: 400px;">
      <div style="padding: 10px; background-color: #d3d3d3; text-align: center;">This is a very wide filter</div>
      <label style="margin: 10px; padding: 50px; display: inline-block; background-color: #999999">
        <input type="radio" name="year" v-model="year" v-on:change="updateFilter()" value="All"/> All
      </label>
      <label style="margin: 10px; padding: 50px; display: inline-block; background-color: #999999">
        <input type="radio" name="year" v-model="year" v-on:change="updateFilter()" value="2010"/> Since 2010
      </label>
      </div>
    `,
    data: function () {
        return {
            year: 'All'
        };
    },
    methods: {
        updateFilter() {
            this.params.filterChangedCallback();
        },

        doesFilterPass(params) {
            return params.data.year >= 2010;
        },

        isFilterActive() {
            return this.year === '2010'
        },

        // this example isn't using getModel() and setModel(),
        // so safe to just leave these empty. don't do this in your code!!!
        getModel() {
        },

        setModel() {
        }
    }
};
