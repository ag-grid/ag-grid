<framework-specific-section frameworks="vue">
|## Declaring Custom Components
| VueJS components can be defined as either simple inline components, or as full/complex
| externalised ones (i.e in a separate file).
|
| ### "Inline" Components
|
</framework-specific-section>

<framework-specific-section frameworks="vue">
<snippet transform={false}>
|export default {
|   data() {
|       return {
|           ...data 
|       }
|   },
|   components: {
|       AgGridVue,              // the actual AgGridVue Grid component
|       CubeComponent: {        // an inline custom component
|           template: '&lt;span>{{ valueCubed() }}&lt;/span>',
|           methods: {
|               valueCubed() {
|                   return this.params.value * this.params.value * this.params.value;
|               }
|           }
|       }
|   }
|}
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="vue">
| Note here that we can define the property name either quoted or not but note that in
| order to reference these components in your column definitions you'll need to provide
| them as **case-sensitive** strings.
|
| ### Locally Declared Components
</framework-specific-section>

<framework-specific-section frameworks="vue">
<snippet transform={false}>
|const SquareComponent = {
|    template: '&lt;span>{{ valueSquared() }}&lt;/span>',
|    methods: {
|        valueSquared() {
|            return this.params.value * this.params.value;
|        }
|    }
|};
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="vue">
| ### Externalised JavaScript Components (.js files)
</framework-specific-section>

<framework-specific-section frameworks="vue">
<snippet transform={false}>
|// SquareComponent.js
|export default {
|    template: '&lt;span>{{ valueSquared() }}&lt;/span>',
|    methods: {
|        valueSquared() {
|            return this.params.value * this.params.value;
|        }
|    }
|};
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="vue">
| ### Externalised Single File Components (SFC / .vue files)
</framework-specific-section>

<framework-specific-section frameworks="vue">
<snippet transform={false}>
| &lt;template>
|     &lt;span class="currency">{{ params.value | currency('EUR') }}&lt;/span>
| &lt;/template>
|
| &lt;script>
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
| &lt;/script>
|
| &lt;style scoped>
|     .currency {
|         color: blue;
|     }
| &lt;/style>
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="vue">
| Note that in this case the component name will match the actual reference, but you can
| specify a different one if you choose:
</framework-specific-section>

<framework-specific-section frameworks="vue">
<snippet transform={false}>
| components: {
|     AgGridVue,
|     'MySquareComponent': SquareComponent
| }
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="vue">
<note>
|All of the above works if you're going to register components by Name (see below). If you wish to register components
|by direct reference then you will need to wrap your component with `Vue.extend(...your component...)` (for Vue 2), or `defineComponent(...your component...)`
|(for Vue 3).
|
|We highly recommend registration by name for the flexibility it provides - all of our examples use registration by name.
|
</note>
</framework-specific-section>
