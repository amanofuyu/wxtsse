<script lang="ts" setup>
import type { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
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

    for await (const chunk of completion) {
      console.log(chunk)

      aiMessage.content = (aiMessage.content || '') + (chunk.choices[0].delta.content || '')
    }
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
  <div class="flex flex-col gap-4 h-screen max-h-screen p-2 text-base">
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
      <textarea v-model="userMessage" class="d-textarea d-textarea-ghost !bg-transparent !outline-none w-full resize-none" @keypress.enter="chatByEnter" />

      <div class="flex">
        <button class="d-btn d-btn-primary d-btn-sm ml-auto" @click="chat()">
          回复
        </button>
      </div>
    </label>
  </div>
</template>

<style scoped>

</style>
