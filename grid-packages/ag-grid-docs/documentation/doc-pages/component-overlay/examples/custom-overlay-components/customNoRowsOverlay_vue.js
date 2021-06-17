export default {
    template: `
        <div class="ag-overlay-loading-center" style="background-color: lightcoral;">
            <i class="far fa-frown"> {{params.noRowsMessageFunc()}}</i>
        </div>
    `
};
