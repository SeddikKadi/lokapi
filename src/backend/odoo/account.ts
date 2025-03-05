import { BridgeObject } from '..'


export default abstract class Account extends BridgeObject {

    public async getPendingTopUp() {
        let requests = await this.backends.odoo.$get(
            '/partner/pending-topup', {
            backend_keys: [ this.parent.internalId ],
        })
        return await Promise.all(
            requests.map((e: any) => this.parent.makeCreditRequest(e))
        )
    }
    abstract isBusinessAccountForFinancialBackend(): Promise<boolean>

    public async isBusinessAccountForAdministrativeBackend(): Promise<boolean> {
        const me = await this.backends.odoo.getMyContact()
        return me.isBusiness
    }
    
    public async isBusinessAccount(isAdministrativeBackendSourceOfBusinessStatus?: boolean): Promise<boolean> {
        const backend = this.parent.parent
        if ((isAdministrativeBackendSourceOfBusinessStatus !== null && isAdministrativeBackendSourceOfBusinessStatus) ||
            (isAdministrativeBackendSourceOfBusinessStatus === null && backend.isAdministrativeBackendSourceOfBusinessStatus)) {
            return await this.isBusinessAccountForAdministrativeBackend()
        }
        return await this.isBusinessAccountForFinancialBackend()
    }
}
