function CallsCellRenderer() {}

CallsCellRenderer.prototype.init = function(params) {
    var eTemp = document.createElement('div');
    eTemp.innerHTML = '<span class="calls-cell-renderer">' +
        '<button ref="btAdd">+</button>' +
        '<button ref="btRemove">-</button>' +
        '<span ref="eValue"></span>' +
        '</span>';

    this.eGui = eTemp.firstChild;

    this.eValue = this.eGui.querySelector('[ref="eValue"]');
    var btAdd = this.eGui.querySelector('[ref="btAdd"]');
    var btRemove = this.eGui.querySelector('[ref="btRemove"]');

    btAdd.addEventListener('click', this.onBtAdd.bind(this, params));
    btRemove.addEventListener('click', this.onBtRemove.bind(this, params));

    this.refresh(params);
};

CallsCellRenderer.prototype.onBtRemove = function(params) {

    var oldData = params.node.data;

    var oldCallRecords = oldData.callRecords;

    if (oldCallRecords.length==0) { return; }

    var newCallRecords = oldCallRecords.slice(0); // make a copy
    newCallRecords.pop(); // remove one item

    var minutes = 0;
    newCallRecords.forEach( function(r) { minutes += r.duration });

    var newData = {
        name: oldData.name,
        account: oldData.account,
        calls: newCallRecords.length,
        minutes: minutes,
        callRecords: newCallRecords
    };

    gridOptions.api.applyTransaction({update: [newData]});
};

CallsCellRenderer.prototype.onBtAdd = function(params) {
    var oldData = params.node.data;

    var oldCallRecords = oldData.callRecords;

    var newCallRecords = oldCallRecords.slice(0); // make a copy
    newCallRecords.push({
        name: ["Bob","Paul","David","John"][Math.floor(Math.random()*4)],
        callId: Math.floor(Math.random()*1000),
        duration: Math.floor(Math.random()*100) + 1,
        switchCode: "SW5",
        direction: "Out",
        number: "(02) " + Math.floor(Math.random()*1000000)
    }); // add one item

    var minutes = 0;
    newCallRecords.forEach( function(r) { minutes += r.duration });

    var newData = {
        name: oldData.name,
        account: oldData.account,
        calls: newCallRecords.length,
        minutes: minutes,
        callRecords: newCallRecords
    };

    gridOptions.api.applyTransaction({update: [newData]});

    params.node.setExpanded(true);
};

CallsCellRenderer.prototype.refresh = function(params) {
    this.eValue.innerHTML = params.value;
};

CallsCellRenderer.prototype.getGui = function() {
    return this.eGui;
};
