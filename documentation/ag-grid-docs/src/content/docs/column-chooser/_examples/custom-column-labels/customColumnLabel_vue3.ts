export default {
    template: `
        <span class="custom-column-label">
            <span class="custom-column-label-icon">
                {{ params.columnGroup ? params.columnGroupIcon : params.columnIcon }}
            </span>
            <span class="custom-column-label-text">{{ params.displayName }}</span>
        </span>
    `,
};
