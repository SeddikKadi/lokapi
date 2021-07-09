
import { JsonRESTPersistentClientAbstract } from "../../rest"
import * as t from "../../type"

import { CyclosPayment } from "./payment"
import { CyclosAccount } from "./account"
import { CyclosRecipient } from "./recipient"
import { CyclosTransaction } from "./transaction"

import { BackendFactories } from ".."



export abstract class CyclosBackendAbstract {

    protected abstract httpRequest: t.HttpRequest
    protected abstract base64Encode: t.Base64Encode
    protected abstract persistentStore: t.IPersistentStore
    protected requestLogin?: () => void


    constructor(jsonData: any) {
        this._jsonData = jsonData  // lazy loading
    }
    private _jsonData


    private get userAccounts() {
        if (!this._userAccounts) {
            this._userAccounts = {}
            let { httpRequest, base64Encode, persistentStore, requestLogin } = this
            this._jsonData.user_accounts.forEach((userAccountData: any) => {
                class CyclosUserAccount extends CyclosUserAccountAbstract {
                    httpRequest = httpRequest
                    base64Encode = base64Encode
                    persistentStore = persistentStore
                    requestLogin = requestLogin

                    // This function declaration seems necessary for typescript
                    // to avoid having issues with this dynamic abstract class
                    constructor(jsonData: any) {
                        super(jsonData)
                    }

                }
                let cyclosUserAccount = new CyclosUserAccount(userAccountData)
                this._userAccounts[cyclosUserAccount.internalId] = cyclosUserAccount
            })
        }
        return this._userAccounts
    }
    private _userAccounts: any


    get accounts() {
        let backendBankAccounts = []
        for (const id in this.userAccounts) {
            let userAccount = this.userAccounts[id]
            let bankAccounts =  userAccount.accounts
            bankAccounts.forEach((bankAccount: any) => {
                backendBankAccounts.push(bankAccount)
            })
        }
        return backendBankAccounts
    }
    public async getAccounts(): Promise<any> {
        let backendBankAccounts = []
        for (const id in this.userAccounts) {
            let userAccount = this.userAccounts[id]
            let bankAccounts = await userAccount.getAccounts()
            bankAccounts.forEach((bankAccount: any) => {
                backendBankAccounts.push(bankAccount)
            })
        }
        return backendBankAccounts
    }


    public makeRecipients(jsonData: any): any {
        let recipients = []
        jsonData.monujo_backends[this.internalId].forEach((ownerId: string) => {
            recipients.push(new CyclosRecipient(this, this, jsonData, ownerId))
        })
        return recipients
    }


    get internalId() {
        let endingPart = this._jsonData.user_accounts[0].url.split("://")[1];
        let splits = endingPart.split("/");
        let host = splits[0]
        return `cyclos:${host}`
    }


    public async getTransactions(): Promise<any> {
        let backendTransactions = []
        for (const id in this.userAccounts) {
            let userAccount = this.userAccounts[id]
            // XXXvlab: these promises should be awaited in parallel
            let transactions = await userAccount.getTransactions()
            transactions.forEach((transaction: any) => {
                backendTransactions.push(transaction)
            })
        }
        return backendTransactions
    }

}


export abstract class CyclosUserAccountAbstract extends JsonRESTPersistentClientAbstract {

    AUTH_HEADER = "Session-token"

    owner_id: string


    constructor(jsonData) {
        super(jsonData.url)
        this.lazySetApiToken(jsonData.token)
        this.owner_id = jsonData.owner_id
    }

    accounts: CyclosAccount[]
    async getAccounts() {
        let jsonAccounts = await this.$get(`/${this.owner_id}/accounts`)

        let accounts = []

        jsonAccounts.forEach((jsonAccountData: any) => {
            accounts.push(new CyclosAccount(this, this, jsonAccountData))
        })
        this.accounts = accounts
        return accounts
    }

    get internalId() {
        return `cyclos:${this.owner_id}@${this.host}`
    }

    public async transfer(recipient: CyclosRecipient, amount: number, description: string) {
        const jsonDataPerform = await this.$get(
            `/self/payments/data-for-perform`,
            { to: recipient.ownerId })
        if (jsonDataPerform.paymentTypes.length == 0) {
            throw new Error('No payment types available between selected accounts')
        }
        if (jsonDataPerform.paymentTypes.length > 1) {
            throw new Error(
                'More than one payment types available between ' +
                'selected accounts. Not supported yet !')
        }
        const jsonData = await this.$post(`/self/payments`, {
            amount: amount,
            description: description,
            subject: recipient.ownerId,
        })
        return new CyclosPayment(this, this, jsonData)
    }


    public async getTransactions(): Promise<any> {
        let jsonTransactions = await this.$get(`/${this.owner_id}/transactions`)

        let transactions = []

        jsonTransactions.forEach((jsonTransactionData: any) => {
            transactions.push(new CyclosTransaction(this, this, jsonTransactionData))
        })
        return transactions
    }


}


BackendFactories['cyclos'] = CyclosBackendAbstract