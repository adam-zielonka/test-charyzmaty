import { useMemo, useState } from 'react'
import { answerScale, charismVideoLinks, charisms, instructionText, introNotes, questions } from './testData'
import './App.css'

const RESULT_PARAM = 'wynik'
const EMPTY_ANSWERS = new Array(questions.length).fill(null) as (number | null)[]

const decodeAnswersFromUrl = () => {
  if (typeof window === 'undefined') {
    return [...EMPTY_ANSWERS]
  }

  const encodedAnswers = new URLSearchParams(window.location.search).get(RESULT_PARAM)

  if (!encodedAnswers || encodedAnswers.length !== questions.length) {
    return [...EMPTY_ANSWERS]
  }

  if (!/^[0-4x]+$/.test(encodedAnswers)) {
    return [...EMPTY_ANSWERS]
  }

  return [...encodedAnswers].map((value) => (value === 'x' ? null : Number(value)))
}

const encodeAnswersForUrl = (values: (number | null)[]) =>
  values.map((value) => (value === null ? 'x' : value.toString())).join('')

function App() {
  const urlPattern = /https?:\/\/[^\s)]+/g

  const renderIntroNote = (note: string) => {
    const normalizedNote = note.replace(/^\d+\.\s*/, '')
    const noteParts = normalizedNote.split(urlPattern)
    const noteUrls = normalizedNote.match(urlPattern) ?? []

    return noteParts.flatMap((part, index) => {
      const url = noteUrls[index]

      if (!url) {
        return [part]
      }

      return [
        part,
        <a
          key={`${url}-${index}`}
          className="note-link"
          href={url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {url}
        </a>,
      ]
    })
  }

  const [answers, setAnswers] = useState<(number | null)[]>(decodeAnswersFromUrl)
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle')

  const answeredCount = useMemo(
    () => answers.filter((answer) => answer !== null).length,
    [answers],
  )

  const progressPercent = Math.round((answeredCount / questions.length) * 100)
  const shareLink = useMemo(() => {
    if (typeof window === 'undefined') {
      return ''
    }

    const nextUrl = new URL(window.location.href)
    nextUrl.searchParams.set(RESULT_PARAM, encodeAnswersForUrl(answers))
    return nextUrl.toString()
  }, [answers])

  const scores = useMemo(() => {
    const initialScores = Object.fromEntries(charisms.map((name) => [name, 0])) as Record<
      (typeof charisms)[number],
      number
    >

    answers.forEach((answer, index) => {
      if (answer === null) {
        return
      }

      const charismName = charisms[index % charisms.length]
      initialScores[charismName] += answer
    })

    return initialScores
  }, [answers])

  const ranking = useMemo(
    () =>
      charisms
        .map((name) => ({ name, score: scores[name] }))
        .sort((a, b) => b.score - a.score),
    [scores],
  )

  const maxPossibleScore = 20

  const handleAnswerChange = (questionIndex: number, value: number) => {
    setAnswers((currentAnswers) => {
      const nextAnswers = [...currentAnswers]
      nextAnswers[questionIndex] = value
      return nextAnswers
    })
  }

  const resetAnswers = () => {
    if (answeredCount > 0) {
      const shouldReset = window.confirm(
        'Czy na pewno chcesz wyczyścić wszystkie odpowiedzi? Tej operacji nie można cofnąć.',
      )

      if (!shouldReset) {
        return
      }
    }

    setAnswers([...EMPTY_ANSWERS])
    setCopyStatus('idle')
  }

  const handleCopyLink = async () => {
    if (!shareLink) {
      setCopyStatus('error')
      return
    }

    try {
      await navigator.clipboard.writeText(shareLink)
      setCopyStatus('copied')
    } catch {
      setCopyStatus('error')
    }
  }

  return (
    <main className="app">
      <header className="header">
        <p className="eyebrow">Kwestionariusz</p>
        <h1>Test Charyzmaty</h1>
        <p className="description">{instructionText}</p>
      </header>

      <section className="notes">
        <h2>Uwagi wstępne</h2>
        <ol>
          {introNotes.map((note) => (
            <li key={note}>{renderIntroNote(note)}</li>
          ))}
        </ol>
      </section>

      <section className="scale">
        <h2>Skala odpowiedzi</h2>
        <ul>
          {answerScale.map((item) => (
            <li key={item.value}>
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="progress-panel" aria-live="polite">
        <div>
          <p className="progress-title">Postęp</p>
          <p className="progress-subtitle">
            Odpowiedziano na {answeredCount} z {questions.length} pytań
          </p>
        </div>
        <div>
          <p className="progress-value">{progressPercent}%</p>
          <div className="progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progressPercent}>
            <span style={{ width: `${progressPercent}%` }}></span>
          </div>
        </div>
      </section>

      <section className="question-section">
        <div className="question-header">
          <h2>Pytania</h2>
          <p>Wszystkie pytania na jednej stronie</p>
        </div>

        <div className="question-list">
          {questions.map((question, absoluteIndex) => {
            return (
              <article className="question-card" key={`${absoluteIndex}-${question}`}>
                <p className="question-number">{absoluteIndex + 1}.</p>
                <p className="question-text">{question}</p>

                <fieldset>
                  <legend className="sr-only">Wybierz ocenę</legend>
                  <div className="answer-options">
                    {answerScale.map((option) => (
                      <label key={option.value}>
                        <input
                          type="radio"
                          name={`question-${absoluteIndex}`}
                          checked={answers[absoluteIndex] === option.value}
                          onChange={() => handleAnswerChange(absoluteIndex, option.value)}
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              </article>
            )
          })}
        </div>
      </section>

      <section className="results">
        <div className="results-header">
          <h2>Wynik</h2>
          <button type="button" onClick={resetAnswers}>
            Wyczyść odpowiedzi
          </button>
        </div>

        <p className="result-hint">
          Każdy charyzmat ma maksymalnie {maxPossibleScore} punktów (5 pytań x 4 punkty).
        </p>

        <div className="result-link-panel">
          <label htmlFor="result-link">Link do tego wyniku</label>
          <div className="result-link-row">
            <input id="result-link" type="text" value={shareLink} readOnly />
            <button type="button" onClick={handleCopyLink}>
              Kopiuj link
            </button>
          </div>
          <p className="result-link-status" aria-live="polite">
            {copyStatus === 'copied' && 'Link skopiowany do schowka.'}
            {copyStatus === 'error' && 'Nie udało się skopiować linku. Skopiuj go ręcznie z pola.'}
          </p>
        </div>

        <ol className="ranking">
          {ranking.map((item, index) => {
            const widthPercent = Math.round((item.score / maxPossibleScore) * 100)

            return (
              <li key={item.name} className={index < 3 ? 'highlighted' : ''}>
                <div className="ranking-main">
                  <a
                    className="ranking-name ranking-link"
                    href={charismVideoLinks[item.name]}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {item.name}
                  </a>
                  <span className="ranking-score">
                    {item.score}/{maxPossibleScore}
                  </span>
                </div>
                <div className="bar" aria-hidden="true">
                  <span style={{ width: `${widthPercent}%` }}></span>
                </div>
              </li>
            )
          })}
        </ol>
      </section>
    </main>
  )
}

export default App
