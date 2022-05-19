import Utility from "util";

export const Parse = (string: string) => {
    console.debug("[Debug] Parsing URI", Utility.inspect(string, { colors: true }), "Partial(s) ...");

    const data: { match : RegExpExecArray | null, groups: {[$: string]: string} | undefined | null } = { match: null, groups: {} };
    const expression = new RegExp("(?<hostname>(git@|https://)([\\w\\.@]+)(/|:))(?<namespace>[\\w,\\-,\\_]+)/(?<name>[\\w,\\-,\\_]+)(.git)?((/)?)", "igm");

    const groups = expression.exec(string)!.groups;

    (groups) && Reflect.set(data, "groups", groups);

    (groups) && console.debug(" - Hostname", "(" + Utility.inspect(groups["hostname"], { colors: true }) + ")");
    (groups) && console.debug(" - Namespace", "(" + Utility.inspect(groups["namespace"], { colors: true }) + ")");
    (groups) && console.debug(" - Repository", "(" + Utility.inspect(groups["name"], { colors: true }) + ")");

    process.stdout.write("\n");

    return data.groups as { hostname: string; namespace: string; name: string };
};

export default Parse;