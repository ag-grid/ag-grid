const fs = require('fs');

module.exports = {
    lockFile: __dirname + '/../docs_are_running',
    add: function (errorMessage) {
        if (this.isLocked()) {
            console.error(errorMessage);
            return false;
        }
        fs.writeFileSync(this.lockFile);
        return true;
    },
    remove: function () {
        if (this.isLocked()) {
            fs.unlinkSync(this.lockFile);
        }
    },
    isLocked() {
        return fs.existsSync(this.lockFile);
    }
};
