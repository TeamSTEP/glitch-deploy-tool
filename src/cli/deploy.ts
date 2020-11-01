import { GlitchGit, GlitchProject } from '../models';

export const importFromFolder = async (repoUrl: string, targetPath?: string, debugMessage?: boolean) => {
    const glitchRepo = new GlitchGit(repoUrl, debugMessage);

    try {
        await glitchRepo.publishFilesToGlitch(targetPath);
    } catch (e) {
        glitchRepo.cleanGitInstance();
        throw e;
    }

    console.log('successfully imported projects from ' + targetPath || process.cwd());
};

export const importFromGithub = async (token: string, projId: string, repo: string, path?: string) => {
    if (typeof projId === 'undefined' || typeof token === 'undefined') {
        throw new Error('the required environment variables were not provided');
    }
    const glitchProj = new GlitchProject(token, projId);

    const res = await glitchProj.importFromGithub(repo, path);

    if (res.status !== 200) {
        throw new Error('Failed to import project');
    }
    console.log('successfully imported project ' + repo);
};
