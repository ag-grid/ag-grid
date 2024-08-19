export default {
    template: `
        <div>        
            <button ref="eButton" v-on:click="buttonClicked">Custom Button</button>
        </div>
    `,
    methods: {
        buttonClicked() {
            console.log('Button clicked');
        },
        suppressGridClickHandling(event) {
            return this.$refs.eButton.contains(event.target);
        },
    },
};
