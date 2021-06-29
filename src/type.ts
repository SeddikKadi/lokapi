export interface IHttpRequest {
    request(opts): Promise<any>;
}

export interface coreHttpOpts {
    host: string;
    path: string;
    method: 'GET' | 'POST';
    headers?: {};
    data?: {};
}

export interface HttpOpts {
    method: 'GET' | 'POST';
    headers?: {};
    data?: {};
}

export type Base64Encode = (s: string) => string;
