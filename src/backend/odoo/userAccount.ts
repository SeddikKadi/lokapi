import { BridgeObject } from '..'
import { t } from '../..'


export default abstract class UserAccount extends BridgeObject {
    get isTopUpAllowed() {
        return this.jsonData?.is_topup_allowed !== false
    }
    
    // abstract isBusinessAccountForFinancialBackend(): Promise<boolean>

    abstract getAccounts()

    isBusinessAccountForAdministrativeBackend() {
        return this.jsonData?.comptePro
    }

    async isBusinessAccount(isAdministrativeBackendSourceOfBusinessStatus?: boolean): Promise<boolean> { 
        const bankAccounts = await this.getAccounts()
        if (bankAccounts.length === 0) {
            throw new Error(
                'Current user has no bank account. Unsupported yet.'
            )
        }
        if (bankAccounts.length > 1) {
            // We will need to select one of the source userAccount of the
            // current logged in user
            throw new Error(
                'Current user has more than one bank account. ' +
                    'Unsupported yet.'
            )
        }
        return await bankAccounts[0].isBusinessAccount(isAdministrativeBackendSourceOfBusinessStatus)
    }
    
}
