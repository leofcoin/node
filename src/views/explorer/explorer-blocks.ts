import { html, LiteElement, customElement, property } from '@vandeurenglenn/lite'
import { map } from 'lit/directives/map.js'
import '../../elements/latest.js'
import '../../elements/explorer/info-container.js'
import { formatBytes } from '@leofcoin/utils'
import { BlockMessage } from '@leofcoin/messages'

@customElement('explorer-blocks')
export class ExplorerBlocks extends LiteElement {
  @property({ type: Array }) accessor items: []

  @property({ consumes: true }) accessor blocks
  #blocks = []
  #transactions = []

  #addBlock(block) {
    console.log(block)
    if (block.transactions.length > 25) {
      this.#transactions = block.transactions.slice(-25)
    } else {
      this.#transactions = [...block.transactions, ...this.#transactions.slice(-(block.transactions.length - 1))]
    }
    this.blocks.push(block)
  }

  async onChange(propertyKey: string, value: any): Promise<void> {
    if (propertyKey === 'blocks') {
      let i = 0
      while (this.#transactions.length < 25 && this.blocks.length - 1 >= i) {
        if (this.blocks[i].transactions.length < 25)
          this.blocks[i].transactions.slice(0, this.blocks[i].transactions.length - 1)
        this.#transactions = [...this.#transactions, ...this.blocks[i].transactions.slice(-25)]
        i++
      }
    }
  }

  async connectedCallback() {
    client.pubsub.subscribe('add-block', this.#addBlock.bind(this))
    client.pubsub.subscribe('block-processed', this.#addBlock.bind(this))
  }

  render() {
    return html`
      <style>
        :host {
          display: flex;
          flex-direction: column;
          width: 100%;
          height: 100%;
          overflow-y: auto;
          box-sizing: border-box;
          padding: 12px;
          box-sizing: border-box;
        }

        .container {
          width: 100%;
          height: 100%;
          box-sizing: border-box;
        }

        .latest-blocks {
          width: 100%;
          height: 100%;
          overflow-y: auto;
        }

        latest-element {
          padding: 12px;
          box-sizing: border-box;
        }

        .container h4 {
          padding-left: 12px;
        }

        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          -webkit-box-shadow: inset 0 0 6px rgb(73 78 112);
          border-radius: 10px;
          margin: 12px 0;
        }
        ::-webkit-scrollbar-thumb {
          border-radius: 10px;
          -webkit-box-shadow: inset 0 0 6px rgba(225, 255, 255, 0.5);
        }

        h4 {
          margin: 0;
          padding: 6px 0;
        }

        @media (min-width: 640px) {
          :host {
            align-items: center;
            justify-content: center;
            padding: 12px;
          }

          .container {
            max-width: 600px;
            max-height: 600px;
            border-radius: 24px;
            padding: 12px 0;
          }
        }
      </style>
      <flex-column class="container">
        <flex-column class="latest-blocks">
          ${this.blocks
            ? map(this.blocks, (item) => html` <latest-element .value=${item} type="block"></latest-element> `)
            : ''}
        </flex-column>
      </flex-column>
    `
  }
}
