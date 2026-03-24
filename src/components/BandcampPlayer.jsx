import { useState, useEffect } from 'react'

export default function BandcampPlayer() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeEmbed, setActiveEmbed] = useState(null)
  const [fallbackUrl, setFallbackUrl] = useState(null)

  useEffect(() => {
    fetch('/api/bandcamp/collection')
      .then(r => r.json())
      .then(data => {
        setItems(data.items || [])
        if (data.fallbackUrl) setFallbackUrl(data.fallbackUrl)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="bc-loading">Loading collection...</div>

  if (!items.length && fallbackUrl) {
    return null
  }

  if (!items.length) return null

  return (
    <div className="bc-player">
      <div className="bc-grid">
        {items.map((item, i) => (
          <button
            key={i}
            className={`bc-item ${activeEmbed === i ? 'active' : ''}`}
            onClick={() => setActiveEmbed(activeEmbed === i ? null : i)}
          >
            {item.artUrl && (
              <img src={item.artUrl} alt={item.title} className="bc-art" loading="lazy" />
            )}
            <div className="bc-info">
              <span className="bc-title">{item.title}</span>
              <span className="bc-artist">{item.artist}</span>
            </div>
          </button>
        ))}
      </div>

      {activeEmbed !== null && items[activeEmbed] && (
        <div className="bc-embed">
          <iframe
            src={`https://bandcamp.com/EmbeddedPlayer/${
              items[activeEmbed].type === 'a' ? 'album' : 'track'
            }=${items[activeEmbed].albumId || items[activeEmbed].trackId}/size=large/bgcol=0a0a0a/linkcol=00ff88/tracklist=true/transparent=true/`}
            seamless
            title={items[activeEmbed].title}
          />
        </div>
      )}
    </div>
  )
}
