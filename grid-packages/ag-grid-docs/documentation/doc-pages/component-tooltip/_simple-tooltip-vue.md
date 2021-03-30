[[only-vue]]
|
|Below is a simple example of an a tooltip component:
|
|```js
|const MyTooltipComponent = {
|    template: `
|      <div class="custom-tooltip" v-bind:style="{ color: color }">
|          <p><span>{{ data.athlete }}</span></p>
|          <p><span>Country: </span>{{ data.country }}</p>
|          <p><span>Total: </span>{{ data.total }}</p>
|      </div>
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
|        this.data = params.api.getDisplayedRowAtIndex(params.rowIndex).data;
|        this.color = this.params.color || 'white';
|    }
|}
|```
 
