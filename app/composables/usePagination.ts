interface PaginationOptions {
  initialPage?: number
  initialPerPage?: number
}

export const usePagination = <T>(items: Ref<T[]>, options: PaginationOptions = {}) => {
  const currentPage = ref(options.initialPage || 1)
  const perPage = ref(options.initialPerPage || 10)

  const totalItems = computed(() => items.value.length)
  const totalPages = computed(() => Math.ceil(totalItems.value / perPage.value))

  const paginatedItems = computed(() => {
    const start = (currentPage.value - 1) * perPage.value
    const end = start + perPage.value
    return items.value.slice(start, end)
  })

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }

  const nextPage = () => {
    goToPage(currentPage.value + 1)
  }

  const prevPage = () => {
    goToPage(currentPage.value - 1)
  }

  const hasNext = computed(() => currentPage.value < totalPages.value)
  const hasPrev = computed(() => currentPage.value > 1)

  const reset = () => {
    currentPage.value = 1
  }

  return {
    currentPage,
    perPage,
    totalItems,
    totalPages,
    paginatedItems,
    goToPage,
    nextPage,
    prevPage,
    hasNext,
    hasPrev,
    reset
  }
}
