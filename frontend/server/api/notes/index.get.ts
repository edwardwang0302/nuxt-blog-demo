import { aggregateSeries, aggregateTags, loadContent, toNoteSummary } from '../../utils/content'

export default defineEventHandler(() => {
  const notes = loadContent({ contentDir: String(useRuntimeConfig().contentDir) })
  const summaries = notes.map(toNoteSummary)

  return {
    notes: summaries,
    tags: aggregateTags(summaries),
    series: aggregateSeries(summaries),
  }
})
