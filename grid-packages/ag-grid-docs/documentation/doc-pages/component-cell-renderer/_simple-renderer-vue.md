<framework-specific-section frameworks="vue">
|Below is a simple example of cell renderer component:
</framework-specific-section>

<framework-specific-section frameworks="vue">
<snippet transform={false}>
|export default {
|    template: `<span>{{ displayValue }}</span>`,
|    data: function () {
|        return {
|            displayValue: ''
|        };
|    },
|    beforeMount() {
|        this.displayValue = new Array(this.params.value).fill('#').join('');
|    },
|};
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="vue">
|And below is the example using Vue 3's Composition API:
</framework-specific-section>

<framework-specific-section frameworks="vue">
<snippet transform={false}>
|export default {
|    template: `<span>{{ displayValue }}</span>`,
|    setup(props) {
|        const displayValue = new Array(props.params.value).fill('#').join('');
|        return {
|            displayValue
|        }
|    }
|};
</snippet>
</framework-specific-section>