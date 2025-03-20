<script lang="ts" setup>
import type { ChatCompletionChunk, ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import type { ContentType } from './type'
import { Fsa } from '@/utils/Fsa'
import OpenAI from 'openai'
import ChatContent from './chat-content.vue'

const openai = new OpenAI({
  apiKey: 'AIzaSyC0OiTaW6gbp97RnI5jzTyGxdBCNfdhMqg',
  baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
  dangerouslyAllowBrowser: true,
})

const userMessage = ref('')

const messages = reactive<Array<ChatCompletionMessageParam>>([{ role: 'system', content: [
  {
    type: 'text',
    text: 'You are a helpful assistant.',
  },
] }])

const fileList = shallowRef<Array<string>>([])

const messagesWithoutSystem = computed(() => {
  return messages.filter(message => message.role !== 'system')
})

const isResponding = ref(false)

async function chat() {
  if (!userMessage.value) {
    return
  }

  isResponding.value = true

  const message = { role: 'user', content: [
    {
      type: 'text',
      text: userMessage.value,
    },
    ...fileList.value.map(content => ({
      type: 'image_url',
      image_url: {
        url: content,
      },
    })),
  ] } as ChatCompletionMessageParam

  messages.push(message)
  fileList.value = []
  userMessage.value = ''

  try {
    const completion = await openai.chat.completions.create({
      model: 'gemini-2.0-flash',
      messages: toRaw(messages),
      stream: true,
      // modalities: ['text', 'image'] as any,
    })

    const textContent = reactive({
      type: 'text',
      text: '',
    })

    const aiMessage = reactive({
      role: 'assistant',
      content: [textContent],
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
          textContent.text = (textContent.text || '') + (chunk || '')
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

function imageFileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

async function uploadImage() {
  const fileHandle = await Fsa.file()
  const file = await fileHandle.getFile()
  const base64 = await imageFileToBase64(file)
  fileList.value = [...fileList.value, base64]
}

async function generateImage() {
  console.log('generateImage')
}
</script>

<template>
  <div class="flex gap-2 bg-base-300 h-screen max-h-screen p-2 overflow-hidden">
    <main class="flex-1 bg-base-100 flex flex-col gap-4 rounded-xl p-2 text-base max-w-3xl mx-auto overflow-hidden">
      <div class="flex-1 overflow-y-auto overflow-x-hidden p-2">
        <div class="flex flex-col gap-6">
          <template v-for="message, i in messagesWithoutSystem" :key="i">
            <div v-if="message.role === 'user'" class="flex flex-col items-end justify-end gap-2">
              <div v-for="image in (message.content as ContentType[]).filter(item => item.type === 'image_url')" :key="image.image_url.url" class="w-20 rounded-md   overflow-hidden">
                <img class="w-full" :src="image.image_url.url" alt="">
              </div>

              <div class="bg-base-200 rounded-md py-2 px-4 max-w-full overflow-hidden">
                <ChatContent :content="(message.content as ContentType[]).find(item => item.type === 'text')!.text" />
              </div>
            </div>
            <div v-if="message.role === 'assistant'" class="flex items-start gap-2">
              <div class="max-w-full overflow-hidden">
                <ChatContent :content="(message.content as ContentType[]).find(item => item.type === 'text')!.text" />
              </div>
            </div>
          </template>
        </div>
      </div>

      <div class="rounded-md overflow-hidden p-2 flex flex-col gap-2 border">
        <div v-show="fileList.length > 0" class="grid grid-cols-4 gap-2">
          <div v-for="file, i in fileList" :key="i" class="aspect-square rounded-md overflow-hidden">
            <img :src="file" class="w-full h-full object-cover">
          </div>
        </div>

        <label class="flex flex-col gap-2">
          <textarea v-model="userMessage" class="d-textarea d-textarea-ghost !bg-transparent !outline-none w-full resize-none" placeholder="请输入内容..." @keypress.enter.prevent="chatByEnter" />

          <div class="flex justify-between items-center">
            <div>
              <button class="d-btn d-btn-primary d-btn-sm" @click="uploadImage()">上传</button>
            </div>

            <div class=" ml-auto">
              <button class="d-btn d-btn-primary d-btn-sm" @click="chat()">
                回复
              </button>
            </div>
          </div>
        </label>
      </div>
    </main>

    <aside class="w-10 p-1 flex flex-col justify-between">
      <div />

      <div class="flex flex-col gap-2">
        <div class="flex flex-col gap-2">
          <button class="w-full aspect-square rounded-full flex items-center justify-center cursor-pointer hover:bg-base-100" @click="generateImage()">
            点
          </button>

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
