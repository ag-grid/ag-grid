import Vue from "vue";

export default Vue.extend({
    template: `
        <div :ref="'container'" class="mood" tabindex="0" @keydown="onKeyDown">
            <img src="https://www.ag-grid.com/images/smiley.png" @click="onClick(true)" :class="{selected : happy, default : !happy}">
            <img src="https://www.ag-grid.com/images/smiley-sad.png" @click="onClick(false)" :class="{selected : !happy, default : happy}">
        </div>
    `,
    data() {
        return {
            happy: false,
            imgForMood: null
        }
    },
    methods: {
        getValue() {
            return this.happy ? "Happy" : "Sad";
        },

        isPopup() {
            return true;
        },

        setHappy(happy) {
            this.happy = happy;
        },

        toggleMood() {
            this.setHappy(!this.happy);
        },

        onClick(happy) {
            this.setHappy(happy);
            this.params.api.stopEditing();
        },

        onKeyDown(event) {
            let key = event.which || event.keyCode;
            if (key == 37 ||  // left
                key == 39) {  // right
                this.toggleMood();
                event.stopPropagation();
            }
        }
    },
    created() {
        this.setHappy(this.params.value === "Happy");
    },
    mounted() {
        Vue.nextTick(() => {
            this.$refs.container.focus();
        });
    }
})
