#!/usr/bin/env node

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
    {
        names: ['verbose', 'v'],
        type: 'bool',
        help: 'Verbose output. This will log all debug messages.',
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
        names: ['repo', 'r'],
        type: 'string',
        env: 'REPO_SOURCE',
        help: 'Github repository name that will be imported to Glitch.',
        helpArg: '<user name/project name>',
    },
    ...commonOpts,
];

interface SubCommand {
    subcommand: string;
    options: ParserConfiguration['options'];
    help: string;
}

const scriptArgs: SubCommand[] = [
    {
        subcommand: 'github',
        options: importGhOpts,
        help: '',
    },
    {
        subcommand: 'from-local',
        options: uploadLocalOpts,
        help: '',
    },
];

const checkToolMode = () => {
    const userArg = process.argv.slice(2)[0];

    if (!userArg) {
        return {
            subcommand: '',
            options: defaultOptions,
            help: '',
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
    // print the help message if the user passes the help flag or nothing
    if (opts.help || opts._order.length === 0) {
        const help = parser.help({ includeEnv: true }).trimRight();
        const currentCommand = mode.subcommand || '[from-local | github]';
        //const commandList =
        console.log(`usage: glitch-deploy-tool ${currentCommand} [OPTIONS]\noptions:\n${help}\n`);
        process.exit(0);
    }

    // print the tool version
    if (opts.version) {
        //todo: dynamically parse the version
        console.log(`glitch-deploy-tool version 1.0.0-alpha`);
        process.exit(0);
    }

    //todo: right now we are string comparing user sub-commands. This is very ugly.
    // change this to implement an interface or some other dynamic way of executing commands
    const toolType = opts._args[0];
    if (toolType === 'from-local') {
        const sourceRepo = opts.remote;
        const targetFolder = opts.path;
        const showDebug = opts.verbose;
        if (typeof sourceRepo !== 'string') {
            throw new Error('Invalid repository');
        }
        await Deployer.importFromFolder(sourceRepo, targetFolder, showDebug);
    } else if (toolType === 'github') {
        const glitchID = opts.glitch_id;
        const glitchToken = opts.token;
        const sourceRepo = opts.repo;
        const targetFolder = opts.path;
        if (typeof glitchID !== 'string') {
            throw new Error('Invalid ID');
        }
        await Deployer.importFromGithub(glitchToken, glitchID, sourceRepo, targetFolder);
    }

    process.exit(0);
})().catch((err) => {
    console.error('error: ' + err.message);
    process.exit(1);
});
