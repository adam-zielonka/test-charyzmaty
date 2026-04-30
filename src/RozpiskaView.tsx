import { useEffect, useMemo, useState } from 'react'

type Chapter = {
  tag?: string
  Title: string
  'Video url': string
  'Duration in timestamp': string
}

type ChapterWithDate = Chapter & {
  date: Date
}

const PLAYLIST_URL = `${import.meta.env.BASE_URL}rozpiska/playlist.json`
const PLAYLIST_LINK =
  'https://www.youtube.com/playlist?list=PL6hgBhB7Elk-W9cVtuXaRbaCSuyVk6KFw'

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('pl-PL', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)

const nextWednesdayOrSaturday = (date: Date) => {
  const day = date.getDay()

  if (day === 3) {
    return new Date(date.getTime() + 3 * 24 * 60 * 60 * 1000)
  }

  if (day === 6) {
    return new Date(date.getTime() + 4 * 24 * 60 * 60 * 1000)
  }

  return date
}

const mapChaptersWithDates = (playlist: Chapter[]): ChapterWithDate[] => {
  const skipDate = new Date('2026-04-04').getTime()
  let nextDate = new Date('2026-03-04')

  return playlist.map((chapter) => {
    const date = new Date(nextDate.getTime())
    nextDate = nextWednesdayOrSaturday(new Date(nextDate.getTime()))

    if (nextDate.getTime() === skipDate) {
      nextDate = nextWednesdayOrSaturday(new Date(nextDate.getTime()))
    }

    return {
      ...chapter,
      date,
    }
  })
}

type RozpiskaViewProps = {
  backToTestUrl: string
}

function RozpiskaView({ backToTestUrl }: RozpiskaViewProps) {
  const [playlist, setPlaylist] = useState<Chapter[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    const controller = new AbortController()

    const loadPlaylist = async () => {
      try {
        const response = await fetch(PLAYLIST_URL, { signal: controller.signal })

        if (!response.ok) {
          throw new Error('Nie udalo sie pobrac playlisty.')
        }

        const data = (await response.json()) as Chapter[]
        setPlaylist(data)
        setStatus('ready')
      } catch {
        if (controller.signal.aborted) {
          return
        }

        setStatus('error')
      }
    }

    loadPlaylist()

    return () => {
      controller.abort()
    }
  }, [])

  const chaptersWithDates = useMemo(() => mapChaptersWithDates(playlist), [playlist])

  return (
    <main className="app">
      <header className="header">
        <p className="eyebrow">Plan formacji</p>
        <h1>Rozpoznaj swoj charyzmat</h1>
        <p className="description">Rozpiska odcinkow i materialow do przejscia krok po kroku.</p>
        <div className="view-actions">
          <a className="view-link" href={PLAYLIST_LINK} target="_blank" rel="noopener noreferrer">
            Playlista na YT
          </a>
          <a className="view-link" href={backToTestUrl}>
            Otworz test
          </a>
        </div>
      </header>

      {status === 'loading' && <section className="notes">Ladowanie playlisty...</section>}
      {status === 'error' && (
        <section className="notes">Nie udalo sie zaladowac playlisty. Sprobuj odswiezyc strone.</section>
      )}

      {status === 'ready' && (
        <section className="schedule-section">
          <h2>Rozpiska odcinkow</h2>
          <div className="chapters">
            {chaptersWithDates.map((chapter, index) => (
              <div key={`${chapter.Title}-${index}`}>
                {chapter.tag && (
                  <div className="chapter-tag">
                    <h3>{chapter.tag}</h3>
                  </div>
                )}

                <a
                  className="chapter-link"
                  href={`${chapter['Video url']}&list=PL6hgBhB7Elk-W9cVtuXaRbaCSuyVk6KFw`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="chapter">
                    <div className="info">
                      <div>{formatDate(chapter.date)}</div>
                      <div>{chapter['Duration in timestamp']}</div>
                    </div>
                    <div className="chapter-title">
                      <strong>{chapter.Title}</strong>
                    </div>
                  </div>
                </a>
              </div>
            ))}
          </div>

        </section>
      )}
    </main>
  )
}

export default RozpiskaView
