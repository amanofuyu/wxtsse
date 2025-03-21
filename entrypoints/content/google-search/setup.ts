import type { ContentScriptContext } from 'wxt/client'
import { createApp } from 'vue'
import GoogleSearch from './index.vue'

export function setupGoogleSearch(ctx: ContentScriptContext) {
  const href = window.location.href

  if (href.match(/google.*?\/search/)) {
    createGoogleSearchUi(ctx)
  }
}

async function createGoogleSearchUi(ctx: ContentScriptContext) {
  const ui = await createShadowRootUi(ctx, {
    name: 'wxt-search',
    position: 'inline',
    anchor: '#rhs',
    append: 'first',
    onMount: (container) => {
      const app = createApp(GoogleSearch)
      app.mount(container)
      return app
    },
    onRemove: (app) => {
      app?.unmount()
    },
  })

  console.log('ui', ui)

  ui.mount()

  const target = document.querySelector('#rhs')
  console.log('target', target)

  if (target) {
    const observer = new MutationObserver(() => {
      const first = target.firstElementChild
      if (first !== ui.shadowHost) {
        // console.log('back', first, ui.shadowHost)
        target.insertAdjacentElement('afterbegin', ui.shadowHost)
      }
    })

    observer.observe(target, {
      childList: true,
    })
  }
}
