[[only-vue]]
|Below is a simple example of cell renderer component:
|
|```js
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
|```
|
|And below is the example using Vue 3's Composition API:
|
|```js
|export default {
|    template: `<span>{{ displayValue }}</span>`,
|    setup(props) {
|        const displayValue = new Array(props.params.value).fill('#').join('');
|        return {
|            displayValue
|        }
|    }
|};
|```
|
 
