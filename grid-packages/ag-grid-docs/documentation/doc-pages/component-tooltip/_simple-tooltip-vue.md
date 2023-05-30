<framework-specific-section frameworks="vue">
|
|Below is an example of a tooltip component:
|
</framework-specific-section>

<framework-specific-section frameworks="vue">
<snippet transform={false}>
|const MyTooltipComponent = {
|    template: `
|      &lt;div class="custom-tooltip" v-bind:style="{ backgroundColor: color }">
|          &lt;p>&lt;span>{{ data.athlete }}&lt;/span>&lt;/p>
|          &lt;p>&lt;span>Country: &lt;/span>{{ data.country }}&lt;/p>
|          &lt;p>&lt;span>Total: &lt;/span>{{ data.total }}&lt;/p>
|      &lt;/div>
|    `,
|    data: function () {
|        return {
|            color: null,
|            athlete: null,
|            country: null,
|            total: null
|        };
|    },
|    beforeMount() {
|        this.data = this.params.api.getDisplayedRowAtIndex(this.params.rowIndex).data;
|        this.color = this.params.color || 'white';
|    }
|}
</snippet>
</framework-specific-section>