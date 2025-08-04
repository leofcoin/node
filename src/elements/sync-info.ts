import { LiteElement, css, html, property, query } from '@vandeurenglenn/lite'
import '@vandeurenglenn/lite-elements/pane.js'
import { CustomPane } from '@vandeurenglenn/lite-elements/pane.js'
export class SyncInfo extends LiteElement {
  @property({ type: Boolean })
  accessor open: boolean

  @property({ type: Number, consumes: true })
  accessor lastBlockIndex = 0

  @property({ type: Number, consumes: true })
  accessor totalResolved = 0

  @property({ type: Number, consumes: true })
  accessor totalLoaded = 0

  @query('custom-pane')
  accessor pane: CustomPane

  @property({ type: String }) accessor id = crypto.randomUUID()

  static styles = [
    css`
      :host {
        display: contents;
      }
      custom-pane {
        bottom: 0;
        left: 50%;
        max-width: 1200px;
        color: #eee;
        border-radius: var(--md-sys-shape-corner-large-top);
        transform: translateX(-50%) translateY(100%);
      }
      custom-pane[open] {
        transform: translateX(-50%) translateY(0);
      }
    `
  ]

  firstRender(): void {
    document.addEventListener('custom-pane-close', ({ detail }) => {
      console.log({ detail })

      if (detail === this.id) {
        this.open = false
      }
    })
  }

  render() {
    return html`
      <custom-pane
        .id=${this.id}
        .open=${this.open}
        left
        icon="close"
        title="Sync Info"
        @custom-pane-close=${() => (this.open = false)}>
        <main slot="content">
          <p>Last Block Index: ${this.lastBlockIndex}</p>
          <p>Total Resolved: ${this.totalResolved}</p>
          <p>Total Loaded: ${this.totalLoaded}</p>
        </main>
      </custom-pane>
    `
  }
}
customElements.define('sync-info', SyncInfo)
