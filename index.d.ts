export declare type ArgvValue = true | string | string[];
export declare type AppendOption = string | string[] | Record<string, any>;
export declare type PipeWay = "ignore" | "always" | "break";
export declare type AppendType = "append" | "replace" | "ignore";
export declare interface Argv extends Map<string, ArgvValue> {
    opt(): Record<string, ArgvValue>;
    object(): Record<string, ArgvValue>;
    array(): [string, ArgvValue][];
    append(option: AppendOption, type: AppendType): Argv;
    pipe(key: string, callback: (value: ArgvValue) => void, type: PipeWay): Argv;
    commit(unpipedCallback?: (keys: string[]) => boolean): void;
}
export default function createArgv(arguments?: string | string[]): Argv;