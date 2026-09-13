<template>
  <div class="researcher-charts">
    <div class="row g-4">
      <!-- Chart 1: Tren Respons dari Waktu ke Waktu (Line Chart) -->
      <div class="col-lg-8 col-md-12">
        <div class="chart-card glass-card p-4 h-100">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h5 class="chart-title mb-1">
                <i class="bi bi-graph-up text-primary me-2"></i>Tren Respons Masuk
              </h5>
              <p class="chart-subtitle text-muted mb-0">Pertumbuhan respons harian dari responden</p>
            </div>
            <div class="chart-badge">
              <span class="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1">
                {{ totalTimelineResponses }} respons total
              </span>
            </div>
          </div>

          <div class="chart-container" style="position: relative; height: 280px;">
            <div v-if="loading" class="chart-loading">
              <div class="spinner-border spinner-border-sm text-primary me-2"></div>
              Memuat grafik tren...
            </div>
            <div v-else-if="!hasTimelineData" class="chart-empty">
              <i class="bi bi-bar-chart-line text-muted fs-1 mb-2"></i>
              <p class="text-muted small mb-0">Belum ada aktivitas respons pada rentang waktu ini</p>
            </div>
            <canvas v-show="!loading && hasTimelineData" ref="timelineCanvasRef"></canvas>
          </div>
        </div>
      </div>

      <!-- Chart 2: Status & Penyelesaian Kuesioner (Doughnut Chart) -->
      <div class="col-lg-4 col-md-12">
        <div class="chart-card glass-card p-4 h-100">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h5 class="chart-title mb-1">
                <i class="bi bi-pie-chart text-info me-2"></i>Distribusi Status
              </h5>
              <p class="chart-subtitle text-muted mb-0">Status publikasi kuesioner</p>
            </div>
          </div>

          <div class="chart-container" style="position: relative; height: 240px;">
            <div v-if="loading" class="chart-loading">
              <div class="spinner-border spinner-border-sm text-info me-2"></div>
              Memuat grafik...
            </div>
            <div v-else-if="totalStatusCount === 0" class="chart-empty">
              <i class="bi bi-pie-chart text-muted fs-1 mb-2"></i>
              <p class="text-muted small mb-0">Belum ada kuesioner dibuat</p>
            </div>
            <canvas v-show="!loading && totalStatusCount > 0" ref="statusCanvasRef"></canvas>
          </div>

          <div v-if="!loading && totalStatusCount > 0" class="chart-legend-row mt-3">
            <div class="d-flex justify-content-around text-center">
              <div>
                <span class="legend-dot bg-success"></span>
                <span class="legend-label text-muted d-block small">Aktif</span>
                <span class="fw-bold">{{ statusDistribution?.published || 0 }}</span>
              </div>
              <div>
                <span class="legend-dot bg-secondary"></span>
                <span class="legend-label text-muted d-block small">Draft</span>
                <span class="fw-bold">{{ statusDistribution?.draft || 0 }}</span>
              </div>
              <div>
                <span class="legend-dot bg-info"></span>
                <span class="legend-label text-muted d-block small">Selesai</span>
                <span class="fw-bold">{{ statusDistribution?.closed || 0 }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Chart 3: Capaian Respons per Kuesioner (Horizontal Bar Chart) -->
      <div class="col-12" v-if="responsesPerQuestionnaire && responsesPerQuestionnaire.length > 0">
        <div class="chart-card glass-card p-4">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h5 class="chart-title mb-1">
                <i class="bi bi-bar-chart-steps text-warning me-2"></i>Capaian Respons per Kuesioner
              </h5>
              <p class="chart-subtitle text-muted mb-0">Perbandingan respons terkumpul terhadap target kuesioner</p>
            </div>
          </div>

          <div class="chart-container" :style="{ position: 'relative', height: barChartHeight + 'px' }">
            <div v-if="loading" class="chart-loading">
              <div class="spinner-border spinner-border-sm text-warning me-2"></div>
              Memuat data...
            </div>
            <canvas v-show="!loading" ref="barCanvasRef"></canvas>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed, nextTick } from 'vue'
import {
  Chart,
  LineController,
  BarController,
  DoughnutController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

Chart.register(
  LineController,
  BarController,
  DoughnutController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface TimelineItem {
  date: string
  label: string
  total: number
  completed: number
}

interface QuestionnaireResponseItem {
  id: string
  title: string
  currentResponses: number
  completedResponses: number
  targetRespondents: number
  progressPercentage: number
}

interface StatusDistribution {
  draft: number
  published: number
  closed: number
}

interface Props {
  timeline?: TimelineItem[]
  responsesPerQuestionnaire?: QuestionnaireResponseItem[]
  statusDistribution?: StatusDistribution
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  timeline: () => [],
  responsesPerQuestionnaire: () => [],
  statusDistribution: () => ({ draft: 0, published: 0, closed: 0 }),
  loading: false
})

const timelineCanvasRef = ref<HTMLCanvasElement | null>(null)
const statusCanvasRef = ref<HTMLCanvasElement | null>(null)
const barCanvasRef = ref<HTMLCanvasElement | null>(null)

let timelineChartInstance: Chart | null = null
let statusChartInstance: Chart | null = null
let barChartInstance: Chart | null = null

const totalTimelineResponses = computed(() => {
  return props.timeline.reduce((sum, item) => sum + item.total, 0)
})

const hasTimelineData = computed(() => {
  return props.timeline.length > 0 && props.timeline.some(item => item.total > 0)
})

const totalStatusCount = computed(() => {
  if (!props.statusDistribution) return 0
  return (props.statusDistribution.draft || 0) +
         (props.statusDistribution.published || 0) +
         (props.statusDistribution.closed || 0)
})

const barChartHeight = computed(() => {
  const count = props.responsesPerQuestionnaire?.length || 1
  return Math.min(450, Math.max(200, count * 55 + 50))
})

// ─── Render Timeline Chart ─────────────────────────────────────────────────
const renderTimelineChart = () => {
  if (!timelineCanvasRef.value) return
  if (timelineChartInstance) {
    timelineChartInstance.destroy()
    timelineChartInstance = null
  }

  if (!hasTimelineData.value) return

  const ctx = timelineCanvasRef.value.getContext('2d')
  if (!ctx) return

  const labels = props.timeline.map(t => t.label)
  const totalData = props.timeline.map(t => t.total)
  const completedData = props.timeline.map(t => t.completed)

  // Gradient background
  const gradientTotal = ctx.createLinearGradient(0, 0, 0, 260)
  gradientTotal.addColorStop(0, 'rgba(14, 59, 67, 0.28)')
  gradientTotal.addColorStop(1, 'rgba(14, 59, 67, 0.0)')

  const gradientCompleted = ctx.createLinearGradient(0, 0, 0, 260)
  gradientCompleted.addColorStop(0, 'rgba(40, 167, 69, 0.25)')
  gradientCompleted.addColorStop(1, 'rgba(40, 167, 69, 0.0)')

  timelineChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Total Respons Masuk',
          data: totalData,
          borderColor: '#0E3B43',
          backgroundColor: gradientTotal,
          fill: true,
          tension: 0.35,
          borderWidth: 2.5,
          pointBackgroundColor: '#0E3B43',
          pointRadius: 3.5,
          pointHoverRadius: 6
        },
        {
          label: 'Respons Selesai',
          data: completedData,
          borderColor: '#28a745',
          backgroundColor: gradientCompleted,
          fill: true,
          tension: 0.35,
          borderWidth: 2,
          pointBackgroundColor: '#28a745',
          pointRadius: 3,
          pointHoverRadius: 5
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            boxWidth: 12,
            font: { size: 11, family: 'sans-serif' }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(14, 59, 67, 0.92)',
          titleFont: { size: 12, weight: 'bold' },
          bodyFont: { size: 12 },
          padding: 10,
          cornerRadius: 8
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { size: 11 } }
        },
        y: {
          beginAtZero: true,
          ticks: { precision: 0, font: { size: 11 } },
          grid: { color: 'rgba(0, 0, 0, 0.05)' }
        }
      }
    }
  })
}

// ─── Render Status Distribution Chart ──────────────────────────────────────
const renderStatusChart = () => {
  if (!statusCanvasRef.value) return
  if (statusChartInstance) {
    statusChartInstance.destroy()
    statusChartInstance = null
  }

  if (totalStatusCount.value === 0) return

  const ctx = statusCanvasRef.value.getContext('2d')
  if (!ctx) return

  statusChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Aktif (Published)', 'Draft', 'Selesai / Ditutup'],
      datasets: [
        {
          data: [
            props.statusDistribution?.published || 0,
            props.statusDistribution?.draft || 0,
            props.statusDistribution?.closed || 0
          ],
          backgroundColor: ['#28a745', '#6c757d', '#17a2b8'],
          borderWidth: 2,
          borderColor: '#ffffff',
          hoverOffset: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '70%',
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (item) => ` ${item.label}: ${item.raw} kuesioner`
          }
        }
      }
    }
  })
}

// ─── Render Bar Chart (Per Kuesioner) ──────────────────────────────────────
const renderBarChart = () => {
  if (!barCanvasRef.value) return
  if (barChartInstance) {
    barChartInstance.destroy()
    barChartInstance = null
  }

  if (!props.responsesPerQuestionnaire || props.responsesPerQuestionnaire.length === 0) return

  const ctx = barCanvasRef.value.getContext('2d')
  if (!ctx) return

  const labels = props.responsesPerQuestionnaire.map(q => {
    return q.title.length > 25 ? q.title.substring(0, 25) + '...' : q.title
  })
  const currentData = props.responsesPerQuestionnaire.map(q => q.currentResponses)
  const targetData = props.responsesPerQuestionnaire.map(q => q.targetRespondents)

  barChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Respons Terkumpul',
          data: currentData,
          backgroundColor: '#0E3B43',
          borderRadius: 6,
          barThickness: 16
        },
        {
          label: 'Target Responden',
          data: targetData,
          backgroundColor: 'rgba(14, 59, 67, 0.2)',
          borderRadius: 6,
          barThickness: 16
        }
      ]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: { boxWidth: 12, font: { size: 11 } }
        },
        tooltip: {
          callbacks: {
            label: (item) => ` ${item.dataset.label}: ${item.raw} responden`
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: { precision: 0 },
          grid: { color: 'rgba(0,0,0,0.05)' }
        },
        y: {
          grid: { display: false },
          ticks: { font: { size: 11 } }
        }
      }
    }
  })
}

const renderAllCharts = async () => {
  await nextTick()
  renderTimelineChart()
  renderStatusChart()
  renderBarChart()
}

watch(
  () => [props.timeline, props.statusDistribution, props.responsesPerQuestionnaire, props.loading],
  () => {
    if (!props.loading) {
      renderAllCharts()
    }
  },
  { deep: true }
)

onMounted(() => {
  renderAllCharts()
})

onBeforeUnmount(() => {
  if (timelineChartInstance) timelineChartInstance.destroy()
  if (statusChartInstance) statusChartInstance.destroy()
  if (barChartInstance) barChartInstance.destroy()
})
</script>

<style scoped>
.chart-card {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.chart-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.07);
}

.chart-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #0E3B43;
}

.chart-subtitle {
  font-size: 0.82rem;
}

.chart-loading,
.chart-empty {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #6c757d;
}

.legend-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-bottom: 2px;
}
</style>
