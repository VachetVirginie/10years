import { BrowserMultiFormatReader } from '@zxing/browser'

export async function scanOnce(video: HTMLVideoElement): Promise<string|null> {
  const codeReader = new BrowserMultiFormatReader()
  return new Promise((resolve, reject) => {
    codeReader.decodeFromVideoDevice(undefined, video, (res, err) => {
      if (res) {
        codeReader.reset()
        resolve(res.getText())
      } else if (err && (err as any).name === 'NotAllowedError') {
        codeReader.reset()
        reject(new Error('Accès caméra refusé'))
      }
    })
  })
}
