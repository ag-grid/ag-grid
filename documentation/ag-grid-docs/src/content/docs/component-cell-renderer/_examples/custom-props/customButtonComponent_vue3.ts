export default {
    template: `
        <div>        
            <button v-on:click="this.params.onClick">{{this.params.data?.company ? 'Launch ' + this.params.data.company + '!' : 'Launch!'}}</button>
        </div>
    `,
    methods: {},
};
