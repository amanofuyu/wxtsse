export type ContentType = {
  text: string
  type: 'text'
} | {
  image_url: {
    url: string
    detail?: 'auto' | 'low' | 'high' | undefined
  }
  type: 'image_url'
} | {
  input_audio: {
    data: string
    format: 'wav' | 'mp3'
  }
  type: 'input_audio'
}
