export default defineBackground(() => {
  browser.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })

  console.log('Hello background!', { id: browser.runtime.id })

  browser.tabs.onActivated.addListener(({ tabId }) => {
    console.log('tabId', tabId)
  })
})
