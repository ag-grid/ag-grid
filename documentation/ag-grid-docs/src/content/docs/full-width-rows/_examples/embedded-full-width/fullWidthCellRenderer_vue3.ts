export default {
    template: `
        <div v-if="!hidden" :class="cssClass">
            <button @click="clicked()">Click</button>
            {{message}}
        </div>    `,
    data() {
        return {
            hidden: false,
            cssClass: '',
            message: '',
        };
    },
    beforeMount() {
        const {
            pinned,
            node: { rowIndex },
        } = this.params;

        if ((pinned === 'left' && rowIndex % 4 === 0) || (pinned === 'right' && rowIndex % 2 === 0)) {
            this.hidden = true;
            return;
        }

        this.cssClass = pinned ? 'example-full-width-pinned' : 'example-full-width-row';
        this.message = pinned
            ? `Pinned full width on ${pinned} - index ${rowIndex}`
            : `Non pinned full width row at index ${rowIndex}`;
    },
    methods: {
        clicked() {
            console.log('button clicked');
        },
    },
};
