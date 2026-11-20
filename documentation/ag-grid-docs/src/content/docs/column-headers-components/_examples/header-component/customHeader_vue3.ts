import { defineComponent } from 'vue';
import type { PropType } from 'vue';

import type { IHeaderParams, SortDirection } from 'ag-grid-community';

export default defineComponent({
    props: {
        params: {
            type: Object as PropType<IHeaderParams & { menuIcon: string }>,
            required: true,
        },
    },
    template: `
      <div>
      <div v-if="params.enableFilterButton" ref="menuButton" class="customHeaderMenuButton" @click="onMenuClicked($event)">
        <i class="fa" :class="params.menuIcon"></i>
      </div>
      <div class="customHeaderLabel">{{ params.displayName }}</div>
      <div v-if="params.enableSorting" @click="onSortRequested('asc', $event)" :class="ascSort" class="customSortDownLabel">
        <i class="fa fa-long-arrow-alt-down"></i></div>
      <div v-if="params.enableSorting" @click="onSortRequested('desc', $event)" :class="descSort" class="customSortUpLabel">
        <i class="fa fa-long-arrow-alt-up"></i></div>
      <div v-if="params.enableSorting" @click="onSortRequested('', $event)" :class="noSort" class="customSortRemoveLabel">
        <i class="fa fa-times"></i>
      </div>
      </div>
    `,
    data: function () {
        return {
            ascSort: null as string | null,
            descSort: null as string | null,
            noSort: null as string | null,
        };
    },
    beforeMount() {},
    mounted() {
        this.params.column.addEventListener('sortChanged', this.onSortChanged);
        this.onSortChanged();
    },
    methods: {
        onMenuClicked() {
            this.params.showColumnMenu(this.$refs.menuButton as HTMLElement);
        },

        onSortChanged() {
            this.ascSort = this.descSort = this.noSort = 'inactive';
            const sort = this.params.column.getSortDef()?.direction;
            if (sort === 'asc') {
                this.ascSort = 'active';
            } else if (sort === 'desc') {
                this.descSort = 'active';
            } else {
                this.noSort = 'active';
            }
        },

        onSortRequested(order: SortDirection, event: MouseEvent) {
            this.params.setSort(order, event.shiftKey);
        },
    },
});
