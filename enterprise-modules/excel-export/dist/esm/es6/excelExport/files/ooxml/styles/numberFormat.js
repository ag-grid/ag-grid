const numberFormatFactory = {
    getTemplate(numberFormat) {
        const { formatCode, numFmtId } = numberFormat;
        return {
            name: "numFmt",
            properties: {
                rawMap: {
                    formatCode,
                    numFmtId
                }
            }
        };
    }
};
export default numberFormatFactory;
