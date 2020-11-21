import { ParserConfiguration } from 'dashdash';

export const defaultOptions: ParserConfiguration['options'] = [
    {
        group: 'Tool Information',
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

export default scriptArgs;
