<framework-specific-section frameworks="vue">
|Below is an example of floating filter component:
</framework-specific-section>

<framework-specific-section frameworks="vue">
<snippet transform={false}>
|const NumberFloatingFilterComponent = {
|    template: `
|        &gt; &lt;input v-bind:style="{ color: params.color, width: '30px' }" type="number" min="0" 
|               v-model="currentValue" v-on:inpuot="onInputBoxChanged()"/>
|    `,
|    data: function () {
|        return {
|            currentValue: null
|        };
|    },
|    methods: {
|        onInputBoxChanged() {
|            if (this.currentValue === '') {
|                // clear the filter
|                this.params.parentFilterInstance(instance => {
|                    instance.onFloatingFilterChanged(null, null);
|                });
|                return;
|            }
|
|            this.params.parentFilterInstance(instance => {
|                instance.onFloatingFilterChanged('greaterThan', this.currentValue);
|            });
|        },
|
|        onParentModelChanged(parentModel) {
|            // When the filter is empty we will receive a null value here
|            if (!parentModel) {
|                this.currentValue = '';
|            } else {
|                this.currentValue = parentModel.filter;
|            }
|        }
|
|    }
|}
</snippet>
</framework-specific-section> 