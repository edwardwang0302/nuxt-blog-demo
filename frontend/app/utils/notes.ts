import type { NoteSummary, NoteType } from '~/types/content'

export const noteTypeLabels: Record<NoteType, string> = {
  tool: '工具',
  repo: '仓库',
  experiment: '实验',
  article: '长文',
}

export const formatNoteMeta = (note: Pick<NoteSummary, 'type' | 'date'>): string =>
  `${noteTypeLabels[note.type]} · ${note.date}`
