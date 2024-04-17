import { css, html, LitElement } from 'lit'
import './child.js'
import { customElement, property } from 'lit/decorators.js'
import { NotificationChild } from './child.js'
import '@vandeurenglenn/lite-elements/icon.js'
import '@vandeurenglenn/lite-elements/pane.js'
import '@vandeurenglenn/flex-elements/row.js'

@customElement('notification-master')
export class NotificationMaster extends LitElement {
  @property({ type: Boolean, reflect: true })
  accessor open: boolean

  get #list() {
    return this.shadowRoot.querySelector('.list')
  }

  createNotification({ title, message }: { title: string; message: string }, timeout: EpochTimeStamp = 3000) {
    const notification = document.createElement('notification-child') as NotificationChild
    notification.title = title
    notification.message = message
    if (timeout) {
      setTimeout(() => {
        this.removeChild(notification)
        const _notification = document.createElement('notification-child') as NotificationChild
        _notification.title = title
        _notification.message = message
        this.#list.appendChild(_notification)
        this.requestUpdate()
      }, timeout)
    }
    this.appendChild(notification)
  }

  #onclick() {
    const children = Array.from(this.#list.querySelectorAll('notification-child'))
    for (const child of children) {
      this.#list.removeChild(child)
    }
    this.open = false
  }

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      pointer-events: auto;
      z-index: 10001;
      position: absolute;
      right: 0;
      top: 0;
      overflow: hidden;
      width: 100%;
      max-width: 320px;
      height: auto;
      box-sizing: border-box;
      color: #eee;
      pointer-events: none;
      height: 100%;
    }

    :host([open]) {
      background: rgb(51, 55, 80);
    }

    .recents {
      display: block;
      position: relative;
      top: 12px;
      right: 12px;
      width: 100%;
      pointer-events: none;

      box-sizing: border-box;
      padding: 12px;
    }

    .list {
      padding: 24px;
      height: 100%;
    }

    custom-icon {
      pointer-events: auto;
    }
  `

  render() {
    return html`
      <flex-row style="margin-top: 12px;margin-right: 12px;">
        <flex-it></flex-it>
        <custom-icon
          icon="notifications"
          @click=${() => {
            if (this.#list.childElementCount === 0) return
            this.open = !this.open
          }}
        ></custom-icon>
      </flex-row>

      <span class="recents">
        <slot></slot>
      </span>

      <custom-pane ?open=${this.open} right top>
        <span slot="header"></span>
        <flex-column class="list" slot="content"> </flex-column>

        <flex-row slot="footer" width="100%">
          <flex-it></flex-it>
          <custom-icon style="margin-right: 24px;" icon="clear-all" @click="${this.#onclick}"></custom-icon>
        </flex-row>
      </custom-pane>
    `
  }
}
