declare interface Argv<T extends object> extends Map<keyof T, any> {
    object(): T;
}
declare function createArgv<T extends object>(arguments?: string): Argv<T>;
export default createArgv;