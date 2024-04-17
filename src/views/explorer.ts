import { css, html, LitElement } from 'lit'
import { map } from 'lit/directives/map.js'
import '../elements/latest.js'
import '../elements/explorer/info-container.js'
import { formatBytes } from '@leofcoin/utils'
import '../elements/navigation-bar.js'
import { query } from 'lit/decorators.js'
import { customElement } from '@vandeurenglenn/lite'
import Router from '../router.js'

@customElement('explorer-view')
export class ExplorerView extends LitElement {
  static properties = {
    selected: {
      type: String
    }
  }
  static get styles() {
    return css`
      :host {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        height: 100%;
        overflow-y: auto;
      }
      custom-pages {
        width: 100%;
        height: 100%;
      }
    `
  }

  @query('custom-pages')
  accessor pages

  async select(selected) {
    console.log(selected)
    this.selected = selected
    await this.updateComplete
    if (!customElements.get(`explorer-${selected}`)) await import(`./explorer-${selected}.js`)
    this.pages.select(selected)
    this.renderRoot.querySelector('navigation-bar')?.select(selected)
  }

  #customSelect({ detail }) {
    location.hash = `#!/explorer/${detail}`
    // this.select(detail)
  }

  render() {
    return html`
      <custom-pages attr-for-selected="data-route">
        <explorer-dashboard data-route="dashboard"></explorer-dashboard>
        <explorer-blocks data-route="blocks"></explorer-blocks>
        <explorer-block data-route="block"></explorer-block>
        <explorer-block-transactions data-route="block-transactions"></explorer-block-transactions>
        <explorer-transactions data-route="transactions"></explorer-transactions>
        <explorer-transaction data-route="transaction"></explorer-transaction>
        <explorer-pool data-route="pool"></explorer-pool>
      </custom-pages>

      ${this.selected === 'transactions' ||
      this.selected === 'blocks' ||
      this.selected === 'dashboard' ||
      this.selected === 'pool'
        ? html`
            <custom-tabs
              round
              class="wallet-nav"
              attr-for-selected="data-route"
              default-selected="dashboard"
              @selected=${(event: CustomEvent) => (location.hash = Router.bang(`explorer/${event.detail}`))}
            >
              <custom-tab title="dashboard" data-route="dashboard">
                <custom-icon icon="dashboard"></custom-icon>
              </custom-tab>
              <custom-tab title="blocks" data-route="blocks">
                <custom-icon icon="stack"></custom-icon>
              </custom-tab>
              <custom-tab title="transactions" data-route="transactions">
                <custom-icon icon="list"></custom-icon>
              </custom-tab>

              <custom-tab title="pool" data-route="pool">
                <custom-icon icon="pool"></custom-icon>
              </custom-tab>
            </custom-tabs>
          `
        : ''}
    `
  }
}
