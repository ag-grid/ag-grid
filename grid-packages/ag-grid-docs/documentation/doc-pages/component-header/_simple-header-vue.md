<framework-specific-section frameworks="vue">
|Below is an example of header component:
</framework-specific-section>

<framework-specific-section frameworks="vue">
<snippet transform={false}>
|const CustomHeader = {
|    template: `
|      &lt;div>
|          &lt;div v-if="params.enableMenu" ref="menuButton" class="customHeaderMenuButton" @click="onMenuClicked($event)">
|            &lt;i class="fa" :class="params.menuIcon">&lt;/i>
|          &lt;/div>
|          &lt;div class="customHeaderLabel">{{ params.displayName }}&lt;/div>
|          &lt;div v-if="params.enableSorting" @click="onSortRequested('asc', $event)" :class="ascSort" class="customSortDownLabel">
|            &lt;i class="fa fa-long-arrow-alt-down">&lt;/i>&lt;/div>
|          &lt;div v-if="params.enableSorting" @click="onSortRequested('desc', $event)" :class="descSort" class="customSortUpLabel">
|            &lt;i class="fa fa-long-arrow-alt-up">&lt;/i>&lt;/div>
|          &lt;div v-if="params.enableSorting" @click="onSortRequested('', $event)" :class="noSort" class="customSortRemoveLabel">
|            &lt;i class="fa fa-times">&lt;/i>
|          &lt;/div>
|      &lt;/div>
|    `,
|    data: function () {
|        return {
|            ascSort: null,
|            descSort: null,
|            noSort: null
|        };
|    },
|    beforeMount() {
|    },
|    mounted() {
|        this.params.column.addEventListener('sortChanged', this.onSortChanged);
|        this.onSortChanged();
|    },
|    methods: {
|        onMenuClicked() {
|            this.params.showColumnMenu(this.$refs.menuButton);
|        },
|
|        onSortChanged() {
|            this.ascSort = this.descSort = this.noSort = 'inactive';
|            if (this.params.column.isSortAscending()) {
|                this.ascSort = 'active';
|            } else if (this.params.column.isSortDescending()) {
|                this.descSort = 'active';
|            } else {
|                this.noSort = 'active';
|            }
|        },
|
|        onSortRequested(order, event) {
|            this.params.setSort(order, event.shiftKey);
|        }
|    }
|};
</snippet>
</framework-specific-section>