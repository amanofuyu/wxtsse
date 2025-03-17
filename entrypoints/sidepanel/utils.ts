import { fromHighlighter } from '@shikijs/markdown-it/core'
import vitesseDark from '@shikijs/themes/vitesse-dark'
import MarkdownIt from 'markdown-it'
import { createHighlighterCoreSync } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'

const modules = import.meta.glob(['/node_modules/@shikijs/langs/dist/*.mjs', '!/node_modules/@shikijs/langs/dist/index.mjs'], {
  import: 'default',
  eager: true,
})

const highlighter = createHighlighterCoreSync({
  themes: [vitesseDark],
  langs: Object.values(modules) as any[],
  engine: createJavaScriptRegexEngine({ forgiving: true }),
})

export const md = MarkdownIt()

md.use(fromHighlighter(highlighter as any, {
  theme: 'vitesse-dark',
  fallbackLanguage: 'javascript',
}))
