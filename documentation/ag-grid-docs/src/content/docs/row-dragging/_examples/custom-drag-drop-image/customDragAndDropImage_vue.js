export default {
    template: `
        <div class="my-custom-drag-and-drop-cover">
            <i class="fas fa-2x" ref="eIcon"></i>
            <div ref="eLabel"></div>
        </div>
    `,
    methods: {
        setLabel(label) {
            this.$refs.eLabel.innerHTML = label;
        },

        setIcon(icon) {
            const { eIcon } = this.$refs;
            if (!eIcon) {
                return;
            }
            eIcon.classList.toggle('fa-hand-point-left', icon === 'left');
            eIcon.classList.toggle('fa-hand-point-right', icon === 'right');
            eIcon.classList.toggle('fa-ban', icon === 'notAllowed');
            eIcon.classList.toggle('fa-thumbtack', icon === 'pinned');
            eIcon.classList.toggle('fa-walking', icon === 'move');
        },
    },
};
