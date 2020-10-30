#!/usr/bin/env ts-node
//note: this cli script is for testing and being executed directly from source

import path from 'path';
import { GlitchGit, GlitchProject } from '../src/models';

const gitPushTest = async () => {
    const source = process.env.REPO_SOURCE;

    if (typeof source === 'undefined') {
        throw new Error('target repository has not been provided');
    }

    // the folder to where it will copy things
    const targetFolder = 'target';

    const glitchRepo = new GlitchGit(source, true);

    await glitchRepo.publishFilesToGlitch(path.join(__dirname, targetFolder));
};

const gitImportTest = async () => {
    const projId = process.env.GLITCH_PROJ_ID;
    const token = process.env.GLITCH_USER_TOKEN;

    if (typeof projId === 'undefined' || typeof token === 'undefined') {
        throw new Error('the required environment variables were not provided');
    }

    const sourceRepo = 'staketechnologies/lockdrop-ui';
    const glitchProj = new GlitchProject(token, projId);

    const res = await glitchProj.importFromGithub(sourceRepo, 'public');

    if (res.status !== 200) {
        throw new Error('Failed to import project');
    }
    console.log('successfully imported project ' + sourceRepo);
};

// script entry point
(async () => {
    throw new Error('Script not implemented!');
    //await gitPushTest();
    //await gitImportTest();

    //process.exit(0);
})().catch((err) => {
    console.error(err);
    process.exit(1);
});
