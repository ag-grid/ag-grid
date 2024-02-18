var protectionFactory = {
    getTemplate: function (protection) {
        var locked = protection.protected === false ? 0 : 1;
        var hidden = protection.hideFormula === true ? 1 : 0;
        return {
            name: 'protection',
            properties: {
                rawMap: {
                    hidden: hidden,
                    locked: locked
                }
            }
        };
    }
};
export default protectionFactory;
