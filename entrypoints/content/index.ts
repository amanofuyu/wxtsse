import { setupGoogleSearch } from './google-search/setup'
import '@/assets/global.css'
import './style.css'

export default defineContentScript({
  matches: ['*://*/*'],
  cssInjectionMode: 'ui',
  async main(ctx) {
    console.log('Hello content.')
    setupGoogleSearch(ctx)
  },
})
