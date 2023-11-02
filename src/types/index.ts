
export type GenericObject = { [props: string]: any };

export interface IDebuggerMode {
    getEntryPoints(): GenericObject;
};
