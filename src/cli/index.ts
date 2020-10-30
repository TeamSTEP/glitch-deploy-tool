#!/usr/bin/env ts-node

/**
 * everything in the cli folder should be isolated from the reset of the code.
 * the src/index.ts is meant to export the project classes that are used in this tool for developers.
 * everything in the cli folder is meant for functions directly executed by the user via node.
 */
import dashdash, { ParserConfiguration } from 'dashdash';

interface ScriptArgument {
    name: string;
    options: ParserConfiguration['options'];
}

const scriptArgs = [{ name: 'push-files', type: 'string' }];

const options: ParserConfiguration['options'] = [
    {
        name: 'version',
        type: 'bool',
        help: 'Print tool version and exit.',
    },
    {
        names: ['help', 'h'],
        type: 'bool',
        help: 'Print this help and exit.',
    },
    {
        names: ['verbose', 'v'],
        type: 'arrayOfBool',
        help: 'Verbose output. Use multiple times for more verbose.',
    },
    {
        names: ['repo', 'r'],
        type: 'string',
        help: 'Repository to clone',
        env: 'REPO_SOURCE',
    },
    {
        names: ['file', 'f'],
        type: 'string',
        help: 'File to process',
        helpArg: 'FILE',
    },
];

// CLI tool entry point
(async () => {
    const parser = dashdash.createParser({ options: options });
    const opts = parser.parse(process.argv);
    const args = opts._args;

    console.log(args);
    console.log(opts._order);

    process.exit(0);
})().catch((err) => {
    console.error('error: ' + err.message);
    process.exit(1);
});
