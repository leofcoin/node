import { css, customElement, html, LiteElement, property } from '@vandeurenglenn/lite'
import { map } from 'lit/directives/map.js'
import './very-short-string.js'
import './address-amount.js'
import './../animations/busy.js'

@customElement('account-select')
export class AccountSelect extends LiteElement {
  @property({ type: Object, consumer: true }) accessor wallet
  @property({type: String, provider: true}) accessor selectedAccount
  @property({type: Boolean, reflect: true}) accessor selecting

  onChange(propertyKey: string, value: any): void {
    if (propertyKey === 'wallet' && value) {
      this.selectedAccount = value.accounts[value.selectedAccountIndex]
    }
  }

    get #iconElement() {
      return this.shadowRoot.querySelector('custom-svg-icon')
    }

    // async connectedCallback() {
    //   pubsub.subscribe('identity-change', this.#identityChange.bind(this))
    // }

    // /**
    //  *
    //  * @param {Array} accounts
    //  * @param {Number} selectedAaccount
    //  */
    // async #identityChange({ accounts, selectedAccountIndex }) {
    //   this.accounts = accounts
    //   this.selected = accounts[selectedAccountIndex]
    //   this.title = this.selected[1]
    //   // if (!this.selected)
    //   console.log({ accounts, selectedAccountIndex })
    // }

    async startSelect() {
      this.selecting = true
    }

    static styles = [css`
      :host {
        display: flex;
        flex-direction: column;
        top: 6px;
        right: 36px;
        position: absolute;
        z-index: 1001;
        color: var(--font-color);
        min-width: 210px;
      }
      :host([selecting]) custom-svg-icon {
        transform: rotate(180deg);
        transition: transform ease-in-out 0.25s;
      }

      flex-row {
        width: 100%;
      }
      custom-svg-icon {
        pointer-events: auto;
        cursor: pointer;
      }

      address-amount {
        padding: 0 6px;
      }

      .selected-container {
        align-items: center;
        background: var(--secondary-background);
        border-radius: 24px;
        box-sizing: border-box;
        padding: 6px 12px;
        border: 1px solid var(--border-color);
      }

      .seperator {
        display: flex;
        height: 12px;
      }

      .accounts-container {
        background: var(--active-background);
        border-radius: 24px;
        box-sizing: border-box;
        padding: 6px 12px;
        border: 1px solid var(--border-color);
      }

      .account-container {
        align-items: center;
      }

      very-short-string {
        padding: 0 12px;
      }
    `]

    render() {
      return html`
        <flex-row class="selected-container">
          ${this.selectedAccount ? html`
            ${this.selectedAccount[0]}
            <flex-it></flex-it>
            <address-amount address=${this.selectedAccount[1]}></address-amount>  
          ` : html`<busy-animation></busy-animation>`}
          
          
          
          <custom-svg-icon
            icon="arrow-drop-down"
            @click="${() => (this.selecting = !this.selecting)}"
          ></custom-svg-icon>
        </flex-row>

        ${this.selecting
          ? html`
              <span class="seperator"></span>
              <flex-column class="accounts-container">
                ${map(
                  this.wallet.accounts,
                  (item) => html`
                    <flex-column class="account-container">
                      <flex-row>
                        <strong>${item[0]}</strong>
                        <flex-it></flex-it>
                        <very-short-string value=${item[1]}></very-short-string>
                      </flex-row>
                      <flex-row>
                        <flex-it></flex-it>
                        <address-amount address=${item[1]}></address-amount>
                      </flex-row>
                    </flex-column>
                  `
                )}
              </flex-column>
            `
          : ''}
      `
    }
  }

