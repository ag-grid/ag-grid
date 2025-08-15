export default {
    template: `
        <div>        
            <button v-on:click="buttonClicked">Custom Button</button>
        </div>
    `,
    methods: {
        buttonClicked() {
            console.log('Button clicked');
        },
    },
};
