[[only-vue]]
|## Declaring Custom Components
| VueJS components can be defined as either simple inline components, or as full/complex
| externalised ones (i.e in a separate file).
|
| ### "Inline" Components
|
|```js
|export default {
|   data() {
|       return {
|           ...data 
|       }
|   },
|   components: {
|       AgGridVue,              // the actual AgGridVue Grid component
|       CubeComponent: {        // an inline custom component
|           template: '<span>{{ valueCubed() }}</span>',
|           methods: {
|               valueCubed() {
|                   return this.params.value * this.params.value * this.params.value;
|               }
|           }
|       }
|   }
|}
|```
|
| Note here that we can define the property name either quoted or not but note that in
| order to reference these components in your column definitions you'll need to provide
| them as **case-sensitive** strings.
|
| ### Locally Declared Components
|
| ```js
|const SquareComponent = {
|    template: '<span>{{ valueSquared() }}</span>',
|    methods: {
|        valueSquared() {
|            return this.params.value * this.params.value;
|        }
|    }
|};
| ```
|
| ### Externalised JavaScript Components (.js files)
|
|```js
|// SquareComponent.js
|export default {
|    template: '<span>{{ valueSquared() }}</span>',
|    methods: {
|        valueSquared() {
|            return this.params.value * this.params.value;
|        }
|    }
|};
| ```
|
| ### Externalised Single File Components (SFC / .vue files)
|
| ```jsx
| <template>
|     <span class="currency">{{ params.value | currency('EUR') }}</span>
| </template>
|
| <script>
| export default {
|     filters: {
|         currency(value, symbol) {
|             let result = value;
|             if (!isNaN(value)) {
|                 result = value.toFixed(2);
|             }
|             return symbol ? symbol + result : result;
|         }
|     }
| };
| </script>
|
| <style scoped>
|     .currency {
|         color: blue;
|     }
| </style>
| ```
|
| Note that in this case the component name will match the actual reference, but you can
| specify a different one if you choose:
|
| ```js
| components: {
|     AgGridVue,
|     'MySquareComponent': SquareComponent
| }
| ```
|[[note]]
||All of the above works if you're going to register components by Name (see below). If you wish to register components
||by direct reference then you will need to wrap your component with `Vue.extend(...your component...)` (for Vue 2), or `defineComponent(...your component...)`
||(for Vue 3).
||
||We highly recommend registration by name for the flexibility it provides - all of our examples use registration by name.
||
