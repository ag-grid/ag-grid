// @ts-nocheck
/**
 * Example jscodeshift transformer. Simply reverses the names of all
 * identifiers.
 */
import type { FileInfo, API, Options } from 'jscodeshift';

export default function transform(file: FileInfo, api: API, options?: Options): string | undefined {
    const j = api.jscodeshift;
    const root = j(file.source);

    function replaceWithComments(path, newNode) {
        if (path.node?.comments) {
            newNode.comments = path.node.comments;
        }
        j(path).replaceWith(newNode);
    }

    const changedProps: string[] = [];
    root.find(j.ClassDeclaration).forEach((path) => {
        path.node.body.body.forEach((member) => {
            if (member.type === 'ClassMethod' || member.type === 'ClassProperty') {
                if (member.accessibility === 'private') {
                    if (member.decorators?.length > 0) {
                    } else {
                        j(member)
                            .find(j.Identifier)
                            .forEach((i) => {
                                if (i.node.name === member.key.name) {
                                    // it its not static
                                    if (!member.static) {
                                        j(i).replaceWith((p) => j.identifier(`#${p.node.name}`));
                                        member.accessibility = null;
                                        changedProps.push(member.key.name.replace('#', ''));
                                    }
                                }
                            });
                    }
                }
            }
        });
    });
    root.find(j.MemberExpression).forEach((path) => {
        if (path.node.property.type === 'Identifier' && path.node.object.type === 'ThisExpression') {
            if (!changedProps.includes(path.node.property.name)) {
                return;
            }

            const newMemberExpression = j.memberExpression(
                path.node.object,
                j.identifier(`#${path.node.property.name}`)
            );
            replaceWithComments(path, newMemberExpression);
        }
    });

    return root.toSource();
}
