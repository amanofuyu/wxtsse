import Shiki from '@shikijs/markdown-it'
import MarkdownIt from 'markdown-it'

export const md = MarkdownIt()

// eslint-disable-next-line antfu/no-top-level-await
md.use(await Shiki({
  themes: {
    dark: 'vitesse-dark',
  },
  defaultColor: 'dark',
}))
