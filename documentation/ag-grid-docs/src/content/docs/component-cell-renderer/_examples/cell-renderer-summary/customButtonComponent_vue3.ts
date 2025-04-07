export default {
    template: `
        <div>        
            <button v-on:click="buttonClicked">Launch!</button>
        </div>
    `,
    methods: {
        buttonClicked() {
            console.log('Software Launched');
        },
    },
};
