export function trackEvent(eventName, params) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, params)
  }
}

export function trackPlay(track, albumTitle) {
  trackEvent('track_play', {
    track_title: track.title,
    album_name: albumTitle || '',
  })
}

export function trackDownload(track, albumTitle) {
  trackEvent('track_download', {
    track_title: track.title,
    album_name: albumTitle || '',
  })
}

export function trackAlbumDownload(albumTitle, trackCount) {
  trackEvent('album_download', {
    album_name: albumTitle,
    track_count: trackCount,
  })
}
