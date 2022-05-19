const Main = async () => {
    const repository = "https://github.com/iac-factory/git-clone.git";

    void await ( async () => new Promise( async (resolve, reject) => {
        process.stdout.write( "Importing Dependencies ..." + "\n" );

        const { CLI } = await import("./cli");

        const { Wrapper } = await import("./clone");
        const { Execute } = await import("./clone");
        const { Spawn } = await import("./clone");
        const { Shell } = await import("./clone");

        const { Remove } = await import("./remove");

        const state = { error: false, exception: {}, results: { spawn: false, exec: false, shell: false, execFile: false } };

        try {
            (CLI.Spawn) && await Spawn(repository, "test");
            state.results.spawn = true;

            (CLI.Execute) && await Execute(repository, "test");
            state.results.execFile = true;

            (CLI.Wrapper) && await Wrapper(repository, "test");
            state.results.exec = true;

            (CLI.Shell) && await Shell(repository, "test");
            state.results.shell = true;
        } catch (error) {
            state.error = true;
            Reflect.set(state, "exception", error);
        } finally {
            console.debug("[Debug] Cleaning Testing Directory ...");

            await Remove("test");
        }

        console.log(state.results);

        (state.error) && reject(state.exception);
        (state.error) || resolve(true);
    } ) )();
};

void (async () => Main())();

export default Main;

export { Main };
