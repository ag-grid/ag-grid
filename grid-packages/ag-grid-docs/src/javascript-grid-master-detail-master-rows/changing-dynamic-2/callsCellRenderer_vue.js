import Vue from "vue";

export default Vue.extend({
    template: `
        <span class="calls-cell-renderer">
            <button v-on:click="onAdd">+</button>
            <button v-on:click="onRemove">-</button>
            <span>{{value}}</span>
        </span>
    `,
    data: {
    },
    computed: {
        value: function() {
            return this.params.value;
        },
    },
    beforeMount() {
    },
    mounted() {
    },
    methods: {
        onAdd: function() {
            var oldData = this.params.node.data;

            var oldCallRecords = oldData.callRecords;

            var newCallRecords = oldCallRecords.slice(0); // make a copy
            newCallRecords.push({
                name: ["Bob","Paul","David","John"][Math.floor(Math.random()*4)],
                callId: Math.floor(Math.random()*1000),
                duration: Math.floor(Math.random()*100) + 1,
                switchCode: "SW5",
                direction: "Out",
                number: "(02) " + Math.floor(Math.random()*1000000)
            }); // add one item

            var minutes = 0;
            newCallRecords.forEach( function(r) { minutes += r.duration });

            var newData = {
                name: oldData.name,
                account: oldData.account,
                calls: newCallRecords.length,
                minutes: minutes,
                callRecords: newCallRecords
            };

            this.params.api.applyTransaction({update: [newData]});

            this.params.node.setExpanded(true);
        },
        onRemove: function() {
            var oldData = this.params.node.data;

            var oldCallRecords = oldData.callRecords;

            if (oldCallRecords.length==0) { return; }

            var newCallRecords = oldCallRecords.slice(0); // make a copy
            newCallRecords.pop(); // remove one item

            var minutes = 0;
            newCallRecords.forEach( function(r) { minutes += r.duration });

            var newData = {
                name: oldData.name,
                account: oldData.account,
                calls: newCallRecords.length,
                minutes: minutes,
                callRecords: newCallRecords
            };

            this.params.api.applyTransaction({update: [newData]});
        }
    }
});
