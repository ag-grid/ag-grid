[[only-vue]]
|## Declaring Custom Components
| VueJS components can be defined as either simple inline components, or as full/complex
| externalised ones (i.e in a separate file).
|
| ### Simple, Inline Components
|
| ```js
| components: {
| 'CubeComponent': {
|     template: '<span>{{ valueCubed() }}</span>',
|     methods: {
|         valueCubed() {
|             return this.params.value * this.params.value * this.params.value;
|         }
|     }
| },
| ParamsComponent: {
|     template: '<span>Field: {{params.colDef.field}}, Value: {{params.value}}</span>',
|     methods: {
|         valueCubed() {
|             return this.params.value * this.params.value * this.params.value;
|         }
|     }
| }
| ```
|
| Note here that we can define the property name either quoted or not but note that in
| order to reference these components in your column definitions you'll need to provide
| them as **case-sensitive** strings.
|
| ### Simple, Locally Declared Components
|
| ```js
| let SquareComponent = {
|     template: '<span>{{ valueSquared() }}</span>',
|     methods: {
|         valueSquared() {
|             return this.params.value * this.params.value;
|         }
|     }
| };
| ```
|
| ### External .js Components
|
| ```js
| // SquareComponent.js
| export default {
|     template: '<span>{{ valueSquared() }}</span>',
|     methods: {
|         valueSquared() {
|             return this.params.value * this.params.value;
|         }
|     }
| };
|
| // MyGridApp.vue (your Component holding the ag-Grid component)
| import SquareComponent from './SquareComponent'
| ```
|
| ### More Complex, Externalised Single File Components (.vue)
|
| ```jsx
| <template>
|     <span class="currency"><span ng-non-bindable>{{</span> params.value | currency('EUR') }}</span>
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
| For non-inline components you need to provide them to Vue via the `components` property:
|
| ```js
| components: {
|     AgGridVue,
|     SquareComponent
| }
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
