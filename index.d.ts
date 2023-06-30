export declare type ArgvValue = true | string | string[]
export declare type AppendOption = ArgvValue | Record<string, any>
export declare const enum PipeWay {
    always = "always",
    ignore = "ignore"
}
export declare const enum AppendReplace {
    append = "append",
    replace = "replace",
    ignore = "ignore"
}
export declare interface Argv extends Map<string, ArgvValue> {
    obj(): Record<string, ArgvValue>;
    object(): Record<string, ArgvValue>;
    array(): [string, ArgvValue][];
    pipe(key: string, callback: (value: ArgvValue) => void, type = PipeWay.ignore): Argv;
    commit(unpipedCallback?: (keys: string[]) => boolean): void
    append(option: AppendOption, type: AppendReplace): Argv;
}
export default function createArgv(arguments?: string | string[]): Argv;