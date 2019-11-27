const fs = require('fs');

module.exports = {
    lockFile: __dirname + '/../docs_are_running',
    add: function (errorMessage) {
        console.log('Add lock file:', this.lockFile);
        console.trace();

        if (this.isLocked()) {
            console.error(errorMessage);
            return false;
        }
        fs.writeFileSync(this.lockFile);
        return true;
    },
    remove: function () {
        console.log('Remove lock file:', this.lockFile);
        console.trace();

        if (this.isLocked()) {
            fs.unlinkSync(this.lockFile);
        }
    },
    isLocked() {
        return fs.existsSync(this.lockFile);
    }
};
