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

function splitString(str: string, to: number) {
  const subStrLength = Math.max(Math.ceil(str.length / to), 1)
  const res: string[] = []

  for (let i = 0; i < str.length; i += subStrLength) {
    res.push(str.slice(i, i + subStrLength))
  }

  return res
}

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
      write(chunk) {
        console.log('[write]', chunk)
        aiMessage.content = (aiMessage.content || '') + (chunk || '')
      },
      close() {
        console.log('[close]')
      },
      abort(reason) {
        console.log('[abort]', reason)
      },
    })

    const transformStream = new TransformStream({
      transform(chunk, controller) {
        console.log('[transform]', chunk)

        const value = JSON.parse(chunk) as ChatCompletionChunk

        const content = value.choices[0].delta.content || ''

        const strs = splitString(content, 2)

        strs.forEach((str) => {
          controller.enqueue(str)
        })
      },
      flush(controller) {
        console.log('[flush]')
        // 终止转换，转换结束
        controller.terminate()
      },
    })

    completion.toReadableStream().pipeThrough(new TextDecoderStream('utf-8')).pipeThrough(transformStream).pipeTo(writeableStream)

    // const reader = readableStream.getReader()

    // while (true) {
    //   const { done, value } = await reader.read()
    //   if (done) {
    //     console.log('数据读取完毕')
    //     break
    //   }
    //   console.log('数据块的原始值是:', value)
    //   aiMessage.content = (aiMessage.content || '') + (value || '')
    // }

    // for await (const chunk of completion) {
    //   console.log(chunk)

    //   aiMessage.content = (aiMessage.content || '') + (chunk.choices[0].delta.content || '')
    // }
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
  <div>
    <div class="flex flex-col gap-4 h-screen max-h-screen p-2 text-base max-w-3xl mx-auto">
      <div class="flex-1 overflow-y-auto overflow-x-hidden p-3">
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

      <label class="bg-base-300 rounded-md overflow-hidden p-2 m-2 flex flex-col gap-2">
        <textarea v-model="userMessage" class="d-textarea d-textarea-ghost !bg-transparent !outline-none w-full resize-none" @keypress.enter.prevent="chatByEnter" />

        <div class="flex">
          <button class="d-btn d-btn-primary d-btn-sm ml-auto" @click="chat()">
            回复
          </button>
        </div>
      </label>
    </div>
  </div>
</template>

<style scoped>

</style>
