<script lang="ts" setup>
import type { ChatCompletionChunk, ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import OpenAI from 'openai'
import ChatContent from './chat-content.vue'

const openai = new OpenAI({
  apiKey: 'AIzaSyC0OiTaW6gbp97RnI5jzTyGxdBCNfdhMqg',
  baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
  dangerouslyAllowBrowser: true,
})

const userMessage = ref('')

const messages = reactive<Array<ChatCompletionMessageParam>>([{ role: 'system', content: 'You are a helpful assistant.' }])

const messagesWithoutSystem = computed(() => {
  return messages.filter(message => message.role !== 'system')
})

const isResponding = ref(false)

async function chat() {
  if (!userMessage.value) {
    return
  }

  isResponding.value = true

  messages.push({ role: 'user', content: userMessage.value })
  userMessage.value = ''

  try {
    const completion = await openai.chat.completions.create({
      model: 'gemini-2.0-flash',
      messages: toRaw(messages),
      stream: true,
    })

    const aiMessage = reactive({
      role: 'assistant',
      content: '',
    }) as ChatCompletionMessageParam

    messages.push(aiMessage)

    const writeableStream = new WritableStream({
      start() {
        console.log('[start]')
      },
      async write(chunk) {
        console.log('[write]', chunk)
        const { promise, resolve } = Promise.withResolvers<void>()

        requestAnimationFrame(() => {
          aiMessage.content = (aiMessage.content || '') + (chunk || '')
          resolve()
        })

        return promise
      },
      close() {
        console.log('[close]')
      },
      abort(reason) {
        console.log('[abort]', reason)
      },
    }, new CountQueuingStrategy({
      highWaterMark: 60,
    }))

    const transformStream = new TransformStream({
      transform(chunk, controller) {
        console.log('[transform]', chunk)

        const value = JSON.parse(chunk) as ChatCompletionChunk

        const content = value.choices[0].delta.content || ''

        console.log('[content]', content)

        // controller.enqueue(content)

        let i = 0
        const length = content.length
        const charsToShow = length > 100 ? 3 : (length > 30 ? 2 : 5)

        while (i < length) {
          // 这个desiredSize来自transformStream的readableStrategy
          console.log('[desiredSize]', controller.desiredSize)

          const hasBackpressure = typeof controller.desiredSize !== 'number' || controller.desiredSize < 0

          const endIndex = hasBackpressure ? length : i + charsToShow

          const str = content.slice(i, endIndex)

          controller.enqueue(str)

          i = endIndex
        }
      },
      flush(controller) {
        console.log('[flush]')
        // 终止转换，转换结束
        controller.terminate()
      },
    }, new CountQueuingStrategy({
      highWaterMark: 60,
    }), new CountQueuingStrategy({
      highWaterMark: 60,
    }))

    completion
      .toReadableStream()
      .pipeThrough(new TextDecoderStream('utf-8'))
      .pipeThrough(transformStream)
      .pipeTo(writeableStream)
  }
  catch (error) {
    console.error(error)
  }
  finally {
    isResponding.value = false
  }
}

async function chatByEnter(e: KeyboardEvent) {
  if (!e.shiftKey) {
    chat()
  }
}
</script>

<template>
  <div class="flex gap-2 bg-base-300 h-screen max-h-screen p-2 overflow-hidden">
    <main class="flex-1 bg-base-100 flex flex-col gap-4 rounded-xl p-2 text-base max-w-3xl mx-auto overflow-hidden">
      <div class="flex-1 overflow-y-auto overflow-x-hidden p-2">
        <div class="flex flex-col gap-6">
          <template v-for="message, i in messagesWithoutSystem" :key="i">
            <div v-if="message.role === 'user'" class="flex items-start justify-end gap-2">
              <div class="bg-base-200 rounded-md py-2 px-4 max-w-full overflow-hidden">
                <ChatContent :content="(message.content as string)" />
              </div>
            </div>
            <div v-if="message.role === 'assistant'" class="flex items-start gap-2">
              <div class="max-w-full overflow-hidden">
                <ChatContent :content="(message.content as string)" />
              </div>
            </div>
          </template>
        </div>
      </div>

      <label class="rounded-md overflow-hidden p-2 flex flex-col gap-2 border">
        <textarea v-model="userMessage" class="d-textarea d-textarea-ghost !bg-transparent !outline-none w-full resize-none" placeholder="请输入内容..." @keypress.enter.prevent="chatByEnter" />

        <div class="flex">
          <button class="d-btn d-btn-primary d-btn-sm ml-auto" @click="chat()">
            回复
          </button>
        </div>
      </label>
    </main>

    <aside class="w-10 p-1 flex flex-col justify-between">
      <div />

      <div class="flex flex-col gap-2">
        <div class="flex flex-col gap-2">
          <button class="w-full aspect-square rounded-full flex items-center justify-center cursor-pointer hover:bg-base-100" @click="browser.runtime.openOptionsPage()">
            设
          </button>

          <div className="bg-secondary text-secondary-content w-full aspect-square rounded-full flex items-center justify-center cursor-pointer" @click="browser.runtime.sendMessage({ action: 'openLoginWindow' })">
            <span class="font-bold">N</span>
          </div>
        </div>
      </div>
    </aside>
  </div>
</template>

<style scoped>

</style>
