

export type coreHttpOpts = {
    protocol: string
    host: string
    path: string
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD"
    headers?: {}
    data?: {}
}


export type HttpRequest = (opts: coreHttpOpts) => Object


export type restMethod = (path: string, data?: any, headers?: any) => any


export type HttpOpts = {
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD"
    headers?: {}
    data?: {}
}

export interface IPersistentStore {
    get(key: string, defaultValue?: string): string
    set(key: string, value: string): void
    del(key: string): void
}


export interface IRecipient {
    backend: any
    parent: any
}


export interface IPayment {
    backend: any
}


export interface ITransaction {
    backend: any
}


export type Base64Encode = (s: string) => string