const BAR_TEMPLATE = `
    <div style="position: relative">
        <div style="width: 50%">
            <svg width="100%" preserveAspectRatio="none">
                <rect x="BAR_X" y="0" width="BAR_WIDTH" height="20px" rx="4" ry="4" style="BAR_STYLE">
            </svg>
        </div>
        <div style="position: absolute; top: 0; width: 100%; text-align: right">PCT_NET_CHANGE</div>
    </div>`;

function HorizontalBarComponent() {
}

HorizontalBarComponent.prototype.init = function (params) {
    this.value = params.value;
};

HorizontalBarComponent.prototype.getGui = function () {
    this.eGui = document.createElement('div');
    this.eSpan = document.createElement('span');
    this.eGui.appendChild(this.eSpan);

    this.updateGui();

    return this.eGui;
};


HorizontalBarComponent.prototype.refresh = function (params) {
    this.value = params.value;
    this.updateGui();
};

HorizontalBarComponent.prototype.updateGui = function () {
    let positiveChange = "fill: green";
    let negativeChange = "fill: red";

    let pctNetChange = this.value;
    let pctNetChangeBar = Math.min(Math.abs(pctNetChange) * 100, 100) / 2;

    let barWidth = `${pctNetChangeBar}%`;
    let barStyle = pctNetChange >= 0 ? positiveChange : negativeChange;
    let barX = `${pctNetChange >= 0 ? '50' : 50 - pctNetChangeBar}%`;

    let template = BAR_TEMPLATE.replace("BAR_X", barX);
    template = template.replace("BAR_WIDTH", barWidth);
    template = template.replace("BAR_STYLE", barStyle);
    template = template.replace("PCT_NET_CHANGE", pctNetChange);

    this.eSpan.innerHTML = template;
};
