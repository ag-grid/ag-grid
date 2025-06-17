export default {
    template: `
        <div>        
            {{ this.params.value }}
        </div>
    `,
    beforeMount() {
        const delay = 50;
        const start = Date.now();
        while (Date.now() - start < delay) {
            // Busy-waiting loop to simulate a delay
        }
    },
};
