import { BridgeObject } from '..';

export class CyclosAccount extends BridgeObject {
  type: 'cyclos'

    async getBalance() {
        return this.jsonData.status.balance
    }

    async getSymbol() {
        return this.jsonData.currency.symbol
    }

    get internalId() {
        return `${this.parent.internalId}/${this.parent.owner_id}/${this.jsonData.id}`
    }

}
