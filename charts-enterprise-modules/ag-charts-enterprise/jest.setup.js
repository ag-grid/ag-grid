jest.mock('./src/license/licenseManager');

module.exports = async function () {
    process.env.TZ = 'Europe/London';
};
