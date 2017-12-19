<template>
    <div>
        <div :ref="'menu'" v-if="params.enableMenu" @click="onMenuClick" class="customHeaderMenuButton">
            <i :class="menuIcon"></i>
        </div>
        <div class="customHeaderLabel">{{params.displayName}}</div>
        <div v-if="params.enableSorting" @click="onSortRequested('asc', $event)" :class="{active : sort === 'asc'}" class="customSortDownLabel"><i
                class="fa fa-long-arrow-down"></i>
        </div>
        <div v-if="params.enableSorting" @click="onSortRequested('desc', $event)" :class="{active : sort === 'desc'}" class="customSortUpLabel"><i
                class="fa fa-long-arrow-up"></i></div>
        <div v-if="params.enableSorting" @click="onSortRequested('', $event)" :class="{active : sort == ''}" class="customSortRemoveLabel"><i
                class="fa fa-times"></i></div>
    </div>
</template>

<script>
    import Vue from "vue";

    export default Vue.extend({
        data() {
            return {
                menuIcon: "",
                sort: ""
            };
        },
        methods: {
            onSortChanged() {
                // handle specific sorting event changes here
            },
            onMenuClick() {
                this.params.showColumnMenu(this.$refs.menu);
            },
            onSortRequested(order, event) {
                this.sort = order;
                this.params.setSort(order, event.shiftKey);
            }
        },
        mounted() {
            this.menuIcon = `fa ${this.params.menuIcon}`;
            this.params.column.addEventListener('sortChanged', this.onSortChanged);
        }
    });
</script>

<style scoped>
    .customHeaderMenuButton {
        margin-top: 5px;
        margin-left: 4px;
        float: left;
    }

    .customHeaderLabel {
        margin-left: 5px;
        margin-top: 3px;
        float: left;
    }

    .customSortDownLabel {
        float: left;
        margin-left: 10px;
        margin-top: 5px;
    }

    .customSortUpLabel {
        float: left;
        margin-left: 3px;
        margin-top: 4px;
    }

    .customSortRemoveLabel {
        float: left;
        font-size: 11px;
        margin-left: 3px;
        margin-top: 6px;
    }

    .active {
        color: cornflowerblue;
    }
</style>