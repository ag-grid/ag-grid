export default {
    template: `
        <div>        
            <button class="btn-simple" v-on:click="buttonClicked">{{this.params.data?.company ? 'Launch ' + this.params.data.company + '!' : 'Launch!'}}</button>
        </div>
    `,
    methods: {
        buttonClicked() {
            console.log('Software Launched');
        },
    },
};
