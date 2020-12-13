#!/usr/bin/env ts-node
//note: this cli script is for testing and being executed directly from source

import path from 'path';
import { GlitchGit } from '../src/models';

const gitConfigTest = async () => {
    const source = process.env.REPO_SOURCE;

    if (typeof source === 'undefined') {
        throw new Error('target repository has not been provided');
    }

    // the folder that contains the deploy files
    const targetFolder = 'dist';

    const glitchRepo = new GlitchGit(source, true, { name: 'Hello World', email: 'info@deploy.me' });

    const gitConfigList = await glitchRepo.git.listConfig();
    const config = {
        name: gitConfigList.all['user.name'],
        email: gitConfigList.all['user.email'],
    };

    // obtain the first entry of the user info if there are multiple values
    const user = {
        name: Array.isArray(config.name) ? config.name[0] : config.name,
        email: Array.isArray(config.email) ? config.email[0] : config.email,
    };

    const author = user.email.startsWith('none') || user.name.startsWith('none') ? null : user;

    console.log(author);

    await glitchRepo.publishFilesToGlitch(targetFolder);
};

// script entry point
(async () => {
    throw new Error('Script not implemented!');
    //await gitConfigTest();

    process.exit(0);
})().catch((err) => {
    console.error(err);
    process.exit(1);
});
