export type NoteType = 'tool' | 'repo' | 'experiment' | 'article'

export interface NoteSummary {
  slug: string
  title: string
  summary: string
  type: NoteType
  date: string
  tags: string[]
  series?: string
  repo?: string
  website?: string
}

export interface NoteDetail extends NoteSummary {
  html: string
}

export interface NoteDetailResponse {
  note: NoteDetail
}

export interface NotesResponse {
  notes: NoteSummary[]
  tags: Array<{ name: string; count: number }>
  series: Array<{ name: string; count: number; notes: NoteSummary[] }>
}
