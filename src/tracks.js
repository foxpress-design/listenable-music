const RELEASE_BASE = 'https://github.com/foxpress-design/listenable-music/releases/download/music-v1'

export const albums = [
  {
    title: 'DJ Aia Mixes',
    type: 'mixes',
    tracks: [
      { title: 'Hearts and Minds Mix', year: '2004', duration: '1:14:20', src: `${RELEASE_BASE}/DJ.Aia.-.Hearts.and.Minds.Mix.-.2004.mp3` },
      { title: 'Listen With Aia', year: '2006', duration: '1:14:35', src: `${RELEASE_BASE}/DJ.Aia.-.Listen.With.Aia.-.2006.mp3` },
      { title: 'Expansive Mix', year: '2008', duration: '1:03:23', src: `${RELEASE_BASE}/DJ.Aia.-.Expansive.mix.-.2008.mp3` },
      { title: 'Promise Cherry Blossoms', year: '2009', duration: '0:53:22', src: `${RELEASE_BASE}/DJ.Aia.-.Promise.Cherry.Blossoms.-.2009.mp3` },
      { title: 'Harvest Festival', year: '2017', duration: '1:06:08', src: `${RELEASE_BASE}/DJ.Aia.-.Harvest.Festival.-.2017.mp3` },
    ],
  },
  {
    title: 'Nexus - Fable (1995)',
    type: 'album',
    tracks: [
      { title: 'Track 01', num: 1, duration: '3:58', src: '/music/nexus-fable/01 Track01.mp3' },
      { title: 'Track 02', num: 2, duration: '4:12', src: '/music/nexus-fable/02 Track02.mp3' },
      { title: 'Track 03', num: 3, duration: '2:57', src: '/music/nexus-fable/03 Track03.mp3' },
      { title: 'Track 04', num: 4, duration: '4:04', src: '/music/nexus-fable/04 Track04.mp3' },
      { title: 'Track 05', num: 5, duration: '5:31', src: '/music/nexus-fable/05 Track05.mp3' },
      { title: 'Track 06', num: 6, duration: '5:42', src: '/music/nexus-fable/06 Track06.mp3' },
      { title: 'Track 07', num: 7, duration: '3:51', src: '/music/nexus-fable/07 Track07.mp3' },
      { title: 'Track 08', num: 8, duration: '1:16', src: '/music/nexus-fable/08 Track08.mp3' },
      { title: 'Track 09', num: 9, duration: '5:29', src: '/music/nexus-fable/09 Track09.mp3' },
      { title: 'Track 10', num: 10, duration: '5:47', src: '/music/nexus-fable/10 Track10.mp3' },
    ],
  },
  {
    title: 'Nexus - Shiftless (1996)',
    type: 'album',
    tracks: [
      { title: 'Shiftless', num: 1, duration: '5:47', src: '/music/nexus-shiftless/James S. Campbell - 01 - Shiftless.mp3' },
      { title: 'Fragments', num: 2, duration: '4:09', src: '/music/nexus-shiftless/James S. Campbell - 02 - Fragments.mp3' },
      { title: 'Sources', num: 3, duration: '5:27', src: '/music/nexus-shiftless/James S. Campbell - 03 - Sources.mp3' },
      { title: 'Synthetic Orchestra 2', num: 4, duration: '4:38', src: '/music/nexus-shiftless/James S. Campbell - 04 - Synthetic Orchestra 2.mp3' },
      { title: 'Synthetic Orchestra 1', num: 5, duration: '4:14', src: '/music/nexus-shiftless/James S. Campbell - 05 - Synthetic Orchestra 1.mp3' },
      { title: 'Transcendance', num: 6, duration: '2:46', src: '/music/nexus-shiftless/James S. Campbell - 06 - Transcendance.mp3' },
      { title: 'Nicotine', num: 7, duration: '5:11', src: '/music/nexus-shiftless/James S. Campbell - 07 - Nicotine.mp3' },
      { title: 'Sources 2', num: 8, duration: '5:25', src: '/music/nexus-shiftless/James S. Campbell - 08 - Sources 2.mp3' },
      { title: 'Fundamentals', num: 9, duration: '5:12', src: '/music/nexus-shiftless/James S. Campbell - 09 - Fundamentals.mp3' },
    ],
  },
  {
    title: 'Singles & Other Works',
    type: 'singles',
    tracks: [
      { title: 'Solace', year: '2002', duration: '2:26', src: '/music/Solace (2002).mp3' },
      { title: 'Gatwick Drones - Rotor', duration: '2:50', src: '/music/Gatwick Drones - Rotor.mp3' },
      { title: 'Shiftless (Test Remaster)', duration: '5:47', src: '/music/01 Shiftless (Test Remaster).mp3' },
    ],
  },
]

export const allTracks = albums.flatMap((album, albumIdx) =>
  album.tracks.map((track, trackIdx) => ({ ...track, albumIdx, trackIdx, albumTitle: album.title }))
)
