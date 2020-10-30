#!/usr/bin/env ts-node

/**
 * everything in the cli folder should be isolated from the reset of the code.
 * the src/index.ts is meant to export the project classes that are used in this tool for developers.
 * everything in the cli folder is meant for functions directly executed by the user via node.
 */
import dashdash, { ParserConfiguration } from 'dashdash';
import * as Deployer from './deploy';

const defaultOptions: ParserConfiguration['options'] = [
    {
        group: 'Tool Information',
    },
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
];

const commonOpts: ParserConfiguration['options'] = [
    {
        names: ['path', 'p'],
        type: 'string',
        help: 'Folder to upload to Glitch',
        completionType: 'file',
        helpArg: 'PATH',
    },
    {
        names: ['verbose', 'v'],
        type: 'bool',
        help: 'Verbose output. This will log all debug messages.',
    },
    ...defaultOptions,
];

const uploadLocalOpts: ParserConfiguration['options'] = [
    {
        group: 'Upload Local Folder Options',
    },
    {
        names: ['remote', 'r'],
        type: 'string',
        env: 'REPO_SOURCE',
        help: "Glitch project repository's remote URL",
        helpArg: '<glitch git url>',
    },
    ...commonOpts,
];

const importGhOpts: ParserConfiguration['options'] = [
    {
        group: 'Import from Github Options',
    },
    {
        names: ['token', 't'],
        type: 'string',
        env: 'GLITCH_USER_TOKEN',
        help: 'Glitch user API token used to access the account.',
        helpArg: '<glitch user token>',
    },
    {
        names: ['glitch-id', 'i'],
        type: 'string',
        env: 'GLITCH_PROJ_ID',
        help: 'Glitch project ID that will',
        helpArg: '<glitch user token>',
    },
    {
        names: ['github', 'g'],
        type: 'string',
        env: 'REPO_SOURCE',
        help: 'Github repository name that will be imported to Glitch.',
        helpArg: '<user name/project name>',
    },
    ...commonOpts,
];

const scriptArgs = [
    {
        subcommand: 'github',
        options: importGhOpts,
    },
    {
        subcommand: 'local',
        options: uploadLocalOpts,
    },
];

const checkToolMode = () => {
    const userArg = process.argv.slice(2)[0];

    if (!userArg) {
        return {
            subcommand: '--help',
            options: defaultOptions,
        };
    }
    const command = scriptArgs.find((i) => i.subcommand === userArg);
    if (typeof command === 'undefined') throw new Error('Invalid argument ' + userArg);

    return command;
};

(async () => {
    const mode = checkToolMode();
    const parser = dashdash.createParser({ options: mode.options });
    const opts = parser.parse(process.argv);

    console.log(opts._order);

    // print the help message if the user passes the help flag or nothing
    if (opts.help || opts._order.length === 0) {
        const help = parser.help({ includeEnv: true }).trimRight();
        console.log(`usage: glitch-deploy-tool ${mode.subcommand} [OPTIONS]\noptions:\n${help}`);
        process.exit(0);
    }

    // print the tool version
    if (opts.version) {
        console.log(`glitch-deploy-tool version `);
        process.exit(0);
    }

    const toolType = opts._args[0];
    if (toolType === 'local') {
        const sourceRepo = process.env.REPO_SOURCE || opts._order.find((i) => i.name === 'repo')?.value;
        if (typeof sourceRepo !== 'string') {
            throw new Error('Invalid repository');
        }

        //await Deployer.importFromFolder(sourceRepo);
    }

    process.exit(0);
})().catch((err) => {
    console.error('error: ' + err.message);
    process.exit(1);
});
