import stylelint from 'stylelint';

const {
    createPlugin,
    utils: { report, ruleMessages, validateOptions },
} = stylelint;

const ruleName = 'ag/no-block-disables';

const messages = ruleMessages(ruleName, {
    rejected: () =>
        'Block and whole-file disable comments are not allowed. Use "stylelint-disable-next-line" with a justification on each line that needs it.',
});

const meta = {
    url: 'https://github.com/ag-grid/ag-grid',
};

// Matches `stylelint-disable` but not `stylelint-disable-line` or `stylelint-disable-next-line`
const BLOCK_DISABLE = /^stylelint-disable(?:\s|$)/;

const ruleFunction = (primary) => {
    return (root, result) => {
        const validOptions = validateOptions(result, ruleName, {
            actual: primary,
        });

        if (!validOptions) {
            return;
        }

        root.walkComments((comment) => {
            if (BLOCK_DISABLE.test(comment.text)) {
                report({
                    message: messages.rejected(),
                    node: comment,
                    result,
                    ruleName,
                });
            }
        });
    };
};

ruleFunction.ruleName = ruleName;
ruleFunction.messages = messages;
ruleFunction.meta = meta;

export default createPlugin(ruleName, ruleFunction);
