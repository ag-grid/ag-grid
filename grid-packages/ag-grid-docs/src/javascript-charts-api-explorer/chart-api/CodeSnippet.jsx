
import React from 'react';
import * as Prism from "prismjs";
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import "prismjs/components/prism-jsx";
import './prism.css';

export class CodeSnippet extends React.Component {
    constructor(props) {
        super(props);
        this.ref = React.createRef();
    }

    componentDidMount() {
        this.highlight();
    }

    componentDidUpdate() {
        this.highlight();
    }

    highlight = () => {
        if (this.ref && this.ref.current) {
            Prism.highlightElement(this.ref.current);
        }
    };

    render() {
        const { lines, plugins, language = 'js' } = this.props;

        return (
            <pre className={!plugins ? "" : plugins.join(" ")}>
                <code ref={this.ref} className={`language-${language}`}>
                    {lines.join('\n')}
                </code>
            </pre>
        );
    }
}
