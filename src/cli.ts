export const Arguments = process.argv.splice( 2 );

export const Debug = Arguments.includes( "--debug" ) ?? null;

export const Spawn = (Arguments.includes( "--spawn" ) || Arguments.includes( "-s" )) ?? null;
export const Execute = (Arguments.includes( "--execute" ) || Arguments.includes( "--exec" ) || Arguments.includes( "-e")) ?? null;
export const Wrapper = (Arguments.includes( "--wrapper" ) || Arguments.includes( "--wrap" ) || Arguments.includes( "-w")) ?? null;
export const Shell = (Arguments.includes( "--shell" ) || Arguments.includes( "--interactive" ) || Arguments.includes( "-i")) ?? null;

export const CLI = { Spawn, Execute, Wrapper, Shell };

export default CLI;