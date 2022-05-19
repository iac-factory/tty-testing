import TTY from "tty";
import Path from "path";
import Utility from "util";
import Subprocess from "child_process";

import * as ANSI from "ansi-colors";

import { Parse } from "./expression";
import { Remove, Exception } from "./remove";

const Colors = TTY.isatty( process.stdin.fd );
const Color: {
    theme: Function,
    enable: Function,
    disable: Function,
    danger: Function,
    dark: Function,
    disabled: Function,
    em: Function,
    heading: Function,
    info: Function,
    muted: Function,
    primary: Function,
    strong: Function,
    success: Function,
    underline: Function,
    warning: Function
} & any = ANSI.create();

Color.theme( {
    danger: Color.red,
    dark: Color.dim.gray,
    disabled: Color.gray,
    em: Color.italic,
    heading: Color.bold.underline,
    info: Color.cyan,
    muted: Color.dim,
    primary: Color.blue,
    strong: Color.bold,
    success: Color.green,
    underline: Color.underline,
    warning: Color.yellow
} );

Reflect.set(Color, "enabled", Colors);

/***
 * `git` Repository Clone Command
 * ---
 *
 * @param repository
 * @param directory
 * @param branch
 *
 * @returns {Promise<void>}
 *
 * @example
 * const Main = async () => {
 *     void await ( async () => new Promise( async (resolve) => {
 *         process.stdout.write( "Importing Dependencies ..." + "\n" );
 *
 *         const { Clone } = await import("./clone");
 *
 *         await Clone("https://github.com/iac-factory/git-clone.git");
 *
 *         resolve(true);
 *     } ) )();
 * };
 *
 * void (async () => Main())();
 *
 * export default Main;
 *
 * export { Main };
 */
export const Spawn = async (repository: string, directory?: string, branch?: string): Promise<boolean> => {
    console.debug( "Initializing (Spawn) VCS Clone Command ..." );
    process.stdout.write( "\n" );

    const attributes = Parse( repository );

    directory = ( directory ) ? directory : attributes.name;

    console.debug( "[Debug] Evaluating Local File-System ..." );

    await Remove( directory );

    const options = (): readonly [ string[] ] => {
        console.debug( "[Debug] Generating Command Partial(s) ..." );
        process.stdout.write( "\n" );

        const partials = ( branch ) ? [
            "clone", repository, "--branch", branch
        ] : [ "clone", repository ];

        if ( directory != null ) {
            partials.push( Path.relative( process.cwd(), directory ) as string );
        }

        const lexical = partials.join( " " )
            .replace( "$", "" )
            .replace( "{", "" )
            .replace( "}", "" )
            .replace( "(", "" )
            .replace( ")", "" );

        return [ lexical.split( " " ) ];
    };

    const configuration = options();

    return new Promise( (resolve, reject) => {
        console.debug( "[Debug] Spawning Non-Interactive \"git\" Clone Process ..." );
        console.debug( " - " + Utility.inspect( configuration.flat(), {
            colors: Colors,
            compact: true,
            maxArrayLength: Infinity
        } ) );

        process.stdout.write( "\n" );

        const subprocess = Subprocess.spawn( "git", ... configuration, {
            shell: false,
            env: process.env,
            stdio: "ignore"
        } );

        subprocess.stdout?.on( "data", (chunk) => {
            const buffer = chunk.toString( "utf-8", 0, chunk.length );

            process.stdout.write( buffer );
        } );

        subprocess.stderr?.on( "data", (chunk) => {
            console.error( chunk.toString() );
        } );

        subprocess.on( "message", (message, handle) => {
            console.log( message, handle );
        } );

        subprocess.on( "error", (error) => {
            console.warn( error );

            reject( error );
        } );

        subprocess.on( "exit", (code, handle) => {
            ( code !== 0 ) && reject( {
                code,
                handle
            } );
        } );

        subprocess.on( "close", (code, handle) => {
            ( code !== 0 ) && reject( {
                code,
                handle
            } );

            console.log( Color.bold.magenta("Spawn"), "-", "Successfully Cloned Repository" );
            console.log( "  - Source: %s", repository );
            console.log( "  - Directory: %s", Color.green( Path.relative( process.cwd(), directory! ) ) );
            console.log( "  - Branch: %s", ( branch ) ? branch : Color.yellow( "HEAD" ) );

            process.stdout.write( "\n" );
            process.stdout.write("-".repeat(process?.stdout?.columns));
            process.stdout.write( "\n" + "\n" );

            resolve( true );
        } );
    } );
};

/***
 * `git` Repository Clone Command
 * ---
 *
 * @param repository
 * @param directory
 * @param branch
 *
 * @returns {Promise<void>}
 *
 * @example
 * const Main = async () => {
 *     void await ( async () => new Promise( async (resolve) => {
 *         process.stdout.write( "Importing Dependencies ..." + "\n" );
 *
 *         const { Execute } = await import("./clone");
 *
 *         await Execute("https://github.com/iac-factory/git-clone.git");
 *
 *         resolve(true);
 *     } ) )();
 * };
 *
 * void (async () => Main())();
 *
 * export default Main;
 *
 * export { Main };
 */
export const Execute = async (repository: string, directory?: string, branch?: string) => {
    console.debug( "Initializing (Execute) VCS Clone Command" );

    process.stdout.write( "\n" );

    const attributes = Parse( repository );

    directory = ( directory ) ? directory : attributes.name;

    console.debug( "[Debug] Ensuring of Clean File-System ..." );

    await Remove( directory );

    console.debug( "[Debug] Running Promisify on { execFile } ..." );

    const command = Utility.promisify( Subprocess.execFile );

    const options = (): readonly string[] => {
        console.debug( " - Generating Command ..." );

        const partials = ( branch ) ? [
            "clone", repository, "--branch", branch
        ] : [ "clone", repository ];

        console.debug( " - Determining Local Directory ..." );

        if ( directory != null ) {
            partials.push( directory as string );
        }

        console.debug( " - Replacing Shell Escapes ..." );

        const lexical = partials.join( " " )
            .replace( "$", "" )
            .replace( "{", "" )
            .replace( "}", "" )
            .replace( "(", "" )
            .replace( ")", "" );

        process.stdout.write( "\n" );

        return lexical.split( " " );
    };

    void await command( "git", options(), {
        env: process.env,
        cwd: process.cwd(),
        timeout: 30 * 1000,
        shell: false
    } );

    console.log( Color.bold.magenta("Execute"), "-", "Successfully Cloned Repository" );
    console.log( "  - Source: %s", repository );
    console.log( "  - Directory: %s", Color.green( Path.relative( process.cwd(), directory! ) ) );
    console.log( "  - Branch: %s", ( branch ) ? branch : Color.yellow( "HEAD" ) );

    process.stdout.write( "\n" );
    process.stdout.write("-".repeat(process?.stdout?.columns));
    process.stdout.write( "\n" + "\n" );
};

/***
 * `git` Repository Clone Command
 * ---
 *
 * @param repository
 * @param directory
 * @param branch
 *
 * @returns {Promise<void>}
 *
 * @example
 * const Main = async () => {
 *     void await ( async () => new Promise( async (resolve) => {
 *         process.stdout.write( "Importing Dependencies ..." + "\n" );
 *
 *         const { Execute } = await import("./clone");
 *
 *         await Execute("https://github.com/iac-factory/git-clone.git");
 *
 *         resolve(true);
 *     } ) )();
 * };
 *
 * void (async () => Main())();
 *
 * export default Main;
 *
 * export { Main };
 */
export const Shell = async (repository: string, directory?: string, branch?: string) => {
    console.debug( "Initializing (Shell) VCS Clone Command" );

    process.stdout.write( "\n" );

    const attributes = Parse( repository );

    directory = ( directory ) ? directory : attributes.name;

    console.debug( "[Debug] Ensuring of Clean File-System ..." );

    await Remove( directory );

    console.debug( "[Debug] Running Promisify on { execFile } ..." );

    const command = Utility.promisify( Subprocess.execFile );

    const options = (): readonly string[] => {
        console.debug( " - Generating Command ..." );

        const partials = ( branch ) ? [
            "clone", repository, "--branch", branch
        ] : [ "clone", repository ];

        console.debug( " - Determining Local Directory ..." );

        if ( directory != null ) {
            partials.push( directory as string );
        }

        console.debug( " - Replacing Shell Escapes ..." );

        const lexical = partials.join( " " )
            .replace( "$", "" )
            .replace( "{", "" )
            .replace( "}", "" )
            .replace( "(", "" )
            .replace( ")", "" );

        process.stdout.write( "\n" );

        return lexical.split( " " );
    };

    void await command( "git", options(), {
        env: process.env,
        cwd: process.cwd(),
        timeout: 30 * 1000,
        shell: true
    } )

    console.log( Color.bold.magenta("Shell"), "-", "Successfully Cloned Repository" );
    console.log( "  - Source: %s", repository );
    console.log( "  - Directory: %s", Color.green( Path.relative( process.cwd(), directory! ) ) );
    console.log( "  - Branch: %s", ( branch ) ? branch : Color.yellow( "HEAD" ) );

    process.stdout.write( "\n" );
    process.stdout.write("-".repeat(process?.stdout?.columns));
    process.stdout.write( "\n" + "\n" );
};

/***
 * `git` Repository Clone Command
 * ---
 *
 * @param repository
 * @param directory
 * @param branch
 *
 * @returns {Promise<void>}
 *
 * @example
 * const Main = async () => {
 *     void await ( async () => new Promise( async (resolve) => {
 *         process.stdout.write( "Importing Dependencies ..." + "\n" );
 *
 *         const { Execute } = await import("./clone");
 *
 *         await Execute("https://github.com/iac-factory/git-clone.git");
 *
 *         resolve(true);
 *     } ) )();
 * };
 *
 * void (async () => Main())();
 *
 * export default Main;
 *
 * export { Main };
 */
export const Wrapper = async (repository: string, directory?: string, branch?: string) => {
    console.debug( "Initializing (Wrapper) VCS Clone Command" );

    process.stdout.write( "\n" );

    const attributes = Parse( repository );

    directory = ( directory ) ? directory : attributes.name;

    console.debug( "[Debug] Ensuring of Clean File-System ..." );

    await Remove( directory );

    console.debug( "[Debug] Running Promisify on { exec } ..." );

    const command = Subprocess.execFile;

    const options = (): readonly string[] => {
        console.debug( " - Generating Command ..." );

        const partials = ( branch ) ? [
            "clone", repository, "--branch", branch
        ] : [ "clone", repository ];

        console.debug( " - Determining Local Directory ..." );

        if ( directory != null ) {
            partials.push( directory as string );
        }

        console.debug( " - Replacing Shell Escapes ..." );

        const lexical = partials.join( " " )
            .replace( "$", "" )
            .replace( "{", "" )
            .replace( "}", "" )
            .replace( "(", "" )
            .replace( ")", "" );

        process.stdout.write( "\n" );

        return lexical.split( " " );
    };

    void await new Promise((resolve) => {
        command( "git", [... options()], (error, stdout, stderr) => {
            if (error) throw error;

            resolve(null);
        });
    });

    console.log( Color.bold.magenta("Wrapper"), "-", "Successfully Cloned Repository" );
    console.log( "  - Source: %s", repository );
    console.log( "  - Directory: %s", Color.green( Path.relative( process.cwd(), directory! ) ) );
    console.log( "  - Branch: %s", ( branch ) ? branch : Color.yellow( "HEAD" ) );

    process.stdout.write( "\n" );
    process.stdout.write("-".repeat(process?.stdout?.columns));
    process.stdout.write( "\n" + "\n" );
};

export default Spawn;

/***
 * @internal
 *
 * @example
 * $ ts-node "$(dirname "$(npm root)")/src/clone.ts" --debug --single
 *
 * @example
 * $ ts-node "$(dirname "$(npm root)")/src/clone.ts" --debug --multiple
 */

/* --- {{ Local }} --- */

void ( async () => {
    /***
     * Test-Case - Single Clone
     * @returns {Promise<Array<PromiseSettledResult<Awaited<Promise<boolean>>>>>}
     */
    const single = async () => {
        const example = "https://github.com/iac-factory/git-clone.git";

        const test = async (name: string = example) => {
            return Spawn( name, "test" );
        };

        const collection = [
            () => test()
        ];

        return await Promise.allSettled( collection.map( (callable) => callable() ) );
    };

    /***
     * Test-Case - Single -> Many (Directories) Clone
     * @returns {Promise<Array<PromiseSettledResult<Awaited<Promise<boolean>>>>>}
     */
    const multiple = async () => {
        const example: [ string, string ][] = [
            [ "https://github.com/iac-factory/git-clone.git", "test-1" ],
            [ "https://github.com/iac-factory/git-clone.git", "test-2" ],
            [ "https://github.com/iac-factory/git-clone.git", "test-3" ]
        ];

        const test = async (name: string, target: string) => {
            return Spawn( name, target );
        };

        const collection = example.map( (tuple) => {
            return () => test( tuple[ 0 ], Path.join( process.cwd(), "test", tuple[ 1 ] ) );
        } );

        return Promise.allSettled( collection.map( (callable) => callable() ) );
    };

    const evaluate = async () => {
        for await ( const argument of process.argv ) {
            switch ( argument ) {
                case "--single": {
                    await single();
                    break;
                }

                case "--multiple":
                    await multiple();
                    break;
            }
        }
    };

    ( process.argv.includes( "--debug" ) ) && await evaluate();
} )();

/* --- {% Local %} --- */
