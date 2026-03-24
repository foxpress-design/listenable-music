import { useState, useRef } from 'react'

export default function SubmissionForm() {
  const [type, setType] = useState('memory')
  const [anonymous, setAnonymous] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [subscribe, setSubscribe] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [caption, setCaption] = useState('')
  const [story, setStory] = useState('')
  const [musicSource, setMusicSource] = useState('file')
  const [musicUrl, setMusicUrl] = useState('')
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [msg, setMsg] = useState(null)
  const fileRef = useRef(null)

  const isFileUpload = type === 'photo' || (type === 'music' && musicSource === 'file')
  const isMusicLink = type === 'music' && musicSource !== 'file'
  const accept = type === 'photo' ? 'image/*' : 'audio/*'

  function handleTypeChange(t) {
    setType(t)
    setFile(null)
    setStory('')
    setMusicUrl('')
    setMusicSource('file')
    if (fileRef.current) fileRef.current.value = ''
    setMsg(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!anonymous && (!name || !email)) return
    if (isFileUpload && !file) return
    if (isMusicLink && !musicUrl.trim()) return
    if (type === 'memory' && !story.trim()) return

    setUploading(true)
    setProgress(0)
    setMsg(null)

    const data = new FormData()
    data.append('type', type)
    data.append('name', anonymous ? 'Anonymous' : name)
    data.append('email', anonymous ? '' : email)
    if (!anonymous && subscribe) data.append('subscribe', 'true')
    data.append('caption', caption)
    if (isFileUpload) {
      data.append('file', file)
    } else if (isMusicLink) {
      data.append('musicSource', musicSource)
      data.append('musicUrl', musicUrl)
    } else {
      data.append('story', story)
    }

    try {
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
              reject(new Error(JSON.parse(xhr.responseText).error || 'Submission failed'))
            } catch {
              reject(new Error('Submission failed'))
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
      setStory('')
      setMusicUrl('')
      setFile(null)
      if (fileRef.current) fileRef.current.value = ''
    } catch (err) {
      setMsg({ ok: false, text: err.message })
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  const hasIdentity = anonymous || (name && email)
  const hasContent = isFileUpload ? !!file : isMusicLink ? musicUrl.trim().length > 0 : story.trim().length > 0
  const canSubmit = hasIdentity && hasContent && confirmed && !uploading

  return (
    <form className="submission-form" onSubmit={handleSubmit}>
      <div className="submission-types">
        <button
          type="button"
          className={`submission-type-btn${type === 'memory' ? ' active' : ''}`}
          onClick={() => handleTypeChange('memory')}
        >
          Share a Memory
        </button>
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
          Music / Video
        </button>
      </div>

      <div className="submission-fields">
        <label className="submission-anon">
          <input
            type="checkbox"
            checked={anonymous}
            onChange={(e) => setAnonymous(e.target.checked)}
            disabled={uploading}
          />
          Submit anonymously
        </label>

        {!anonymous && (
          <>
            <input
              className="submission-input"
              type="text"
              placeholder="Your name / DJ handle (or both)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={uploading}
            />
            <input
              className="submission-input"
              type="email"
              placeholder="Your email (not displayed)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={uploading}
            />
            <label className="submission-anon">
              <input
                type="checkbox"
                checked={subscribe}
                onChange={(e) => setSubscribe(e.target.checked)}
                disabled={uploading}
              />
              Notify me when new memories or content are added
            </label>
          </>
        )}

        {type === 'memory' && (
          <textarea
            className="submission-input submission-story"
            placeholder="Share your memory, story, or words about James..."
            value={story}
            onChange={(e) => setStory(e.target.value)}
            required
            disabled={uploading}
          />
        )}

        {type === 'music' && (
          <div className="submission-music-sources">
            {[
              { id: 'file', label: 'File' },
              { id: 'youtube', label: 'YouTube' },
              { id: 'spotify', label: 'Spotify' },
              { id: 'tidal', label: 'Tidal' },
            ].map(s => (
              <button
                key={s.id}
                type="button"
                className={`submission-source-btn${musicSource === s.id ? ' active' : ''}`}
                onClick={() => { setMusicSource(s.id); setFile(null); setMusicUrl(''); if (fileRef.current) fileRef.current.value = '' }}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}

        {type === 'photo' && (
          <input
            ref={fileRef}
            className="submission-input submission-file"
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0] || null)}
            required
            disabled={uploading}
          />
        )}

        {type === 'music' && musicSource === 'file' && (
          <input
            ref={fileRef}
            className="submission-input submission-file"
            type="file"
            accept="audio/*"
            onChange={(e) => setFile(e.target.files[0] || null)}
            required
            disabled={uploading}
          />
        )}

        {isMusicLink && (
          <input
            className="submission-input"
            type="url"
            placeholder={
              musicSource === 'youtube' ? 'YouTube URL (e.g. https://youtube.com/watch?v=...)' :
              musicSource === 'spotify' ? 'Spotify URL (e.g. https://open.spotify.com/track/...)' :
              'Tidal URL (e.g. https://tidal.com/browse/track/...)'
            }
            value={musicUrl}
            onChange={(e) => setMusicUrl(e.target.value)}
            required
            disabled={uploading}
          />
        )}

        <textarea
          className="submission-input submission-textarea"
          placeholder={type === 'memory' ? 'Title for your memory (optional)' : 'Caption (optional)'}
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          disabled={uploading}
        />

        <label className="submission-anon submission-disclaimer">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            disabled={uploading}
          />
          I confirm I have the right to share this content
        </label>

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
          disabled={!canSubmit}
        >
          {uploading ? `Submitting... ${progress}%` : 'Submit'}
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
