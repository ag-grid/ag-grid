"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rule = void 0;
const Lint = require("tslint");
class Rule extends Lint.Rules.AbstractRule {
    apply(sourceFile) {
        return this.applyWithWalker(new NoImportsWalker(sourceFile, this.getOptions()));
    }
}
exports.Rule = Rule;
Rule.FAILURE_STRING = "Relative import of AG Grid Community";
// The walker takes care of all the work.
class NoImportsWalker extends Lint.RuleWalker {
    visitImportDeclaration(node) {
        if (node.getText().indexOf('../ag-grid-community') !== -1) {
            this.addFailureAt(node.getStart(), node.getWidth(), Rule.FAILURE_STRING);
        }
        // call the base version of this visitor to actually parse this node
        super.visitImportDeclaration(node);
    }
}
