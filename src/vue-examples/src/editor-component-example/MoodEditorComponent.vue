<template>
    <div :ref="'container'" class="mood" tabindex="0" @keydown="onKeyDown">
        <img src="images/smiley.png" @click="onClick(true)" :class="{selected : happy, default : !happy}">
        <img src="images/smiley-sad.png" @click="onClick(false)" :class="{selected : !happy, default : happy}">
    </div>
</template>

<script>
    import Vue from "vue";

    export default Vue.extend({
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
</script>


<style scoped>
    .mood {
        border-radius: 15px;
        border: 1px solid grey;
        background: #e6e6e6;
        padding: 15px;
        text-align: center;
        display: inline-block;
        outline: none
    }

    .default {
        border: 1px solid transparent !important;
        padding: 4px;
    }

    .selected {
        border: 1px solid lightgreen !important;
        padding: 4px;
    }
</style>