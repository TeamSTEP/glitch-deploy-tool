import path from 'path';
import { GlitchGit } from '../src/models';

const REPO_SOURCE = process.env.REPO_SOURCE;

//todo: make this part read user params
// the folder to where it will copy things
const TARGET_FOLDER = 'target';

// script entry point
(async () => {
    if (typeof REPO_SOURCE === 'undefined') {
        throw new Error('target repository has not been provided');
    }

    //await pushToGlitch();

    const glitchRepo = new GlitchGit(REPO_SOURCE, true);

    await glitchRepo.publishFilesToGlitch(path.join(__dirname, TARGET_FOLDER));

    process.exit(0);
})().catch((err) => {
    console.error(err);
    process.exit(1);
});
