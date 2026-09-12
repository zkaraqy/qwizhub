<template>
  <div v-if="show" class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.5)">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content rounded-4 border-0 shadow">
        <div class="modal-header border-bottom-0 pb-0">
          <h5 class="modal-title fw-bold">
            <i class="bi bi-sliders me-2"></i>
            Kustomisasi Opsi Jawaban
          </h5>
          <button type="button" class="btn-close" @click="handleClose"></button>
        </div>
        
        <div class="modal-body p-4">
          <!-- Scale Type Selector (for likert/rating_scale) -->
          <div v-if="questionType === 'likert' || questionType === 'rating_scale'" class="mb-4">
            <label class="form-label fw-semibold">Tipe Skala</label>
            <select v-model="selectedScaleType" class="form-select rounded-3" @change="handleScaleTypeChange">
              <option value="likert_5">Skala Likert 5 Poin</option>
              <option value="likert_7">Skala Likert 7 Poin</option>
              <option value="guttman">Skala Guttman (Ya/Tidak)</option>
              <option value="custom">Kustom</option>
            </select>
            <small class="text-muted">
              Pilih tipe skala pengukuran yang sesuai dengan pertanyaan Anda
            </small>
          </div>

          <!-- Options Editor -->
          <div class="mb-3">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <label class="form-label fw-semibold mb-0">Opsi Jawaban</label>
              <button 
                v-if="!isScaleType"
                class="btn btn-sm btn-outline-primary rounded-3"
                @click="addOption"
              >
                <i class="bi bi-plus-lg me-1"></i>
                Tambah Opsi
              </button>
            </div>

            <!-- Likert/Rating Scale Options (with scores) -->
            <div v-if="isScaleType && selectedScaleType !== 'custom'" class="option-list">
              <div 
                v-for="(option, index) in localOptions" 
                :key="index"
                class="option-item mb-3 p-3 border rounded-3"
              >
                <div class="row align-items-center">
                  <div class="col-auto">
                    <div class="score-badge">
                      {{ option.score || (index + 1) }}
                    </div>
                  </div>
                  <div class="col">
                    <input 
                      v-model="option.label" 
                      type="text" 
                      class="form-control"
                      placeholder="Label opsi..."
                    />
                    <small class="text-muted">Skor: {{ option.score || (index + 1) }}</small>
                  </div>
                </div>
              </div>
            </div>

            <!-- Regular Options (multiple choice, checkbox, etc) -->
            <div v-else class="option-list">
              <div 
                v-for="(option, index) in localOptions" 
                :key="index"
                class="option-item mb-2"
              >
                <div class="input-group">
                  <span class="input-group-text bg-light">{{ index + 1 }}</span>
                  <input 
                    v-model="option.label" 
                    type="text" 
                    class="form-control"
                    placeholder="Label opsi..."
                  />
                  <button 
                    class="btn btn-outline-danger"
                    @click="removeOption(index)"
                    :disabled="localOptions.length <= 1"
                  >
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </div>
            </div>

            <div v-if="localOptions.length === 0" class="alert alert-info rounded-3 mt-3">
              <i class="bi bi-info-circle me-2"></i>
              Belum ada opsi. Klik "Tambah Opsi" untuk menambahkan.
            </div>
          </div>

          <!-- Preview -->
          <div v-if="localOptions.length > 0" class="mt-4">
            <label class="form-label fw-semibold">Preview</label>
            <div class="preview-box p-3 bg-light rounded-3">
              <div v-for="(option, index) in localOptions" :key="index" class="mb-2">
                <div class="form-check" v-if="questionType === 'checkbox'">
                  <input class="form-check-input" type="checkbox" disabled>
                  <label class="form-check-label">
                    {{ option.label }}
                    <span v-if="option.score" class="badge bg-secondary ms-2">Skor: {{ option.score }}</span>
                  </label>
                </div>
                <div class="form-check" v-else>
                  <input class="form-check-input" type="radio" disabled>
                  <label class="form-check-label">
                    {{ option.label }}
                    <span v-if="option.score" class="badge bg-secondary ms-2">Skor: {{ option.score }}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer border-top-0 pt-0">
          <button class="btn btn-light rounded-3" @click="handleClose">Batal</button>
          <button 
            class="btn btn-primary rounded-3 px-4" 
            @click="handleSave"
            :disabled="localOptions.length === 0 || !isValid"
          >
            <i class="bi bi-check-lg me-1"></i>
            Simpan
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { QuestionOption, QuestionType } from '~/types/questionnaire'
import { 
  getDefaultLikert5Options, 
  getDefaultLikert7Options,
  getDefaultGuttmanOptions,
  getDefaultOptionsByScaleType 
} from '~/utils/questionOptions'

interface Props {
  show: boolean
  questionType: QuestionType
  scaleType?: string | null
  currentOptions?: QuestionOption[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'close': []
  'save': [options: QuestionOption[], scaleType?: string]
}>()

const selectedScaleType = ref<string>(props.scaleType || 'likert_5')
const localOptions = ref<QuestionOption[]>([])

// Check if current question type uses scale
const isScaleType = computed(() => {
  return props.questionType === 'likert' || props.questionType === 'rating_scale'
})

// Validate options
const isValid = computed(() => {
  return localOptions.value.length > 0 && 
         localOptions.value.every(opt => opt.label && opt.label.trim().length > 0)
})

// Initialize options when modal opens
watch(() => props.show, (newVal) => {
  if (newVal) {
    initializeOptions()
  }
})

function initializeOptions() {
  if (props.currentOptions && props.currentOptions.length > 0) {
    localOptions.value = JSON.parse(JSON.stringify(props.currentOptions))
  } else if (isScaleType.value) {
    localOptions.value = getDefaultOptionsByScaleType(selectedScaleType.value)
  } else {
    localOptions.value = []
  }
}

function handleScaleTypeChange() {
  if (selectedScaleType.value !== 'custom') {
    localOptions.value = getDefaultOptionsByScaleType(selectedScaleType.value)
  } else {
    localOptions.value = Array.from({ length: 5 }, (_, i) => ({
      value: String(i + 1),
      label: '',
      score: i + 1
    }))
  }
}

function addOption() {
  localOptions.value.push({
    value: `option_${localOptions.value.length + 1}`,
    label: ''
  })
}

function removeOption(index: number) {
  if (localOptions.value.length > 1) {
    localOptions.value.splice(index, 1)
  }
}

function handleSave() {
  const updatedOptions = localOptions.value.map((opt, index) => ({
    ...opt,
    value: opt.value || opt.label.toLowerCase().replace(/\s+/g, '_')
  }))

  if (isScaleType.value) {
    emit('save', updatedOptions, selectedScaleType.value)
  } else {
    emit('save', updatedOptions)
  }
}

function handleClose() {
  emit('close')
}
</script>

<style scoped>
.score-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  font-weight: bold;
  font-size: 1.1rem;
}

.option-item {
  transition: all 0.2s ease;
}

.option-item:hover {
  background-color: #f8f9fa;
}

.preview-box {
  border: 2px dashed #dee2e6;
}
</style>

