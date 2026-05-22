import charismDescriptionsText from '../opisy.txt?raw'

type CharismCardPrintViewProps = {
  charisms: readonly string[]
  backToTestUrl: string
}

type DescriptionEntry = {
  name: string | null
  text: string
}

type DescriptionSection = {
  title: string
  intro: string[]
  entries: DescriptionEntry[]
}

const isCategoryHeading = (line: string) => line.startsWith('Charyzmaty ') || line.endsWith('?')

const parseDescriptionEntry = (line: string): DescriptionEntry => {
  const separatorIndex = line.indexOf(':')

  if (separatorIndex === -1) {
    return {
      name: null,
      text: line,
    }
  }

  return {
    name: line.slice(0, separatorIndex).trim(),
    text: line.slice(separatorIndex + 1).trim(),
  }
}

const parseDescriptionSections = (rawText: string): DescriptionSection[] => {
  const lines = rawText.split('\n')
  const sections: DescriptionSection[] = []
  let currentSection: DescriptionSection | null = null

  lines.forEach((rawLine) => {
    const line = rawLine.trim()

    if (!line) {
      return
    }

    const isIndented = /^\s+/.test(rawLine)

    if (isCategoryHeading(line)) {
      currentSection = {
        title: line,
        intro: [],
        entries: [],
      }
      sections.push(currentSection)
      return
    }

    if (!currentSection) {
      currentSection = {
        title: 'Opisy charyzmatow',
        intro: [],
        entries: [],
      }
      sections.push(currentSection)
    }

    if (isIndented) {
      currentSection.entries.push(parseDescriptionEntry(line))
      return
    }

    currentSection.intro.push(line)
  })

  return sections
}

const normalizeForComparison = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ł/g, 'l')

const DESCRIPTION_NAME_TO_CHARISM: Record<string, string> = {
  administracja: 'Administracji',
  liderstwo: 'Liderski',
  dawanie: 'Dawania',
  zacheta: 'Zachęty',
  pomoc: 'Pomocy',
  goscinnosc: 'Gościnności',
  milosierdzie: 'Miłosierdzia',
  pasterski: 'Pasterski',
  celibat: 'Celibatu',
  'wiara (nadzwyczajna)': 'Wiary',
  misyjny: 'Misyjny',
  'dobrowolne ubostwo': 'Dobrowolnego ubóstwa',
  ewangelizacja: 'Ewangelizacji',
  proroctwo: 'Prorocki',
  nauczanie: 'Nauczania',
  uzdrowienie: 'Uzdrawiania',
  wstawiennictwo: 'Wstawiennictwa',
  wiedza: 'Wiedzy',
  madrosc: 'Mądrości/zrozumienia',
  rzemioslo: 'Rzemiosła',
  muzyka: 'Muzyki',
  pisanie: 'Pisania',
}

const mapDescriptionNameToCharism = (entryName: string | null): string | null => {
  if (!entryName) {
    return null
  }

  const normalizedName = normalizeForComparison(entryName)
  return DESCRIPTION_NAME_TO_CHARISM[normalizedName] ?? null
}

const getDescriptionSectionClassName = (sectionTitle: string) => {
  const normalizedTitle = normalizeForComparison(sectionTitle)
  const shouldKeepTogether = normalizedTitle.includes('stylu zycia')

  return shouldKeepTogether
    ? 'description-section description-section-keep-together'
    : 'description-section'
}

function CharismCardPrintView({ charisms, backToTestUrl }: CharismCardPrintViewProps) {
  const marksPerCharism = 14
  const customRowsCount = 6
  const descriptionSections = parseDescriptionSections(charismDescriptionsText)
  const generalRecognitionSection = descriptionSections.find((section) =>
    normalizeForComparison(section.title).startsWith('jak ogolnie rozpoznac charyzmat'),
  )
  const groupedDescriptionSections = descriptionSections.filter(
    (section) => section !== generalRecognitionSection,
  )
  const descriptionOrder = groupedDescriptionSections
    .flatMap((section) => section.entries)
    .map((entry) => mapDescriptionNameToCharism(entry.name))
    .filter((charism): charism is string => Boolean(charism))
  const orderedCharisms = descriptionOrder.filter((charism) => charisms.includes(charism))
  const rowCount = Math.ceil(orderedCharisms.length / 2)
  const firstColumnCharisms = orderedCharisms.slice(0, rowCount)
  const secondColumnCharisms = orderedCharisms.slice(rowCount)

  return (
    <main className="app print-app">
      <header className="header print-header">
        <p className="eyebrow">Karta rozeznania we wspolnocie</p>
        <h1>Charyzmaty widziane u danej osoby</h1>
        <p className="description">
          Wpisz imie osoby, a nastepnie postaw X przy charyzmacie, ktory widzisz w jej zyciu.
        </p>

        <div className="print-meta">
          <div className="print-line-field">
            <span>Imie i nazwisko osoby:</span>
            <span className="line" aria-hidden="true"></span>
          </div>
        </div>

        <div className="view-actions no-print">
          <button type="button" className="view-link print-button" onClick={() => window.print()}>
            Drukuj / zapisz do PDF
          </button>
          <a className="view-link" href={backToTestUrl}>
            Wroc do testu
          </a>
        </div>
      </header>

      <section className="print-table-section">
        <table className="print-charism-table" role="table" aria-label="Karta charyzmatow">
          <tbody>
            {Array.from({ length: rowCount }).map((_, rowIndex) => (
              <tr key={`row-${rowIndex}`}>
                {[firstColumnCharisms[rowIndex], secondColumnCharisms[rowIndex]].map((charism, columnIndex) => (
                  <td key={`cell-${rowIndex}-${columnIndex}`} className="print-charism-cell">
                    {charism ? (
                      <div className="print-charism-item">
                        <span className="print-charism-name">{charism}</span>
                        <span className="print-mark-list" aria-hidden="true">
                          {Array.from({ length: marksPerCharism }).map((__, markIndex) => (
                            <span key={`mark-${rowIndex}-${columnIndex}-${markIndex}`} className="print-mark-box"></span>
                          ))}
                        </span>
                      </div>
                    ) : (
                      <div className="print-charism-item empty" aria-hidden="true"></div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <div className="custom-charisms-block" aria-label="Dodatkowe charyzmaty">
          <p className="custom-charisms-title">Dodatkowe charyzmaty (dopisz):</p>
          <table className="print-charism-table custom-charism-table" role="table" aria-label="Miejsce na dodatkowe charyzmaty">
            <tbody>
              {Array.from({ length: customRowsCount }).map((_, index) => (
                <tr key={`custom-row-${index}`}>
                  <td className="print-charism-cell custom-charism-cell">
                    <div className="print-charism-item">
                      <span className="print-charism-name custom-charism-line" aria-hidden="true"></span>
                      <span className="print-mark-list" aria-hidden="true">
                        {Array.from({ length: marksPerCharism }).map((__, markIndex) => (
                          <span key={`custom-mark-left-${index}-${markIndex}`} className="print-mark-box"></span>
                        ))}
                      </span>
                    </div>
                  </td>
                  <td className="print-charism-cell custom-charism-cell">
                    <div className="print-charism-item">
                      <span className="print-charism-name custom-charism-line" aria-hidden="true"></span>
                      <span className="print-mark-list" aria-hidden="true">
                        {Array.from({ length: marksPerCharism }).map((__, markIndex) => (
                          <span key={`custom-mark-right-${index}-${markIndex}`} className="print-mark-box"></span>
                        ))}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {generalRecognitionSection ? (
        <section className="print-general-recognition" aria-label={generalRecognitionSection.title}>
          <h2>{generalRecognitionSection.title}</h2>

          {generalRecognitionSection.intro.map((paragraph) => (
            <p key={paragraph} className="description-intro">
              {paragraph}
            </p>
          ))}

          {generalRecognitionSection.entries.length > 0 ? (
            <ul className="description-list print-general-recognition-list">
              {generalRecognitionSection.entries.map((entry) => (
                <li
                  key={`${generalRecognitionSection.title}-${entry.name ?? 'entry'}-${entry.text.slice(0, 40)}`}
                  className="description-entry"
                >
                  {entry.name ? <strong className="description-entry-name">{entry.name}:</strong> : null}{' '}
                  <span>{entry.text}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}

      <section className="print-descriptions-page" aria-label="Opisy charyzmatow">
        <h2>Opisy charyzmatow</h2>
        <div className="description-grid">
          {groupedDescriptionSections.map((section) => (
            <article key={section.title} className={getDescriptionSectionClassName(section.title)}>
              <h3>{section.title}</h3>

              {section.intro.map((paragraph) => (
                <p key={paragraph} className="description-intro">
                  {paragraph}
                </p>
              ))}

              {section.entries.length > 0 ? (
                <ul className="description-list">
                  {section.entries.map((entry) => (
                    <li
                      key={`${section.title}-${entry.name ?? 'entry'}-${entry.text.slice(0, 40)}`}
                      className="description-entry"
                    >
                      {entry.name ? <strong className="description-entry-name">{entry.name}:</strong> : null}{' '}
                      <span>{entry.text}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

export default CharismCardPrintView
