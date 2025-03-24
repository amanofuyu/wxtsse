export function handleLogin() {
  chrome.runtime.onMessage.addListener(
    (request, sender, _sendResponse) => {
      if (request.action === 'openLoginWindow') {
        openLoginWindow()
      }
      // 监听登录完成消息
      if (request.action === 'loginSuccessful') {
        if (!sender.tab) {
          return
        }

        console.log(`Login successful from window with id: ${sender.tab?.windowId}`)
        // 处理登录后的逻辑，例如：

        // 1. 关闭登录窗口
        chrome.windows.remove(sender.tab.windowId)
        // 2. 保存登录状态到 storage
        chrome.storage.local.set({ isLoggedIn: true }, () => {
          console.log('Login state saved.')
        })
        // 3. 通知 popup 页面更新UI
        // ...
      }
    },
  )

  function openLoginWindow() {
    chrome.windows.create({
      url: 'https://account.gamsgo.com/', // 替换成你的登录页面 URL
      type: 'popup',
      width: 800, // 可选：设置窗口宽度
      height: 600, // 可选：设置窗口高度
    }, (window) => {
      // 可选：在新窗口创建后执行的操作
      console.log(`Login window created with id: ${window?.id}`)
    })
  }
}
