export default {
    template: `
      <div style="display: flex">
      <span v-if="params.enableMenu" ref="menuButton" class="ag-icon ag-icon-menu" @click="onMenuClicked($event)"></span>
      <div class="customHeaderLabel">{{ params.displayName }}</div>
      <div v-if="params.enableSorting" @click="onSortRequested('asc', $event)" :class="ascSort"
           class="customSortDownLabel"><i class="fa fa-long-arrow-alt-down"></i></div>
      <div v-if="params.enableSorting" @click="onSortRequested('desc', $event)" :class="descSort"
           class="customSortUpLabel"><i class="fa fa-long-arrow-alt-up"></i></div>
      <div v-if="params.enableSorting" @click="onSortRequested('', $event)" :class="noSort"
           class="customSortRemoveLabel"><i class="fa fa-times"></i></div>
      </div>
    `,
    data: function () {
        return {
            ascSort: null,
            descSort: null,
            noSort: null
        };
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
            this.params.showColumnMenu(this.$refs.menuButton);
        },

        onSortChanged() {
            this.ascSort = this.descSort = this.noSort = 'inactive';
            if (this.params.column.isSortAscending()) {
                this.ascSort = 'active';
            } else if (this.params.column.isSortDescending()) {
                this.descSort = 'active';
            } else {
                this.noSort = 'active';
            }
        },

        onSortRequested(order, event) {
            this.params.setSort(order, event.shiftKey);
        },

        refresh(params) {
            this.params = params;
            console.log('CustomHeader refresh() -> ' + this.params.column.getId());
            return true;
        }
    }
};
