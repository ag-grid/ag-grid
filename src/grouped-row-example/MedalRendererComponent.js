import Vue from "vue";

export default Vue.extend({
    template: '<span>{{country}} Gold: {{gold}}, Silver: {{silver}}, Bronze: {{bronze}}</span>',
    data() {
        return {
            country: null,
            gold: null,
            silver: null,
            bronze: null
        }
    },
    created() {
        this.country = this.params.node.key;
        this.gold = this.params.data.gold;
        this.silver = this.params.data.silver;
        this.bronze = this.params.data.bronze;
    }
})


