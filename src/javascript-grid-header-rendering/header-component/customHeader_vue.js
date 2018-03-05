import Vue from "vue";

export default Vue.extend({
    template: `
        <div>
            Hello World
        </div>
    `,
    data: function () {
        return {
        };
    },
    beforeMount() {
        console.log("beforeMount")
    },
    mounted() {
        console.log("mounted")
    },
    methods: {
    }
});