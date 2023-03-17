"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const relationshipFactory = {
    getTemplate(config) {
        const { Id, Type, Target } = config;
        return {
            name: "Relationship",
            properties: {
                rawMap: {
                    Id,
                    Type,
                    Target
                }
            }
        };
    }
};
exports.default = relationshipFactory;
