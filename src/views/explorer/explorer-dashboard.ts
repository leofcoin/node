import { html, LiteElement, property } from '@vandeurenglenn/lite'
import { map } from 'lit/directives/map.js'
import '../../elements/latest.js'
import '../../elements/explorer/info-container.js'
import { formatBytes } from '@leofcoin/utils'
import '@vandeurenglenn/flex-elements/wrap-around.js'
import { BlockMessage } from '@leofcoin/messages'

export default customElements.define(
  'explorer-dashboard',
  class ExplorerDashboard extends LiteElement {
    @property() accessor items: { title: string; items: [] }[]

    #blocks = []
    #transactions = []

    async updateInfo() {
      const lookupValidators = await client.lookup('LeofcoinValidators')

      const validators = await client.staticCall(lookupValidators.address, 'validators')
      const lookupFactory = await client.lookup('LeofcoinContractFactory')
      const tpeses = []

      let blocks = await client.blocks(-128)
      for (let block of blocks) {
        block = new BlockMessage(new Uint8Array(Object.values(block))).decoded
        block.tps = 0

        let start = block.transactions[0].timestamp
        for (const transaction of block.transactions) {
          if (start - transaction.timestamp <= 1000) {
            block.tps += 1
          }
        }

        tpeses.push(block.tps)
      }

      const median = (arr) => {
        const mid = Math.floor(arr.length / 2),
          nums = [...arr].sort((a, b) => a - b)
        return arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2
      }

      const tps = median(tpeses)

      this.items = [
        {
          title: 'transactions',
          items: [
            {
              title: 'transfers',
              value: await client.nativeTransfers()
            },
            {
              title: 'burns',
              value: await client.nativeBurns()
            },
            {
              title: 'mints',
              value: await client.nativeMints()
            }
          ]
        },
        {
          title: 'validators',
          items: [
            {
              title: 'total',
              value: Object.keys(validators).length
            },
            {
              title: 'online',
              value: Object.values(validators).filter(({ lastSeen }) => lastSeen - new Date().getTime() < 60_000).length
            }
          ]
        },
        {
          title: 'contracts',
          items: [
            {
              title: 'total',
              value: (await client.contracts()).length
            },
            {
              title: 'registered',
              value: await client.staticCall(lookupFactory.address, 'totalContracts')
            },
            {
              title: 'native calls',
              value: await client.nativeCalls()
            }
          ]
        },
        {
          title: 'chain',
          items: [
            {
              title: 'blocks',
              value: await client.totalBlocks()
            },
            {
              title: 'transactions',
              value: await client.totalTransactions()
            },
            {
              title: 'size',
              value: formatBytes(await client.totalSize())
            }
          ]
        },
        {
          title: 'pool',
          items: [
            {
              title: 'transactions',
              value: await client.transactionsInPool()
            },
            {
              title: 'size',
              value: formatBytes(await client.transactionPoolSize())
            }
          ]
        },
        {
          title: 'network',
          items: [
            {
              title: 'tps',
              value: tps
            },
            {
              title: 'peers',
              value: (await client.peers()).length
            }
          ]
        }
      ]
    }

    async select(selected) {
      if (!customElements.get(`${selected}-view`)) await import(`./${selected}.js`)
      this.selected = selected
      this.shadowRoot.querySelector('custom-pages').select(selected)
    }

    setInfo(hash, index) {
      console.log(hash, index)
      this.shadowRoot.querySelector('custom-pages').querySelector('.custom-selected').updateInfo(hash, index)
    }

    _addBlock(block) {
      console.log(block)
      if (block.transactions.length > 25) {
        this.#transactions = block.transactions.slice(-25)
      } else {
        this.#transactions = [...block.transactions, ...this.#transactions.slice(-(block.transactions.length - 1))]
      }

      this.requestRender()
    }

    async connectedCallback() {
      this.#blocks = await client.blocks(-25)
      let i = 0
      while (this.#transactions.length < 25 && this.#blocks.length - 1 >= i) {
        this.#blocks[i] = new BlockMessage(new Uint8Array(Object.values(this.#blocks[i]))).decoded
        if (this.#blocks[i].transactions.length < 25)
          this.#blocks[i].transactions.slice(0, this.#blocks[i].transactions.length - 1)
        this.#transactions = [...this.#transactions, ...this.#blocks[i].transactions.slice(-25)]
        i++
      }

      this.updateInfo()

      client.pubsub.subscribe('add-block', this._addBlock)
      client.pubsub.subscribe('block-processed', this._addBlock)
    }

    render() {
      return html`
        <style>
          :host {
            display: flex;
            flex-direction: column;
            width: 100%;
            height: 100%;
            align-items: center;
            justify-content: center;
            overflow-y: auto;
            padding: 12px;
            box-sizing: border-box;
          }

          hero-element {
            height: auto;
            max-height: none;
            max-width: 720px;
          }

          flex-wrap-evenly {
            padding: 48px;
            box-sizing: border-box;
            overflow-y: auto;
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

          explorer-info {
            margin-bottom: 6px;
            max-height: 126px;
            width: calc(100% / 2 - 3px);
          }

          @media (max-width: 721px) {
            hero-element {
              width: 100%;
            }
            :host {
              align-items: none;
              justify-content: none;
            }
          }
        </style>
        <hero-element>
          <flex-wrap-around>
            ${map(
              this.items,
              (item, index) =>
                html` <explorer-info title=${item.title} .items=${item.items} index=${index}></explorer-info> `
            )}
          </flex-wrap-around>
        </hero-element>
      `
    }
  }
)
