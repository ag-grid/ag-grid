import Vue from "vue";

export default Vue.extend({
    template: `
        <div>
            <form>
                <div>
                    <p>
                        <label>
                            Call Id:<br>
                            <input type="text" :value="firstRecord.callId">
                        </label>
                    </p>
                    <p>
                        <label>
                            Number:<br>
                            <input type="text" :value="firstRecord.number">
                        </label>
                    </p>
                    <p>
                        <label>
                            Direction:<br>
                            <input type="text" :value="firstRecord.direction">
                        </label>
                    </p>
                </div>
            </form>
        </div>
    `,
    data: function () {
        return {
            firstRecord: {}
        };
    },
    beforeMount() {
    },
    mounted() {
        this.firstRecord = this.params.data.callRecords[0];
    },
    methods: {
        // called when the cell is refreshed
        refresh() {
            return false;
        }
    }
});