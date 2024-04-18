import { LitElement, css, html } from 'lit'
import './../array-repeat.js'
import * as uEmojiParser from 'universal-emoji-parser'
import { customElement, property } from 'lit/decorators.js'

@customElement('emo-ji')
export class EmoJi extends LitElement {
  @property({ type: String })
  accessor emoji

  static get styles() {
    return css`
      :host {
        display: inline-flex;
        /* width: 28px; */

        font-size: 24px;
        cursor: pointer;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        padding: 4px;
      }
      ::slotted(*),
      slot {
        pointer-events: none;
      }

      ::slotted(img) {
        width: 32px;
        height: 32px;
      }
    `
  }

  render() {
    return html` <slot></slot>`
  }
}

@customElement('emoji-selector')
export class EmojiSelector extends HTMLElement {
  get _pages() {
    return this.shadowRoot.querySelector('custom-pages')
  }
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.render()
  }
  async connectedCallback() {
    this._select = this._select.bind(this)
    this.shadowRoot.querySelector('custom-tabs').addEventListener('selected', this._select)
    this.addEventListener('click', (event) => {
      const paths = event.composedPath()
      if (paths[0].localName === 'emo-ji') {
        this.dispatchEvent(new CustomEvent('emoji-selected', { detail: paths[0].emoji }))
      }
    })
    const supportedEmojiVersion = this.getSupportedEmojiVersion()
    const _emojis = (await import('./../../node_modules/unicode-emoji-json/data-by-group.json')).default
    const emojis = {}

    for (const entry of Object.entries(_emojis)) {
      emojis[entry[0]] = entry[1].filter((emoji) => Number(emoji.unicode_version) <= supportedEmojiVersion)
    }

    globalThis.emojis = emojis
    // const emojis = await self._parseEmojis()
    // await this._buildPages(globalThis.emojis)

    this.shadowRoot.querySelector('custom-tabs').querySelector('[data-route="Smileys & Emotion"]').click()
  }

  _initPage(category, itemsLength) {
    const page = document.createElement('span')

    page.classList.add('page')
    page.dataset.route = category
    const height = `${(itemsLength / 8) * 50}px`

    page.innerHTML = `
      <array-repeat max="48" height="${height}">
        <template>
        <emo-ji title="[[item.name]]" emoji="[[item.emoji]]" name="[[item.name]]" slug="[[item.slug]]">
          [[item.img]]
        </emo-ji>
        </template>
      </array-repeat>
      `
    this._pages.appendChild(page)
    return page
  }

  getSupportedEmojiVersion() {
    if (navigator.userAgent.includes('Windows NT 10.0')) {
      return 12
    }
    return 15
  }

  _select({ detail }) {
    console.log({ detail })

    const route = detail.getAttribute('data-route')
    if (!this.shadowRoot.querySelector(`span[data-route="${route}"]`)) {
      const page = this._initPage(route, globalThis.emojis[route].length)

      this._pages.select(route)
      globalThis.emojis[route].map((emoji) => {
        emoji.img = uEmojiParser.parse(`:${emoji.slug}:`).replace('<img', '<img loading="lazy"')
        return emoji
      })

      page.querySelector('array-repeat').items = globalThis.emojis[route]
    } else this._pages.select(route)
  }
  render() {
    this.shadowRoot.innerHTML = `
    <style>
      :host {
        display: flex;
        flex-direction: column;
        height: 360px;
        width: 416px;
        align-items: center;
        border-radius: 20px;
        font-family: emoji;
        box-shadow: 0 3px 4px 0 rgba(0, 0, 0, 0.14), 0 1px 8px 0 rgba(0, 0, 0, 0.12), 0 3px 3px -2px rgba(0, 0, 0, 0.4);
      }
      custom-tab, custom-tabs {
        box-sizing: border-box;
        outline: none;
      }
      custom-tab {
        width: 40px;
        align-items: center;
        justify-content: center;
        display: flex;
        cursor: pointer;
      }
      custom-tabs {
        display: flex;
        justify-content: center
      }
      custom-pages {
        height: 100%;
        
        max-width: 960px;
        margin-bottom: 12px;
        
      }
      .page {
        display: flex;
        justify-content: center;
        align-content: center;
        box-sizing: border-box;
      }
      custom-icon {
        pointer-events: none;
      }

      emo-ji {
        width: 50px;
        height: 50px;
        font-size: 24px;

      }
      /* width */
      ::-webkit-scrollbar {
        width: 10px;
        border-radius: 12px;
      }

      /* Track */
      ::-webkit-scrollbar-track {
        background: #f1f1f166;
        border-radius: 12px;
      }

      /* Handle */
      ::-webkit-scrollbar-thumb {
        background: #888;
        border-radius: 12px;
      }

      /* Handle on hover */
      ::-webkit-scrollbar-thumb:hover {
        background: #555;
      }
    </style>
    <custom-pages attr-for-selected="data-route">
      <span class="page" data-route="history"></span>
    </custom-pages>
    <custom-tabs selected="history" id="tabs" tabindex="0" attr-for-seleced="data-route" default-selected="history" round>
      <custom-tab data-route="history" title="history"><custom-icon icon="history"></custom-icon></custom-tab>      
      <custom-tab data-route="Smileys & Emotion" title="Smileys & Emotion"><custom-icon icon="mood"></custom-icon></custom-tab>
      <custom-tab data-route="People & Body" title="People & Body"><custom-icon icon="people"></custom-icon></custom-tab>
      <custom-tab data-route="Animals & Nature" title="Animals & Nature"><custom-icon icon="local-florist"></custom-icon></custom-tab>
      <custom-tab data-route="Food & Drink" title="Food & Drink"><custom-icon icon="local-pizza"></custom-icon></custom-tab>
      <custom-tab data-route="Objects" title="Objects"><custom-icon icon="cake"></custom-icon></custom-tab>
      <custom-tab data-route="Activities" title="Activities"><custom-icon icon="directions-walk"></custom-icon></custom-tab>
      <custom-tab data-route="Travel & Places" title="Travel & Places"><custom-icon icon="account-balance"></custom-icon></custom-tab>
      <custom-tab data-route="Symbols" title="Symbols"><custom-icon icon="euro-symbol"></custom-icon></custom-tab>
      <custom-tab data-route="Flags" title="Flags"><custom-icon icon="flags"></custom-icon></custom-tab>
    </custom-tabs>
    `
  }
}
