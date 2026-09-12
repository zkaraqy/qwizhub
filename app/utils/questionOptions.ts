import type { QuestionOption, QuestionType } from '~/types/questionnaire'

/**
 * Get default options for Likert 5-point scale
 */
export function getDefaultLikert5Options(): QuestionOption[] {
  return [
    { value: '1', label: 'Sangat Tidak Setuju', score: 1 },
    { value: '2', label: 'Tidak Setuju', score: 2 },
    { value: '3', label: 'Netral', score: 3 },
    { value: '4', label: 'Setuju', score: 4 },
    { value: '5', label: 'Sangat Setuju', score: 5 }
  ]
}

/**
 * Get default options for Likert 7-point scale
 */
export function getDefaultLikert7Options(): QuestionOption[] {
  return [
    { value: '1', label: 'Sangat Tidak Setuju', score: 1 },
    { value: '2', label: 'Tidak Setuju', score: 2 },
    { value: '3', label: 'Agak Tidak Setuju', score: 3 },
    { value: '4', label: 'Netral', score: 4 },
    { value: '5', label: 'Agak Setuju', score: 5 },
    { value: '6', label: 'Setuju', score: 6 },
    { value: '7', label: 'Sangat Setuju', score: 7 }
  ]
}

/**
 * Get default options for Guttman scale
 */
export function getDefaultGuttmanOptions(): QuestionOption[] {
  return [
    { value: 'ya', label: 'Ya' },
    { value: 'tidak', label: 'Tidak' }
  ]
}

/**
 * Get default options based on scale type
 */
export function getDefaultOptionsByScaleType(scaleType: string): QuestionOption[] {
  switch (scaleType) {
    case 'likert_5':
      return getDefaultLikert5Options()
    case 'likert_7':
      return getDefaultLikert7Options()
    case 'guttman':
      return getDefaultGuttmanOptions()
    default:
      return []
  }
}

/**
 * Check if question type requires options
 */
export function questionTypeRequiresOptions(questionType: QuestionType): boolean {
  return ['multiple_choice', 'checkbox', 'dropdown', 'closed', 'mixed', 'filter'].includes(questionType)
}

/**
 * Check if question type requires scale type
 */
export function questionTypeRequiresScaleType(questionType: QuestionType): boolean {
  return questionType === 'likert' || questionType === 'rating_scale'
}

/**
 * Get warning message when changing question type
 */
export function getTypeChangeWarning(fromType: QuestionType, toType: QuestionType): string | null {
  const fromHasOptions = questionTypeRequiresOptions(fromType)
  const toHasOptions = questionTypeRequiresOptions(toType)
  const fromIsScale = questionTypeRequiresScaleType(fromType)

  if ((fromHasOptions || fromIsScale) && toType === 'text') {
    return 'Opsi jawaban dan skala pengukuran akan dihapus saat mengubah ke Pertanyaan Terbuka'
  }

  if (fromType === 'text' && toHasOptions) {
    return 'Anda perlu menambahkan opsi jawaban setelah mengubah tipe'
  }

  return null
}
