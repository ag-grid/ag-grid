import { defineComponent } from 'vue';
import type { PropType } from 'vue';

import type { Column, IFilterComp, IMenuItemParams } from 'ag-grid-community';

export default defineComponent({
    props: {
        params: {
            type: Object as PropType<IMenuItemParams & { column: Column }>,
            required: true,
        },
    },
    template: `
        <div>
            <div
                ref="option"
                tabindex="-1"
                class="ag-menu-option"
                :class="{ 'ag-menu-option-active': active }"
                @mouseenter="onMouseEnter()"
                @mouseleave="onMouseLeave()"
                @click="onClick()"
                @keydown="onOptionKeyDown($event)"
            >
                <span class="ag-menu-option-part ag-menu-option-icon" role="presentation">
                    <span class="ag-icon ag-icon-filter" unselectable="on" role="presentation"></span>
                </span>
                <span class="ag-menu-option-part ag-menu-option-text">Filter</span>
                <span class="ag-menu-option-part ag-menu-option-popup-pointer">
                    <span class="ag-icon" :class="{ 'ag-icon-tree-closed': !expanded, 'ag-icon-tree-open': expanded }" unselectable="on" role="presentation"></span>
                </span>
            </div>
            <div
                ref="filterWrapper"
                class="filter-wrapper"
                :style="{ 'display': expanded ? 'block' : 'none' }"
                @keydown="onFilterWrapperKeyDown($event)"
            ></div>
        </div>
    `,
    data() {
        return {
            active: false,
            expanded: false,
        };
    },
    methods: {
        setActive(active: boolean) {
            this.active = active;
            if (active) {
                (this.$refs.option as HTMLElement).focus();
            }
        },
        onClick() {
            this.expanded = !this.expanded;
        },
        onMouseEnter() {
            this.setActive(true);
            this.params.onItemActivated();
        },
        onMouseLeave() {
            this.setActive(false);
        },
        onOptionKeyDown(e: KeyboardEvent) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.onClick();
            }
        },
        onFilterWrapperKeyDown(e: KeyboardEvent) {
            // stop the menu from handling keyboard navigation inside the filter
            e.stopPropagation();
        },
    },
    mounted() {
        this.params.api.getColumnFilterInstance(this.params.column).then((filter) => {
            (this.$refs.filterWrapper as HTMLElement).appendChild((filter as IFilterComp).getGui());
        });
    },
});
