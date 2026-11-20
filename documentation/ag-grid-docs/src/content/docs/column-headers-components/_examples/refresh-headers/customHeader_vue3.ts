import { defineComponent } from 'vue';
import type { PropType } from 'vue';

import type { IHeaderParams, SortDirection } from 'ag-grid-community';

export default defineComponent({
    props: {
        params: {
            type: Object as PropType<IHeaderParams>,
            required: true,
        },
    },
    template: `
        <div style="display: flex">
            <span v-if="enableFilterButton" ref="menuButton" class="ag-icon ag-icon-menu" @click="onMenuClicked($event)"></span>
            <div class="customHeaderLabel">{{ displayName }}</div>
            <div v-if="enableSorting" @click="onSortRequested('asc', $event)" :class="ascSort"
                 class="customSortDownLabel"><i class="fa fa-long-arrow-alt-down"></i></div>
            <div v-if="enableSorting" @click="onSortRequested('desc', $event)" :class="descSort"
                 class="customSortUpLabel"><i class="fa fa-long-arrow-alt-up"></i></div>
            <div v-if="enableSorting" @click="onSortRequested('', $event)" :class="noSort"
                 class="customSortRemoveLabel"><i class="fa fa-times"></i></div>
        </div>
    `,
    data: function () {
        return {
            ascSort: null as string | null,
            descSort: null as string | null,
            noSort: null as string | null,
            enableFilterButton: false,
            enableSorting: false as boolean | undefined,
            displayName: null as string | null,
        };
    },
    beforeMount() {
        this.enableFilterButton = this.params.enableFilterButton;
        this.enableSorting = this.params.enableSorting;
        this.displayName = this.params.displayName;
    },
    mounted() {
        console.log('CustomHeader - mounted() -> ' + this.params.column.getId());

        this.params.column.addEventListener('sortChanged', this.onSortChanged);
        this.onSortChanged();
    },
    unmounted() {
        console.log('CustomHeader unmounted() -> ' + this.params.column.getId());
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

        refresh(params: IHeaderParams): boolean {
            const filterChanged = this.enableFilterButton === params.enableFilterButton;
            console.log('CustomHeader refresh() -> ' + this.params.column.getId() + ' returning ' + filterChanged);
            this.enableFilterButton = params.enableFilterButton;
            this.enableSorting = params.enableSorting;
            this.displayName = params.displayName;
            return filterChanged;
        },
    },
});
