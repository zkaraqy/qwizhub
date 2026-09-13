import { ref } from "vue";
import type {
  Questionnaire,
  CreateQuestionnaireData,
  UpdateQuestionnaireData,
} from "~/types/questionnaire";

export const useQuestionnaireForm = () => {
  const loading = ref(false);
  const error = ref<string | null>(null);
  const questionnaire = ref<Questionnaire | null>(null);

  /**
   * Fetch questionnaire by ID
   */
  const fetchQuestionnaire = async (questionnaireId: string) => {
    loading.value = true;
    error.value = null;

    try {
      const response = (await $fetch(
        `/api/questionnaires/${questionnaireId}`,
      )) as any;
      questionnaire.value = response.questionnaire;
      return response.questionnaire;
    } catch (err: any) {
      error.value = err.data?.statusMessage || "Failed to load questionnaire";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Create new questionnaire
   */
  const createQuestionnaire = async (
    projectId: string,
    data: CreateQuestionnaireData,
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const response = (await $fetch(
        `/api/projects/${projectId}/questionnaires`,
        {
          method: "POST",
          body: {
            topic: data.topic,
            researchObjective: data.researchObjective,
            variables: data.variables || [],
          },
        },
      )) as any;

      questionnaire.value = response.questionnaire;
      return response.questionnaire;
    } catch (err: any) {
      error.value = err.data?.statusMessage || "Failed to create questionnaire";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Update questionnaire
   */
  const updateQuestionnaire = async (
    questionnaireId: string,
    data: UpdateQuestionnaireData,
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const response = (await $fetch(`/api/questionnaires/${questionnaireId}`, {
        method: "PUT",
        body: data,
      })) as any;

      if (questionnaire.value) {
        questionnaire.value = {
          ...questionnaire.value,
          ...response.questionnaire,
        };
      }

      return response.questionnaire;
    } catch (err: any) {
      error.value = err.data?.statusMessage || "Failed to update questionnaire";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteQuestionnaire = async (questionnaireId: string) => {
    loading.value = true;
    error.value = null;

    try {
      const response = (await $fetch(`/api/questionnaires/${questionnaireId}`, {
        method: "DELETE",
      })) as any;
      return response;
    } catch (err: any) {
      error.value = err.data?.statusMessage || "Failed to delete questionnaire";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Reset state
   */
  const reset = () => {
    loading.value = false;
    error.value = null;
    questionnaire.value = null;
  };

  return {
    // State
    loading,
    error,
    questionnaire,

    // Methods
    fetchQuestionnaire,
    createQuestionnaire,
    updateQuestionnaire,
    deleteQuestionnaire,
    reset,
  };
};
