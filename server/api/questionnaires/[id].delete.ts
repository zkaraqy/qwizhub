import { Questionnaire } from "~~/server/models";

export default defineEventHandler(async (event) => {
  try {
    // get the questionnaire id from the request params
    const { id } = event.context.params;

    // find the questionnaire by id
    const questionnaire = await Questionnaire.findByPk(id);

    // if questionnaire not found, return 404
    if (!questionnaire) {
      throw createError({
        statusCode: 404,
        statusMessage: "Questionnaire not found",
      });
    }

    // delete the questionnaire
    await questionnaire.destroy();

    // return success response
    return {
      message: "Questionnaire deleted successfully",
    };
  } catch (error: any) {
    // handle errors
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || "Internal Server Error",
    });
  }
});
