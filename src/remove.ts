import FS from "fs";
import TTY from "tty";
import Path from "path";
import Utility from "util";

const Colors = TTY.isatty(process.stdin.fd);

/***
 * Promisified Version of {@link FS.rm}
 * ---
 *
 * With additional logging and recursive file evaluation ...
 *
 * <br/>
 *
 * Asynchronously, recursively deletes the entire directory structure from target,
 * including subdirectories and files.
 *
 * @experimental
 *
 * @param {string} target
 * @returns {Promise<void>}
 *
 * @constructor
 *
 */
export const Remove = async (target: string) => {
    const valid = (descriptor: string = target) => {
        return new Promise( (resolve) => FS.realpath( descriptor, { encoding: "utf-8" }, (exception, path) => {
            resolve( ( exception ) ? false : !!( path ) );
        } ) );
    };

    const descriptors = async (location: string = target) => {
        return new Promise((resolve) => {
            FS.readdir( location, {
                encoding: "utf-8",
                withFileTypes: true
            }, (exception: Exception, files: FS.Dirent[]) => {
                if (exception) throw exception;

                resolve( remap(files) );
            } );
        }) as Promise<Descriptor[]>;

        function remap (files: FS.Dirent[]) {
            return files.map( (descriptor) => {
                const canonical = Path.join( Path.resolve( location, descriptor.name ) );

                return {
                    name: descriptor.name,
                    path: canonical,
                    properties: {
                        file: descriptor.isFile(),
                        directory: descriptor.isDirectory(),
                        socket: descriptor.isSocket(),
                        symbolic: descriptor.isSymbolicLink()
                    }
                };
            } );
        };
    };

    const clean = async (descriptor: Descriptor) => {
        const recurse = descriptor.properties.directory;

        /// If the given file-descriptor is indeed a directory
        switch (true) {
            case ( ( recurse ) ): {
                const handlers = await descriptors(descriptor.path);
                for await (const handler of handlers) {
                    await clean(handler);
                }

                break;
            }

            default: await new Promise(async (resolve, reject) => {
                const existence = await valid(descriptor.path);

                console.debug("[Debug] Removing", Utility.inspect(descriptor.path, { colors: Colors }), "...");

                (existence) && FS.unlink(descriptor.path, async (exception) => {
                    if (exception) {
                        (exception.code = "EPERM") && await new Promise((resolve) => {
                            FS.rm(descriptor.path, { force: true }, resolve)
                        });
                    } else (exception !== null) && console.warn("[Warning]", exception);

                    resolve(null);
                });
            });
        }
    };

    const finalize = async () => {
        void await new Promise((resolve) => {
            FS.rm(target, { force: true, recursive: true }, (exception) => {
                if (exception) throw exception;

                resolve(null);
            });
        });
    };

    try {
        if (await valid()) {
            console.debug(" - Pre-Existing Directory Found");
            process.stdout.write("\n");

            console.debug("[Debug]", "Removing", Utility.inspect(Path.resolve(target), { colors: Colors }), "...");
            const targets = await descriptors();
            for await (const target of targets) {
                await clean(target);
            }

            await finalize();
        }
    } catch ( error ) {
        throw error;
    }

    process.stdout.write("\n");

    return;
};

export type Exception = NodeJS.ErrnoException | null;

export type Descriptor = {
    name: string;
    path: string;
    properties: {
        file: boolean;
        directory: boolean;
        socket: boolean;
        symbolic: boolean;
    };
};

export default Remove;
