import JSZip from 'jszip'
import { saveAs } from 'file-saver'

export async function downloadTrack(track) {
  const response = await fetch(track.src)
  const blob = await response.blob()
  const filename = track.src.split('/').pop()
  saveAs(blob, filename)
}

export async function downloadAlbum(album, onProgress) {
  const zip = new JSZip()
  const total = album.tracks.length

  for (let i = 0; i < total; i++) {
    const track = album.tracks[i]
    if (onProgress) onProgress(i + 1, total)
    const response = await fetch(track.src)
    const blob = await response.blob()
    const filename = track.src.split('/').pop()
    zip.file(filename, blob)
  }

  if (onProgress) onProgress(total, total, true)
  const content = await zip.generateAsync({ type: 'blob' })
  const safeName = album.title.replace(/[^a-zA-Z0-9 -]/g, '').replace(/\s+/g, '-')
  saveAs(content, `${safeName}.zip`)
}
