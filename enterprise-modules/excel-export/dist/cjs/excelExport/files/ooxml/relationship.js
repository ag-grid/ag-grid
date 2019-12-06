"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var relationshipFactory = {
    getTemplate: function (config) {
        var Id = config.Id, Type = config.Type, Target = config.Target;
        return {
            name: "Relationship",
            properties: {
                rawMap: {
                    Id: Id,
                    Type: Type,
                    Target: Target
                }
            }
        };
    }
};
exports.default = relationshipFactory;
//# sourceMappingURL=relationship.js.map