import { handleContextMenus } from './contextMenus'
import { handleLogin } from './login'

export default defineBackground({
  main() {
    browser.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })

    console.log('Hello background!', { id: browser.runtime.id })

    browser.tabs.onActivated.addListener(({ tabId }) => {
      console.log('tabId', tabId)
    })

    handleLogin()
    handleContextMenus()
  },
})
