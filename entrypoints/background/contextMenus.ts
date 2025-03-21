export function handleContextMenus() {
  chrome.contextMenus.onClicked.addListener(genericOnClick)

  // A generic onclick callback function.
  function genericOnClick(info: chrome.contextMenus.OnClickData) {
    switch (info.menuItemId) {
      case 'radio':
      // Radio item function
        console.log('Radio item clicked. Status:', info.checked)
        break
      case 'checkbox':
      // Checkbox item function
        console.log('Checkbox item clicked. Status:', info.checked)
        break
      default:
      // Standard context menu item function
        console.log('Standard context menu item clicked.')
    }
  }

  // Create one test item for each context type.
  const contexts = [
    'page',
    'selection',
    'link',
    'editable',
    'image',
    'video',
    'audio',
  ] as chrome.contextMenus.ContextType[]

  for (let i = 0; i < contexts.length; i++) {
    const context = contexts[i]
    const title = `Test '${context}' menu item`
    chrome.contextMenus.create({
      title,
      contexts: [context],
      id: context,
    })
  }

  // Create a parent item and two children.
  const parent = chrome.contextMenus.create({
    title: 'Test parent item',
    id: 'parent',
  })
  chrome.contextMenus.create({
    title: 'Child 1',
    parentId: parent,
    id: 'child1',
  })
  chrome.contextMenus.create({
    title: 'Child 2',
    parentId: parent,
    id: 'child2',
  })

  // Create a radio item.
  chrome.contextMenus.create({
    title: 'radio',
    type: 'radio',
    id: 'radio',
  })

  // Create a checkbox item.
  chrome.contextMenus.create({
    title: 'checkbox',
    type: 'checkbox',
    id: 'checkbox',
  })

  // Intentionally create an invalid item, to show off error checking in the
  // create callback.
  chrome.contextMenus.create(
    { title: 'Oops', parentId: 999, id: 'errorItem' },
    () => {
      if (chrome.runtime.lastError) {
        console.log(`Got expected error: ${chrome.runtime.lastError.message}`)
      }
    },
  )
}
