import Vue from "vue";

export default Vue.extend({
    template: '<img width="20px" :src="imgForMood" />',
    data() {
        return {
            mood: 'Happy',
            imgForMood: null
        }
    },
    methods: {
        refresh(params) {
            this.params = params;
            this.setMood(params);
        },

        setMood(params) {
            this.mood = params.value;
            this.imgForMood = this.mood === 'Happy' ? '../images/smiley.png' : '../images/smiley-sad.png';
        }
    },
    created() {
        this.setMood(this.params);
    }
})
