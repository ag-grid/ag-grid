export default {
    template: `
        <div :style="{overflow: 'hidden', textOverflow: 'ellipsis'}" :set="values = (Array.isArray(params.value) ? params.value : [params.value]).filter(value => value != null && value !== '')">
            <template v-for="(value, index) in values">
                <span :style="{paddingRight: '2px', borderLeft: '10px solid ' + value}"></span>
                {{value}}<template v-if="index != values.length - 1">, </template>
            <template>
        </div>
    `,
};
