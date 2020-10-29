import main from './app';

// the entry point for the server application
(() => {
    main().catch((e) => {
        console.log(e);
    });
})();
