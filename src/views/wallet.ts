import '../elements/account.js'
// import { nativeToken } from './../../../node_modules/@leofcoin/addresses/src/addresses'
import { parseUnits } from '@leofcoin/utils'
import { signTransaction } from '@leofcoin/lib'
import { LiteElement, customElement, property, html, query } from '@vandeurenglenn/lite'
import { CustomPages } from '@vandeurenglenn/lite-elements/pages.js'
import '@vandeurenglenn/lite-elements/tabs.js'
import '@vandeurenglenn/lite-elements/tab.js'
import { WalletPay } from './wallet/wallet-pay.js'
import Router from '../router.js'
import { NotificationController } from '../notification/controller.js'
import AppShell from '../shell.js'
import shell from '../shell.js'

@customElement('wallet-view')
export class WalletView extends LiteElement {
  @property({ type: Array })
  accessor accounts

  @property({ type: String })
  accessor selectedAccount

  @property({ type: Object, consumer: true })
  accessor wallet

  @query('wallet-send') accessor walletSend
  shell = document.querySelector('app-shell') as AppShell
  notificationController = this.shell.notificationController as NotificationController

  get #amount() {
    return this.walletSend.shadowRoot.querySelector('.amount') as HTMLInputElement
  }

  get #to() {
    return this.walletSend.shadowRoot.querySelector('.to') as HTMLInputElement
  }

  get pages(): CustomPages {
    return this.shadowRoot.querySelector('custom-pages') as unknown as CustomPages
  }

  onChange(propertyKey, value) {
    if (propertyKey === 'wallet') {
      this.selectedAccount = this.wallet.accounts[this.wallet.selectedAccountIndex][1]
      this.accounts = this.wallet.accounts
      console.log(this.accounts)
    }
  }

  async select(selected) {
    if (selected === 'pay') {
      const appShell = document.querySelector('app-shell')
      const appPages = appShell.shadowRoot.querySelector('custom-pages') as CustomPages
      appPages.style.position = 'fixed'

      const payEl = this.pages.querySelector('[data-route="pay"]') as WalletPay
      payEl.style.position = 'fixed'
    }

    if (!customElements.get(`wallet-${selected}`)) await import(`./wallet-${selected}.js`)
    this.pages.select(selected)
  }

  _cancel() {
    this.#to.value = null
    this.#amount.value = null
  }

  async _requestSend() {
    const to = this.#to.value
    const amount = this.#amount.value
    this._send(to, amount)
  }

  async _send(to, amount) {
    let from = this.selectedAccount
    console.log({ from })
    const token = (await client.nativeToken()) as unknown as string

    const nonce = (await client.getNonce(from)) as number
    const rawTransaction = {
      timestamp: Date.now(),
      from,
      to: token,
      method: 'transfer',
      nonce: nonce + 1,
      params: [from, to, parseUnits(amount).toString()]
    }
    const transaction = await signTransaction(rawTransaction, globalThis.identityController)
    console.log(transaction)
    console.log('permission', Notification.permission)
    const transactionEvent = await client.sendTransaction(transaction)

    this.notificationController.createNotification({
      title: 'Transaction Sent',
      message: `Transaction hash: ${transactionEvent.hash}`
    })
    if (Notification.permission !== 'granted') await Notification.requestPermission()

    console.log('permission', Notification.permission)

    if (Notification.permission === 'granted') {
      const notification = new Notification('Transaction Sent', {
        body: `Transaction hash: ${transactionEvent.hash}`
      })
    }
    console.log(transactionEvent)
    await transactionEvent.wait
    this.notificationController.createNotification({
      title: 'Transaction Completed',
      message: `Transaction hash: ${transactionEvent.hash}`
    })
    if (Notification.permission === 'granted') {
      const notification = new Notification('Transaction Completed', {
        body: `Transaction hash: ${transactionEvent.hash}`
      })
    }
    this._cancel()
  }

  connectedCallback(): void {
    this.shadowRoot.addEventListener('click', this._handleClick.bind(this))
    if (Router.debang(location.hash).split('/').length === 1) location.hash = Router.bang(`wallet/send`)
  }

  _handleClick(event) {
    const target = event.composedPath()[0]
    const action = event.target.getAttribute('data-action') ?? target.getAttribute('data-action')
    action && this[`_${action}`]()
  }

  render() {
    return html`
      <style>
        * {
          pointer-events: none;
        }
        :host {
          display: flex;
          flex-direction: row;
          width: 100%;
          height: 100%;
          justify-content: center;
        }
        custom-pages {
          width: 100%;
          height: 100%;
        }
        .main {
          width: 100%;
          align-items: center;
        }
        custom-tab {
          pointer-events: auto;
        }
      </style>
      <flex-column class="main">
        <custom-pages attr-for-selected="data-route">
          <wallet-send data-route="send"></wallet-send>
          <wallet-receive data-route="receive"></wallet-receive>
          <wallet-pay data-route="pay"></wallet-pay>
          <wallet-transactions data-route="transactions"></wallet-transactions>
        </custom-pages>
        <custom-tabs
          round
          class="wallet-nav"
          attr-for-selected="data-route"
          @selected=${(event: CustomEvent) => (location.hash = Router.bang(`wallet/${event.detail}`))}>
          <custom-tab title="send" data-route="send">
            <custom-icon icon="call_made"></custom-icon>
          </custom-tab>
          <custom-tab title="receive" data-route="receive">
            <custom-icon icon="call_received"></custom-icon>
          </custom-tab>
          <custom-tab title="transactions" data-route="transactions">
            <custom-icon icon="list"></custom-icon>
          </custom-tab>
        </custom-tabs>
      </flex-column>
    `
  }
}
