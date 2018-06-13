<template>
    <div class="filter">
        <span class="reset" @click="onResetDate()">x</span>
        <input class="dd" @change="onDateChanged('dd', $event)" placeholder="dd" v-model="dd"
               maxLength="2"/>/
        <input class="mm" @change="onDateChanged('mm', $event)" placeholder="mm" v-model="mm"
               maxLength="2"/>/
        <input class="yyyy" @change="onDateChanged('yyyy', $event)" placeholder="yyyy" v-model="yyyy"
               maxLength="4"/>
    </div>
</template>

<script>
    import Vue from "vue";

    export default Vue.extend({
        data() {
            return {
                date: null,
                dd: '',
                mm: '',
                yyyy: ''
            }
        },
        methods: {
            onResetDate() {
                this.dd = '';
                this.mm = '';
                this.yyyy = '';
                this.date = null;
                this.params.onDateChanged();
            },

            onDateChanged (on, $event){
                let targetValue = $event.target.value;
                this.date = this.parseDate(
                    on === 'dd' ? targetValue : this.dd,
                    on === 'mm' ? targetValue : this.mm,
                    on === 'yyyy' ? targetValue : this.yyyy
                );
                this.params.onDateChanged();
            },

            getDate(){
                return this.date;
            },

            setDate(date) {
                if(!date) return;

                this.dd = date.getDate() + '';
                this.mm = (date.getMonth() + 1) + '';
                this.yyyy = date.getFullYear() + '';
                this.date = date;
                this.params.onDateChanged();
            },

            parseDate (dd, mm, yyyy){
                //If any of the three input date fields are empty, stop and return null
                if (dd.trim() === '' || mm.trim() === '' || yyyy.trim() === '') {
                    return null;
                }

                let day = Number(dd);
                let month = Number(mm);
                let year = Number(yyyy);

                let date = new Date(year, month - 1, day);

                //If the date is not valid
                if (isNaN(date.getTime())) {
                    return null;
                }

                if (date.getDate() != day || date.getMonth() + 1 != month || date.getFullYear() != year) {
                    return null;
                }
                return date;
            }
        }
    })

</script>

<style scoped>
    .filter {
        margin: 2px
    }

    .dd {
        width: 30px
    }

    .mm {
        width: 30px
    }

    .yyyy {
        width: 60px
    }

    .reset {
        padding: 2px;
        background-color: red;
        border-radius: 3px;
        font-size: 10px;
        margin-right: 5px;
        color: white
    }
</style>