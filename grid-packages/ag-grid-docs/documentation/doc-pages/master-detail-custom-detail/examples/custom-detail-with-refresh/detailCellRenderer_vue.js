export default {
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
                            {{ now }}
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
    mounted() {
        this.callsCount = this.params.data.calls;
        this.now = new Date().toLocaleTimeString();
    },
    methods: {
        // called when the cell is refreshed
        refresh(params) {
            // check and see if we need to get the grid to tear this
            // component down and update it again
            return params.data.calls === this.params.data.callsCount;
        }
    }
};
