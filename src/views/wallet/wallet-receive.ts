import { CSSResultGroup, LitElement } from 'lit'
import { customElement, property, state, query } from 'lit/decorators.js'
import { BaseElement, StyleList, html, css } from './../../base.js'
import '@material/web/iconbutton/icon-button.js'
import '@material/web/button/outlined-button.js'
import '@material/web/button/filled-tonal-button.js'
import './../../elements/hero.js'
import { write, NFC_SUPPORT } from './../../integrations/nfc.js'
import { CustomPages } from '@vandeurenglenn/lite-elements/pages.js'
@customElement('wallet-receive')
export class WalletReceive extends LitElement {
  @property()
  accessor amount: string

  @property()
  accessor from: string

  @property({ type: Number })
  accessor selected = 0

  @state()
  accessor url: string

  @state()
  accessor text: string

  @query('custom-pages')
  accessor pages: CustomPages

  @query('.amount')
  accessor amountInput

  @query('.from')
  accessor fromInput

  onChange(propertyKey) {
    if ((this.amount && propertyKey === 'from') || (this.from && propertyKey === 'amount')) {
      this.text = this.createText(this.amount, this.from)
      this.url = this.createShareUrl(this.amount, this.from)
    }
  }

  createShareUrl(amount, from) {
    return `#!/wallet/pay?amount=${amount}&to=${from}&protocol=url`
  }

  createText(amount, from) {
    return JSON.stringify({
      amount,
      from,
      protocol: 'json',
      action: 'pay'
    })
  }

  static styles: StyleList = [
    css`
      :host {
        width: 100%;
        height: 100%;
        align-items: center;
        justify-content: center;
        display: flex;
        flex-direction: column;
      }
      hero-element {
        max-height: 340px;
      }
      flex-row {
        width: 100%;
      }

      input {
        margin-top: 12px;
        margin-bottom: 24px;
        box-sizing: border-box;
        width: 100%;
      }
      select,
      input,
      button {
        background: var(--md-sys-color-surface-container-highest);
        border: 1px solid var(--border-color);
        font-size: 14px;
        color: var(--md-sys-color-on-surface-container-highest);
        border-radius: 24px;
        padding: 6px 12px;
      }
      input,
      select,
      button,
      md-icon-button,
      md-filled-tonal-button {
        cursor: pointer;
        pointer-events: auto;
      }

      flex-column {
        height: 100%;
      }
    `
  ]

  share = () => {
    navigator.share({
      title: 'Payment Request',
      text: this.text,
      url: this.url
    })
  }

  render() {
    if (this.selected === 0)
      return html`
        <hero-element headline="create payment request">
          <flex-column>
            <flex-it></flex-it>
            <flex-row center>
              <label for=".token-select"><custom-typography type="body" size="large">receive</custom-typography></label>
              <flex-it></flex-it>
              <select class="token-select">
                <option>LFC</option>
              </select>
            </flex-row>

            <label for=".amount"> <custom-typography type="body" size="large">amount</custom-typography></label>
            <input
              class="amount"
              placeholder="1"
              value=${this.amount}
              @input=${() => (this.amount = this.amountInput.value)}
            />
            <label for=".from"><custom-typography type="body" size="large">from</custom-typography></label>
            <input
              class="from"
              placeholder="address"
              value=${this.from}
              @input=${() => (this.from = this.fromInput.value)}
            />
            <flex-it></flex-it>
            <flex-row>
              <button data-action="cancel">cancel</button>
              <flex-it></flex-it>
              <button @click=${() => (this.selected = 1)}>request payment</button>
            </flex-row>
          </flex-column>
        </hero-element>
      `
    else {
      return html` <hero-element headline="requesting payment">
        <flex-column center>
          <flex-it></flex-it>
          <label for=".amount">amount</label>

          <custom-typography><span class="amount">${this.amount}</span></custom-typography>
          <label for=".from">from</label>
          <custom-typography><span class="from">${this.from}</span></custom-typography>
          <flex-it></flex-it>
          ${NFC_SUPPORT
            ? html`<button @click=${() => write({ amount: this.amount, from: this.from })}>touch to pay</button>`
            : ''}

          <flex-it></flex-it>
          <flex-row>
            <md-filled-tonal-button @click=${() => (this.selected = 0)}>cancel</md-filled-tonal-button>
            <flex-it></flex-it>
            <md-icon-button @click=${this.share}><custom-icon icon="share"></custom-icon></md-icon-button>
          </flex-row>
        </flex-column>
      </hero-element>`
    }
  }
}
