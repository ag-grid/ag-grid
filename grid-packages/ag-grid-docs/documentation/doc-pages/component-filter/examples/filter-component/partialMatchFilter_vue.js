import Vue from "vue";

export default Vue.extend({
    template: `
      <div style="border: 2px solid #22ff22;border-radius: 5px; background-color: #bbffbb; width: 200px; height: 50px">
          <div style="margin-left: 20px">
            Partial Match Filter: <input style="height: 20px" :ref="'input'" v-model="text">
          </div>
      </div>
    `,
    data() {
        return {
            text: '',
            valueGetter: null
        }
    },
    methods: {
        isFilterActive() {
            return this.text !== null && this.text !== undefined && this.text !== '';
        },

        doesFilterPass(params) {
            return !this.text || this.text.toLowerCase()
                .split(" ")
                .every((filterWord) => {
                    return this.valueGetter(params.node).toString().toLowerCase().indexOf(filterWord) >= 0;
                });
        },

        getModel() {
            return {value: this.text};
        },

        setModel(model) {
            if (model) {
                this.text = model.value;
            }
        },

        afterGuiAttached() {
            this.$refs.input.focus();
        },

        componentMethod(message) {
            alert(`Alert from PartialMatchFilterComponent ${message}`);
        },
    },
    watch: {
        'text': function (val, oldVal) {
            if (val !== oldVal) {
                this.params.filterChangedCallback();
            }
        }
    },
    created() {
        this.valueGetter = this.params.valueGetter;
    }
})
