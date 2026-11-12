import type { NotesResponse } from '~/types/content'

export const useNotes = () => useFetch<NotesResponse>('/api/notes', { key: 'notes' })
