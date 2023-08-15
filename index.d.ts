export declare type ArgvValue = true | string | string[];
export declare type AppendOption = string | string[] | Record<string, any>;
export declare type PipeWay = "ignore" | "always" | "break";
export declare type AppendType = "append" | "replace" | "ignore";
export declare interface Argv extends Map<string, ArgvValue> {
    opt(): Record<string, ArgvValue>;
    object(): Record<string, ArgvValue>;
    array(): [string, ArgvValue][];
    /**
     * @param {string | string[]} keys 
     * @param {(value: ArgvValue) => void} callback
     * @param {PipeWay} type default value "ignore"
     */
    pipe(keys: string | string[], callback: (value: ArgvValue) => void, type?: PipeWay): Argv;
    /**
     * @param {AppendOption} option 
     * @param {AppendType} type default value "append"
     */
    append(option: AppendOption, type?: AppendType): Argv;
    commit(unpipedCallback?: (keys: string[]) => boolean): void;
}
export default function createArgv(arguments?: string | string[]): Argv;