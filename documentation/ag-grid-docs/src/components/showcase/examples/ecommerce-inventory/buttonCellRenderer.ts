// Custom cell renderer component
export function ButtonCellRenderer() {}

// Mandatory method: init(params)
ButtonCellRenderer.prototype.init = function (params) {
    this.params = params;

    // Create container div
    this.eGui = document.createElement('div');

    // Create "Remove" button
    this.removeButton = document.createElement('button');
    this.removeButton.innerHTML = 'Remove';
    this.removeButton.addEventListener('click', this.onRemoveClick.bind(this));
    this.eGui.appendChild(this.removeButton);

    // Create "Stop selling" button
    this.stopSellingButton = document.createElement('button');
    this.stopSellingButton.innerHTML = 'Stop selling';
    this.stopSellingButton.addEventListener('click', this.onStopSellingClick.bind(this));
    this.eGui.appendChild(this.stopSellingButton);
};

// Mandatory method: getGui()
ButtonCellRenderer.prototype.getGui = function () {
    return this.eGui;
};

// Custom method: onRemoveClick()
ButtonCellRenderer.prototype.onRemoveClick = function () {
    // Access row data via this.params.node.data
    const rowData = this.params.node.data;

    // Delete row data
    this.params.api.applyTransaction({ remove: [rowData] });

    // Show pop-up window
    alert('Inventory deleted');

    // Implement your button click logic here
};

// Custom method: onStopSellingClick()
ButtonCellRenderer.prototype.onStopSellingClick = function () {
    // Access row data via this.params.node.data
    const rowData = this.params.node.data;

    // Modify the status property to 'paused'
    rowData.status = 'Paused';

    // Refresh the row to reflect the changes
    this.params.api.applyTransaction({ update: [rowData] });

    // Show pop-up window
    alert('Inventory status updated to "Paused"');

    // Implement your "Stop selling" button click logic here
};
