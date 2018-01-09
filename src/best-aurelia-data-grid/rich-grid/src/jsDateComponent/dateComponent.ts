function DateComponent() {
}

DateComponent.prototype.init = function (params) {
    this.params = params;
    this.eGui = document.createElement('div');

    this.eGui.innerHTML = '' +
        '<div class="filter">' +
        '<span class="reset">x</span>' +
        '<input class="dd" placeholder="dd" maxLength="2"/>/' +
        '<input class="mm" placeholder="mm" maxLength="2"/>/' +
        '<input class="yyyy" placeholder="yyyy" maxLength="4"/>' +
        '</div>';

    this.eReset = this.eGui.querySelector('.reset');
    this.onResetDate = this.onResetDate.bind(this);
    this.eReset.addEventListener('click', this.onResetDate);


    this.eDD = this.eGui.querySelector('.dd');
    this.eMM = this.eGui.querySelector('.mm');
    this.eYYYY = this.eGui.querySelector('.yyyy');

    this.onDateChanged = this.onDateChanged.bind(this);
    this.eDD.addEventListener('change', this.onDateChanged);
    this.eMM.addEventListener('change', this.onDateChanged);
    this.eYYYY.addEventListener('change', this.onDateChanged);
};

DateComponent.prototype.getGui = function () {
    return this.eGui;
};

DateComponent.prototype.onDateChanged = function (event) {
    let targetClass = event.target.classList[0];
    let targetValue = event.target.value;
    this.date = this.parseDate(
        targetClass === 'dd' ? targetValue : this.eDD.value,
        targetClass === 'mm' ? targetValue : this.eMM.value,
        targetClass === 'yyyy' ? targetValue : this.eYYYY.value
    );
    this.params.onDateChanged();
};

DateComponent.prototype.onResetDate = function () {
    this.dd = '';
    this.mm = '';
    this.yyyy = '';
    this.date = null;
    this.params.onDateChanged();
};

DateComponent.prototype.getDate = function () {
    return this.date;
};

DateComponent.prototype.setDate = function (date) {
    if(!date) return;

    this.dd = date.getDate() + '';
    this.mm = (date.getMonth() + 1) + '';
    this.yyyy = date.getFullYear() + '';
    this.date = date;
    this.params.onDateChanged();
};

DateComponent.prototype.parseDate = function (dd, mm, yyyy) {
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

export default DateComponent;