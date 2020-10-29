// everything in the cli folder should be isolated from the reset of the code.
// the src/index.ts is meant to export the project classes that are used in this tool for developers.
// everything in the cli folder is meant for functions directly executed by the user via node.

// CLI tool entry point
(async () => {
    console.log('Hello world');

    process.exit(0);
})().catch((err) => {
    console.error(err);
    process.exit(1);
});
