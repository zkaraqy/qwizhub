// Type definitions for Research Assistant features

// Variable types
export type VariableType = 'independent' | 'dependent' | 'moderating' | 'intervening' | 'control'

export interface ResearchVariable {
  id: string
  questionnaireId: string
  variableName: string
  description: string | null
  variableType: VariableType
  orderIndex: number
  createdAt: string
  updatedAt: string
  indicators?: VariableIndicator[]
}

// Indicator types
export type IndicatorSource = 'manual' | 'ai_generated'
export type IndicatorStatus = 'pending' | 'accepted' | 'rejected'

export interface VariableIndicator {
  id: string
  variableId: string
  indicatorText: string
  description: string | null
  source: IndicatorSource
  status: IndicatorStatus
  orderIndex: number
  createdAt: string
  updatedAt: string
  variable?: ResearchVariable
}

// Question enhancement types
export interface QuestionReviewIssue {
  detected: boolean
  note: string | null
}

export interface QuestionReview {
  hasIssues: boolean
  score: number
  issues: {
    bias: QuestionReviewIssue
    ambiguity: QuestionReviewIssue
    doubleBarreled: QuestionReviewIssue
    redundancy: QuestionReviewIssue
    optionIssues: QuestionReviewIssue
  }
  overallAssessment: string
}

export interface RewriteSuggestion {
  questionText: string
  questionType: string
  scaleType?: string | null
  options?: Array<{ value: string; label: string }>
  rationale: string
  version: string
}

export interface ScaleRecommendation {
  recommendedScale: string
  reason: string
  rationale: string
  scaleType: string
}

export interface QuestionRewrite {
  rewrites: RewriteSuggestion[]
  scaleRecommendation?: ScaleRecommendation
}

// Form data types
export interface CreateVariableData {
  variableName: string
  description?: string
  variableType: VariableType
}

export interface UpdateVariableData {
  name?: string
  description?: string
  variableType?: VariableType
}

export interface CreateIndicatorData {
  indicatorText: string
  description?: string
}

export interface UpdateIndicatorData {
  indicatorText?: string
  description?: string
}

export interface GenerateIndicatorsData {
  count: number
}

// Labels and helpers
export const VARIABLE_TYPE_LABELS: Record<VariableType, string> = {
  independent: 'Variabel Independen (X)',
  dependent: 'Variabel Dependen (Y)',
  moderating: 'Variabel Moderating (Z)',
  intervening: 'Variabel Intervening',
  control: 'Variabel Kontrol'
}

export const VARIABLE_TYPE_DESCRIPTIONS: Record<VariableType, string> = {
  independent: 'Variabel yang mempengaruhi variabel lain',
  dependent: 'Variabel yang dipengaruhi oleh variabel lain',
  moderating: 'Variabel yang memperkuat/memperlemah hubungan',
  intervening: 'Variabel perantara dalam hubungan kausal',
  control: 'Variabel yang dikontrol dalam penelitian'
}

export const INDICATOR_STATUS_LABELS: Record<IndicatorStatus, string> = {
  pending: 'Menunggu Review',
  accepted: 'Diterima',
  rejected: 'Ditolak'
}

export const INDICATOR_SOURCE_LABELS: Record<IndicatorSource, string> = {
  manual: 'Manual',
  ai_generated: 'AI Generated'
}

export function getVariableTypeLabel(type: VariableType): string {
  return VARIABLE_TYPE_LABELS[type] || type
}

export function getVariableTypeDescription(type: VariableType): string {
  return VARIABLE_TYPE_DESCRIPTIONS[type] || ''
}

export function getIndicatorStatusLabel(status: IndicatorStatus): string {
  return INDICATOR_STATUS_LABELS[status] || status
}

export function getIndicatorSourceLabel(source: IndicatorSource): string {
  return INDICATOR_SOURCE_LABELS[source] || source
}

export function getQualityScoreColor(score: number): string {
  if (score >= 8) return 'success'
  if (score >= 6) return 'warning'
  return 'danger'
}

export function getQualityScoreLabel(score: number): string {
  if (score >= 8) return 'Sangat Baik'
  if (score >= 6) return 'Cukup Baik'
  if (score >= 4) return 'Perlu Perbaikan'
  return 'Buruk'
}
