interface Array<T> {
    groupBy(prop: string, fields?: string | Function | any): T[];
    aggregate(querys: any): T[];
    first(): T;
    last(): T;
    count(field?: (value: T, index: number, array: T[]) => Array<any>): number;
    min(field?: string | ((value: T, index: number, array: T[]) => Array<any>)): number;
    max(field?: string | ((value: T, index: number, array: T[]) => Array<any>)): number;
    sum(field?: string | ((value: T, index: number, array: T[]) => Array<any>)): number;
    average(field?: string | ((value: T, index: number, array: T[]) => Array<any>)): number;
    unique(field?: string | ((value: T, index: number, array: T[]) => Array<any>) | string): string[] | T[];
    by(field?: string | ((value: T, index: number, array: T[]) => Array<any>)): T[];
    flatten(depth?: number): T[];
    flatMap<U>(callbackfn: (value: T, index: number, array: T[]) => U, thisArg?: any): U[];
    take(numberOf?: number): T[];
    includes(searchElement?: any): boolean;
    find(callbackfn: (value: T, index: number, array: Array<T>) => boolean, thisArg?: any): T;
    findIndex(callbackfn: (value: T, index: number, array: Array<T>) => boolean, thisArg?: any): number;
    fill(value: T, start?: number, end?: number): T[];
}
declare function typeArg(arg: any, arr: any[]): any[];
declare function flatten(list: Array<any>, depth: number, mapperFn?: Function, mapperCtx?: any): any;
interface ObjectConstructor {
    assign(target: any, ...sources: any[]): any;
    isString(value: any): boolean;
    isNumber(value: any): boolean;
    isBoolean(value: any): boolean;
    isObject(value: any): boolean;
    isArray(value: any): boolean;
    isNull(value: any): boolean;
    isUndefined(value: any): boolean;
    isFunction(value: any): boolean;
}
interface NumberConstructor {
    isFinite(value: any): boolean;
    isInteger(value: any): boolean;
}
