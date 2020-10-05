<template>
    <input v-model="value" type="number" style="width: 100%">
</template>

<script>
    export default {
        name: 'Editor',
        data() {
            return {
                value: null
            }
        },
        beforeMount() {
            this.value = this.params.value;
        },
        methods: {
            getValue() {
                return this.value;
            },

            // for testing
            setValue(newValue) {
                this.value = newValue;
            },

            isCancelBeforeStart() {
                return false;
            },

            isCancelAfterEnd() {
                return false;
            }
        }
    }
</script>

<style scoped>
</style>
