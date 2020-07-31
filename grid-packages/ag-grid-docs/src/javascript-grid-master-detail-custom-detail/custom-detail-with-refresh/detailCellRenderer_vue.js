import Vue from "vue";

export default Vue.extend({
    template: `
        <div>
            <form>
                <div>
                    <p>
                        <label>
                            Calls:<br>
                            <input type="text" :value="callsCount">
                        </label>
                    </p>
                    <p>
                        <label>
                            Last Updated:<br>
                            {{now}}
                        </label>
                    </p>
                </div>
            </form>
        </div>
    `,
    data: function () {
        return {
            callsCount: 0,
            now: ''
        };
    },
    beforeMount() {
    },
    mounted() {
        this.callsCount = this.params.data.call;
        this.now = new Date().toLocaleTimeString();
    },
    methods: {
        // called when the cell is refreshed
        refresh(params) {
            // check and see if we need to get the grid to tear this
            // component down and update it again
            console.log('d');
            if (params.data.calls!=this.callsCount) {
                return false;
            } else {
                return true;
            }
        }
    }
});