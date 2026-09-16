export const SPECIALIZATIONS = [
    { value: 'software_engineering', label: 'Software Engineering' },
    { value: 'data_science', label: 'Data Science' },
    { value: 'management', label: 'Management' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'design', label: 'Design / UI/UX' },
    { value: 'finance', label: 'Finance' },
    { value: 'human_resources', label: 'Human Resources' },
    { value: 'operations', label: 'Operations' },
    { value: 'product_management', label: 'Product Management' },
    { value: 'business_development', label: 'Business Development' },
    { value: 'others', label: 'Others' }
] as const

export type SpecializationValue = typeof SPECIALIZATIONS[number]['value']
