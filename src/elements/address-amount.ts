import { css, html, LitElement } from 'lit'
import { map } from 'lit/directives/map.js'
import { formatUnits } from '@leofcoin/utils'

export default customElements.define(
  'address-amount',
  class AddressAmount extends LitElement {
    #address

    static properties = {
      address: {
        type: String,
        reflect: true
      },
      amount: {
        type: Number
      }
    }

    set address(value) {
      this.#address = value
      if (value) this.#updateAmount()
    }
    constructor() {
      super()
    }

    async #updateAmount() {
      const amount = await globalThis.client.balanceOf(this.#address, false)
      console.log({ amount })

      this.amount = formatUnits(BigInt(amount)).toLocaleString()
    }

    static styles = css`
      :host {
        display: flex;
        box-sizing: border-box;
        text-overflow: ellipsis;
        overflow: hidden;
        background: #7986cb;
        color: #fff;
        box-sizing: border-box;
        border-radius: 24px;
        padding: 6px 12px;
      }
      p {
        margin: 0;
        font-size: 14px;
        font-weight: 500;
        text-align: center;
        text-transform: uppercase;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        direction: rtl;
        max-width: 86px;
        min-width: 60px;
      }
    `

    render() {
      return html`<p>${this.amount}</p> `
    }
  }
)
