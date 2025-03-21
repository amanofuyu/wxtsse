import { handleLogin } from "./login"
import { handleContextMenus } from "./contextMenus"

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
