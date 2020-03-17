import Vue from "vue";

export default Vue.extend({
    template: `
            <span>
                <img :src="imageSource" >{{value}}    
            </span>
    `,
    data: function () {
        return {
            imageSource: null,
            value: ''
        };
    },
    beforeMount() {
        this.image = this.params.value === 'Male' ? 'male.png' : 'female.png';
        this.imageSource = `../images/${this.image}`;
        this.value = this.params.value;
    },
    mounted() {
    },
    methods: {}
});