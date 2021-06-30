import { OdooREST } from './rest/odoo';

import * as e from './rest/exception';
import * as t from './type';

import { BackendFactories } from './backend';

// Load backends

import './backend/cyclos';

class LokAPI {
    // In charge with all odoo requests

    private odoo: OdooREST;

    // These are kind of exchangeable libraries

    private mixin: {
        httpRequest: t.IHttpRequest;
        base64encode: t.Base64Encode;
        backendFactory: any;
    };

    // User data

    public apiToken: string;

    public userData: {
        login: string;
        partner_id: number;
        uid: number;
    };

    public userProfile: any;

    public backends: any;

    constructor(host: string, dbName: string, mixin: any) {
        this.odoo = new OdooREST(host, dbName, mixin);

        // Keeping them to forward to account REST access
        this.mixin = mixin;
    }

    /**
     * Log in to Lokavaluto Odoo server target API.
     *
     * @param {string} login - Full user identifier on odoo server
     *                         (ie: john.doe@company.com)
     * @param {string} password - Password of given user identifier
     *
     * @returns null
     *
     * @throws {RequestFailed, APIRequestFailed, InvalidCredentials, InvalidJson}
     */
    public async login(login: string, password: string): Promise<any> {
        const userData = await this.odoo.login(login, password);
        const mixin = this.mixin;
        const backends = [];
        userData.backends.forEach((accountData) => {
            backends.push(new BackendFactories[accountData.type](accountData, mixin));
        });
        this.backends = backends;
        return true;
    }

    /**
     * get given user's profile
     *
     * @throws {RequestFailed, APIRequestFailed, InvalidCredentials, InvalidJson}
     *
     * @returns Object
     */
    async getUserProfile(userId: number) {
        return this.odoo.getUserProfile(userId);
    }
 /**
     * get user accounts
     *
     * @throws {RequestFailed, APIRequestFailed, InvalidCredentials, InvalidJson}
     *
     * @returns Object
     */
    async getAccounts() {
        return this.backends[0].getAccounts();
    }
}

export { LokAPI, e, t };
