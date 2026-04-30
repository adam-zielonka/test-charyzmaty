import { useMemo, useState } from 'react'
import { answerScale, charisms, instructionText, introNotes, questions } from './testData'
import './App.css'

const QUESTIONS_PER_PAGE = 10

function App() {
  const [answers, setAnswers] = useState<(number | null)[]>(
    () => new Array(questions.length).fill(null),
  )
  const [page, setPage] = useState(0)

  const answeredCount = useMemo(
    () => answers.filter((answer) => answer !== null).length,
    [answers],
  )

  const progressPercent = Math.round((answeredCount / questions.length) * 100)
  const pageCount = Math.ceil(questions.length / QUESTIONS_PER_PAGE)
  const pageStart = page * QUESTIONS_PER_PAGE
  const pageQuestions = questions.slice(pageStart, pageStart + QUESTIONS_PER_PAGE)

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
    setAnswers(new Array(questions.length).fill(null))
    setPage(0)
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
            <li key={note}>{note.replace(/^\d+\.\s*/, '')}</li>
          ))}
        </ol>
      </section>

      <section className="scale">
        <h2>Skala odpowiedzi</h2>
        <ul>
          {answerScale.map((item) => (
            <li key={item.value}>
              <span className="value">{item.value}</span>
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
          <p>
            Strona {page + 1} z {pageCount}
          </p>
        </div>

        <div className="question-list">
          {pageQuestions.map((question, index) => {
            const absoluteIndex = pageStart + index

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
                        <span>{option.value}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              </article>
            )
          })}
        </div>

        <div className="pagination">
          <button type="button" onClick={() => setPage((currentPage) => Math.max(currentPage - 1, 0))} disabled={page === 0}>
            Poprzednia
          </button>
          <button
            type="button"
            onClick={() => setPage((currentPage) => Math.min(currentPage + 1, pageCount - 1))}
            disabled={page >= pageCount - 1}
          >
            Następna
          </button>
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

        <ol className="ranking">
          {ranking.map((item, index) => {
            const widthPercent = Math.round((item.score / maxPossibleScore) * 100)

            return (
              <li key={item.name} className={index < 3 ? 'highlighted' : ''}>
                <div className="ranking-main">
                  <span className="ranking-name">{item.name}</span>
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
