// Type definitions for Questionnaire system

export type QuestionType = 
  | 'text' 
  | 'closed' 
  | 'mixed' 
  | 'likert' 
  | 'multiple_choice' 
  | 'checkbox' 
  | 'rating_scale' 
  | 'filter'
  | 'dropdown'

export type QuestionnaireStatus = 'draft' | 'published' | 'closed'

export type QuestionSource = 'manual' | 'ai_generated'

export interface QuestionOption {
  label: string
  value: string
}

export interface Question {
  id: string
  questionnaireId: string
  questionText: string
  questionType: QuestionType
  scaleType?: string | null
  options?: QuestionOption[]
  orderIndex: number
  source: QuestionSource
  biasDetected: boolean
  biasNotes?: string | null
  createdAt: string
  updatedAt: string
}

export interface Questionnaire {
  id: string
  projectId: string
  topic: string
  researchObjective: string
  variables?: any[]
  status: QuestionnaireStatus
  createdAt: string
  updatedAt: string
  questions?: Question[]
  project?: {
    id: string
    title: string
    description?: string
  }
}

export interface QuestionFormData {
  questionText: string
  questionType: QuestionType
  optionsInput: string
}

export interface PublishFormData {
  targetRespondents: number
  honorariumPerRespondent: number
}

export interface CreateQuestionnaireData {
  topic: string
  researchObjective: string
  variables?: any[]
}

export interface UpdateQuestionnaireData {
  topic?: string
  researchObjective?: string
  variables?: any[]
}

export interface CreateQuestionData {
  questionText: string
  questionType: QuestionType
  options?: QuestionOption[]
  questionnaireId: string
  source: QuestionSource
  scaleType?: string
}

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  text: 'Pertanyaan Terbuka',
  closed: 'Pertanyaan Tertutup',
  mixed: 'Pertanyaan Campuran',
  likert: 'Skala Likert',
  multiple_choice: 'Pertanyaan Pilihan Ganda',
  checkbox: 'Checklist',
  rating_scale: 'Pertanyaan Skala Peringkat',
  filter: 'Pertanyaan Filter',
  dropdown: 'Dropdown'
}

export function getQuestionTypeLabel(type: QuestionType): string {
  return QUESTION_TYPE_LABELS[type] || type
}

export function parseOptionsInput(input: string): QuestionOption[] {
  if (!input || !input.trim()) return []
  
  return input
    .split(',')
    .map(opt => ({
      label: opt.trim(),
      value: opt.trim().toLowerCase().replace(/\s+/g, '_')
    }))
    .filter(opt => opt.label.length > 0)
}
