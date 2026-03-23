import { useState, useRef } from 'react'

export default function SubmissionForm() {
  const [type, setType] = useState('photo')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [caption, setCaption] = useState('')
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [msg, setMsg] = useState(null)
  const fileRef = useRef(null)

  const accept = type === 'photo' ? 'image/*' : 'audio/*'

  function handleTypeChange(t) {
    setType(t)
    setFile(null)
    if (fileRef.current) fileRef.current.value = ''
    setMsg(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!file || !name || !email) return

    setUploading(true)
    setProgress(0)
    setMsg(null)

    const data = new FormData()
    data.append('type', type)
    data.append('name', name)
    data.append('email', email)
    data.append('caption', caption)
    data.append('file', file)

    try {
      // Use XHR to track upload progress
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('POST', '/api/submissions/upload')

        xhr.upload.addEventListener('progress', (ev) => {
          if (ev.lengthComputable) {
            setProgress(Math.round((ev.loaded / ev.total) * 100))
          }
        })

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText))
          } else {
            try {
              reject(new Error(JSON.parse(xhr.responseText).error || 'Upload failed'))
            } catch {
              reject(new Error('Upload failed'))
            }
          }
        })

        xhr.addEventListener('error', () => reject(new Error('Network error')))
        xhr.send(data)
      })

      setMsg({ ok: true, text: 'Thank you! Your submission will be reviewed.' })
      setName('')
      setEmail('')
      setCaption('')
      setFile(null)
      if (fileRef.current) fileRef.current.value = ''
    } catch (err) {
      setMsg({ ok: false, text: err.message })
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  return (
    <form className="submission-form" onSubmit={handleSubmit}>
      <div className="submission-types">
        <button
          type="button"
          className={`submission-type-btn${type === 'photo' ? ' active' : ''}`}
          onClick={() => handleTypeChange('photo')}
        >
          Share a Photo
        </button>
        <button
          type="button"
          className={`submission-type-btn${type === 'music' ? ' active' : ''}`}
          onClick={() => handleTypeChange('music')}
        >
          Share Music
        </button>
      </div>

      <div className="submission-fields">
        <input
          className="submission-input"
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={uploading}
        />
        <input
          className="submission-input"
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={uploading}
        />
        <input
          ref={fileRef}
          className="submission-input submission-file"
          type="file"
          accept={accept}
          onChange={(e) => setFile(e.target.files[0] || null)}
          required
          disabled={uploading}
        />
        <textarea
          className="submission-input submission-textarea"
          placeholder="Caption (optional)"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          disabled={uploading}
        />

        {uploading && progress > 0 && (
          <div className="submission-progress">
            <div
              className="submission-progress-bar"
              style={{ width: `${progress}%` }}
            />
            <span className="submission-progress-label">{progress}%</span>
          </div>
        )}

        <button
          type="submit"
          className="submission-submit"
          disabled={uploading || !file || !name || !email}
        >
          {uploading ? `Uploading... ${progress}%` : 'Submit'}
        </button>

        {msg && (
          <p className={`submission-msg ${msg.ok ? 'subscribe-success' : 'subscribe-error'}`}>
            {msg.text}
          </p>
        )}
      </div>
    </form>
  )
}
