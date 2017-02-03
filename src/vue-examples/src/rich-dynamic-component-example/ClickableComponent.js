import Vue from "vue";

export default Vue.extend({
    template: `<button @click="click">Click Me</button>`,
    props: ["onClicked", "cell"],
    methods: {
        click() {
            this.onClicked(this.cell);
        }
    }
});
