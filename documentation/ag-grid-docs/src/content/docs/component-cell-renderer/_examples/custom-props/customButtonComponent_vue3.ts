export default {
    template: `
        <div>        
            <button class="btn-simple" v-on:click="this.params.onClick">{{this.params.data?.company ? 'Launch ' + this.params.data.company + '!' : 'Launch!'}}</button>
        </div>
    `,
    methods: {},
};
