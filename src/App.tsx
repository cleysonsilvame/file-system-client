import { ZipWriter } from '@zip.js/zip.js'
import axios from 'axios'
import { useState } from 'react'
import { trackProgress } from './utils'

const ZIPPED_DIR = 'zipped-files'

function App() {
  const [progressMessages, setProgressMessages] = useState<string[]>([])

  async function handleInputChange(files: FileList) {
    const rootDir = await navigator.storage.getDirectory()

    try {
      if (files.length === 0) {
        console.error('Nenhum arquivo selecionado.')
        return
      }

      const totalOfBytes = [...files].reduce(
        (acc, file) => (acc += file.size),
        0
      )
      const estimation = await navigator.storage.estimate()

      if (totalOfBytes > estimation.quota!) {
        throw new Error(
          `Sem espaço para converter os arquivos em ZIP, por favor, limpe o computador para liberar espaço (${
            totalOfBytes / 1e9
          } MB)`
        )
      }

      handleProgressMessage(`Espaço usado: (${estimation.usage! / 1e9} MB)`)

      const zippedDir = await rootDir.getDirectoryHandle(ZIPPED_DIR, {
        create: true,
      })

      const zipFileHandler = await zippedDir.getFileHandle('demand_id.zip', {
        create: true,
      })

      const zipStream = await zipFileHandler.createWritable()

      handleProgressMessage('CRIAÇÃO DO ZIP INICIADA!')
      const zipWriter = new ZipWriter(zipStream)

      const promises = Array.from(files).map(file =>
        zipWriter.add(file.name, file.stream())
      )

      await trackProgress(promises, progress => {
        handleProgressMessage(`Processando arquivo em ZIP: ${progress}%`)
      })
      await zipWriter.close()

      await getFile()
    } catch (error: any) {
      alert(error.message)
      await rootDir.removeEntry(ZIPPED_DIR, { recursive: true })
    }
  }

  async function getFile() {
    const rootDir = await navigator.storage.getDirectory()
    try {
      const zippedDir = await rootDir.getDirectoryHandle(ZIPPED_DIR)
      const fileZip = await zippedDir.getFileHandle('demand_id.zip')
      const file = await fileZip.getFile()

      handleProgressMessage('UPLOAD DO ARQUIVO ZIP INICIADO!')

      const formData = new FormData()
      formData.append('demand_id.zip', file)

      await axios.post('http://localhost:3001/', formData, {
        params: { ext: '.zip', temp: true },
        onUploadProgress(progressEvent) {
          handleProgressMessage(
            `Enviando arquivo em ZIP: ${Math.round(
              progressEvent.progress! * 100
            )}%`
          )
        },
      })

      await rootDir.removeEntry(ZIPPED_DIR, { recursive: true })
    } catch (error: any) {
      alert(error.message)
      await rootDir.removeEntry(ZIPPED_DIR, { recursive: true })
    }
  }

  function handleProgressMessage(message: string) {
    setProgressMessages(state => {
      if (state.includes(message)) return state

      return [...state.slice(-10), message]
    })
  }

  return (
    <div>
      <input
        type='file'
        multiple
        onChange={e => e.target.files && handleInputChange(e.target.files)}
      />
      <button onClick={getFile}>get file</button>
      {progressMessages.map(message => {
        return <p key={message}>{message}</p>
      })}
    </div>
  )
}

export default App
