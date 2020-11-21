#!/usr/bin/env node

/**
 * everything in the cli folder should be isolated from the reset of the code.
 * the src/index.ts is meant to export the project classes that are used in this tool for developers.
 * everything in the cli folder is meant for functions directly executed by the user via node.
 */
import dashdash from 'dashdash';
import * as Deployer from './deploy';
import scriptArgs, { defaultOptions } from './command';

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
