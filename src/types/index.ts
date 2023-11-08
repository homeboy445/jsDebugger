
export type GenericObject = { [props: string]: any };

export interface IDebuggerMode {
    registerEventListeners(...args: any[]): void;
    getEntryPoints(): GenericObject;
};
