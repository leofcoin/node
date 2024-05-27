import Pubsub from '@vandeurenglenn/little-pubsub'
import Storage from '@leofcoin/storage'
import '@vandeurenglenn/lite-elements/pages.js'
import '@vandeurenglenn/lite-elements/selector.js'
import './array-repeat.js'
import './screens/login.js'
import './screens/export.js'
import './clipboard-copy.js'
import './screens/login.js'
import './notification/master.js'
import './notification/child.js'
import './elements/account-select.js'
import '@vandeurenglenn/lite-elements/icon-set.js'
import '@vandeurenglenn/lite-elements/icon.js'
import '@vandeurenglenn/lite-elements/dropdown-menu.js'
import '@vandeurenglenn/flex-elements/column.js'
import '@vandeurenglenn/flex-elements/row.js'
import '@vandeurenglenn/flex-elements/it.js'
import '@vandeurenglenn/lite-elements/theme.js'
import './elements/sync-info.js'
import Router from './router.js'
import { CustomPages } from '@vandeurenglenn/lite-elements/pages.js'

import { LiteElement, property, query, css, html, customElement } from '@vandeurenglenn/lite'

globalThis.pubsub = globalThis.pubsub || new Pubsub(true)

@customElement('app-shell')
class AppShell extends LiteElement {
  @property({ provides: true }) accessor blocks

  @property({ type: Boolean })
  accessor openSync = false

  @property({ type: Number })
  accessor lastBlockIndex = 0

  @property({ type: Number })
  accessor totalResolved = 0

  @property({ type: Number })
  accessor totalLoaded = 0

  @property({ type: Boolean, reflect: true })
  accessor navRailShown = false

  router: Router

  @property({ provider: true })
  accessor block

  @property({ provider: true })
  accessor wallet

  get nodeReady() {
    return this.#nodeReady
  }

  #nodeReady = new Promise((resolve) => {
    pubsub.subscribe('node:ready', () => resolve(true))
  })

  get notificationMaster() {
    return this.shadowRoot.querySelector('notification-master')
  }
  get #pages() {
    return this.shadowRoot.querySelector('custom-pages')
  }

  select(selected) {
    console.log({ selected })

    return this.#select(selected)
  }

  @query('custom-pages')
  accessor pages: CustomPages

  async #select(selected) {
    if (!customElements.get(`${selected}-view`)) await import(`./${selected}.js`)
    this.#pages.select(selected)
    const monacoContainer = document.querySelector('.container')
    if (monacoContainer) {
      if (selected === 'editor') monacoContainer.classList.add('custom-selected')
      else monacoContainer.classList.remove('custom-selected')
    }
  }

  @query('sync-info')
  accessor syncInfo

  @property({ type: Boolean, reflect: true, attribute: 'is-desktop' })
  accessor isDesktop: boolean = false

  #matchMedia = ({ matches }) => {
    this.isDesktop = matches
    document.dispatchEvent(new CustomEvent('is-desktop', { detail: matches }))
  }

  async connectedCallback() {
    this.router = new Router(this, 'wallet')
    var matchMedia = window.matchMedia('(min-width: 640px)')
    this.#matchMedia(matchMedia)
    matchMedia.onchange = this.#matchMedia(matchMedia)

    this.peersConnected = 0
    pubsub.subscribe('lastBlock', (block) => (this.syncInfo.lastBlockIndex = block.index))
    pubsub.subscribe('block-resolved', (block) => (this.syncInfo.totalResolved += 1))
    pubsub.subscribe('block-loaded', (block) => (this.syncInfo.totalLoaded += 1))
    try {
      let importee
      importee = await import('@leofcoin/endpoint-clients/ws')
      globalThis.client = await new importee.default('wss://ws-remote.leofcoin.org', 'peach')
      console.log(client)

      // @ts-ignore
      globalThis.client.init && (await globalThis.client.init())
      console.log('client init')
    } catch (error) {
      console.error(error)
    }

    this.#login()
    import('./integrations/nfc.js')
    // await this.init()
    // globalThis.walletStorage = new Storage('wallet')
    // await globalThis.walletStorage.init()
    // lo
  }

  async #login() {
    if (!globalThis.walletStore) {
      const importee = await import('@leofcoin/storage')
      // todo: race condition introduced?
      // for some reason walletStore can't find current wallet
      globalThis.walletStore = globalThis.walletStore || (await new Storage('wallet', '.leofcoin/peach'))
      await walletStore.init()
    }

    console.log('wallet')
    console.log(walletStore)

    const hasWallet = await walletStore.has('identity')
    console.log(hasWallet)

    await this.shadowRoot.querySelector('login-screen').requestLogin(hasWallet)
  }

  static styles = [
    css`
      :host {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        display: flex;
        flex-direction: column;
        font-family: system-ui, 'Noto Sans', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji',
          'Segoe UI Symbol';
        background: var(--md-sys-background);
        font-size: 0.875rem;
        font-weight: 400;
        line-height: 1.5;
      }

      .container {
        height: 100%;
      }

      .main {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
      }

      custom-selector {
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      .custom-selector-overlay {
        height: 100%;
        --svg-icon-color: #ffffffb5;
        border-right: 1px solid #383941;
        position: absolute;
        opacity: 0;
        top: 0;
        left: 0;
        bottom: 0;
        transform: translateX(-110%);
      }

      :host([navRailShown]) .custom-selector-overlay {
        opacity: 1;
        transform: translateX(0);
      }

      :host([navRailShown]) .main {
        left: 48px;
        width: calc(100% - 48px);
      }

      a {
        padding: 12px;
        box-sizing: border-box;
        height: 48px;
      }

      flex-column {
        width: 100%;
        height: 100%;
      }

      header {
        height: 64px;
        display: flex;
        align-items: center;
        width: 100%;
        box-sizing: border-box;
        padding: 6px 12px;
      }

      ::slotted(.container) {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
      }

      ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      ::-webkit-scrollbar-track {
        box-shadow: inset 0 0 6px rgba(255, 255, 255, 0.3);
        -webkit-box-shadow: inset 0 0 6px rgba(255, 255, 255, 0.3);
        border-radius: 10px;
      }
      ::-webkit-scrollbar-thumb {
        border-radius: 10px;
        box-shadow: inset 0 0 6px rgba(225, 255, 255, 0.5);
        -webkit-box-shadow: inset 0 0 6px rgba(225, 255, 255, 0.5);
      }

      .resolver-snack,
      .loader-snack {
        color: var(--font-color);
      }
    `
  ]
  render() {
    return html`
      <custom-icon-set>
        <template>
          <span name="add">@symbol-add</span>
          <span name="close">@symbol-close</span>
          <span name="notifications">@symbol-notifications</span>
          <span name="sync">@symbol-sync</span>
          <span name="clear-all">@symbol-clear_all</span>
          <span name="wallet">@symbol-wallet</span>
          <span name="dashboard">@symbol-dashboard</span>
          <span name="accounts">@symbol-account_tree</span>
          <span name="actions">@symbol-manage_accounts</span>
          <span name="stack">@symbol-stack</span>
          <span name="pool">@symbol-pool</span>
          <span name="send">@symbol-send</span>
          <span name="account_circle">@symbol-account_circle</span>
          <span name="travel_explore">@symbol-travel_explore</span>
          <span name="gavel">@symbol-gavel</span>
          <span name="edit_note">@symbol-edit_note</span>
          <span name="analytics">@symbol-analytics</span>
          <span name="chat">@symbol-chat</span>
          <span name="database">@symbol-database</span>
          <span name="history">@symbol-history</span>
          <span name="mood">@symbol-mood</span>
          <span name="local-florist">@symbol-local_florist</span>
          <span name="local-pizza">@symbol-local_pizza</span>
          <span name="directions-walk">@symbol-directions_walk</span>
          <span name="input_circle">@symbol-input_circle</span>
          <span name="cake">@symbol-cake</span>
          <span name="account-balance">@symbol-account_balance</span>
          <span name="euro-symbol">@symbol-euro_symbol</span>
          <span name="flags">@symbol-emoji_flags</span>
          <span name="people">@symbol-emoji_people</span>
          <span name="gif">@symbol-gif</span>
          <span name="list">@symbol-list_alt</span>
          <span name="call_received">@symbol-call_received</span>
          <span name="call_made">@symbol-call_made</span>
          <span name="share">@symbol-share</span>
        </template>
      </custom-icon-set>
      <custom-theme load-symbols="false"></custom-theme>
      <flex-row class="container">
        <span class="custom-selector-overlay">
          <custom-selector attr-for-selected="data-route">
            <a href="#!/wallet" data-route="wallet">
              <custom-icon icon="wallet"></custom-icon>
            </a>
            <a href="#!/identity" data-route="identity">
              <custom-icon icon="account_circle"></custom-icon>
            </a>
            <a href="#!/explorer" data-route="explorer">
              <custom-icon icon="travel_explore"></custom-icon>
            </a>
            <a href="#!/validator" data-route="validator">
              <custom-icon icon="gavel"></custom-icon>
            </a>
            <a href="#!/editor" data-route="editor">
              <custom-icon icon="edit_note"></custom-icon>
            </a>
            <a href="#!/chat" data-route="chat">
              <custom-icon icon="chat"></custom-icon>
            </a>
            <a href="#!/database" data-route="database">
              <custom-icon icon="database"></custom-icon>
            </a>
            <a href="#!/stats" data-route="stats">
              <custom-icon icon="analytics"></custom-icon>
            </a>
          </custom-selector>
        </span>

        <flex-column class="main">
          <header>
            <flex-it></flex-it>
            <account-select style="margin-right: 48px;"></account-select>

            <notification-master></notification-master>
          </header>
          <custom-pages attr-for-selected="data-route">
            <identity-view data-route="identity"></identity-view>
            <wallet-view data-route="wallet"></wallet-view>
            <explorer-view data-route="explorer"></explorer-view>
            <validator-view data-route="validator"></validator-view>
            <editor-view data-route="editor"><slot></slot></editor-view>
            <stats-view data-route="stats"></stats-view>
            <chat-view data-route="chat" ?is-desktop=${this.isDesktop}></chat-view>
          </custom-pages>
        </flex-column>
      </flex-row>

      <login-screen></login-screen>
      <export-screen></export-screen>

      <sync-info></sync-info>
    `
  }
}
export default AppShell
