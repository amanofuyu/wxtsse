export default defineBackground(() => {
  console.log('Hello background!', { id: browser.runtime.id })

  browser.tabs.onUpdated.addListener(async (tabId, info, tab) => {
    if (!tab.url)
      return

    await browser.sidePanel.setOptions({
      tabId,
      path: 'sidepanel.html',
      enabled: true,
    })
  })
})
