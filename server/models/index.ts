import type { Sequelize, Model } from 'sequelize'
import { User } from './User'
import { Account } from './Account'
import { Session } from './Session'
import { VerificationToken } from './VerificationToken'
import { RespondentProfile } from './RespondentProfile'
import { PasswordResetToken } from './PasswordResetToken'
import { Project } from './Project'
import { Questionnaire } from './Questionnaire'
import { Question } from './Question'
import { AIGenerationLog } from './AIGenerationLog'
import { Transaction } from './Transaction'
import { Response } from './Response'
import { HonorTransaction } from './HonorTransaction'
import { ResearchVariable } from './ResearchVariable'
import { VariableIndicator } from './VariableIndicator'

export {
  User,
  Account,
  Session,
  VerificationToken,
  RespondentProfile,
  PasswordResetToken,
  Project,
  Questionnaire,
  Question,
  AIGenerationLog,
  Transaction,
  Response,
  HonorTransaction,
  ResearchVariable,
  VariableIndicator
}

export function initModels(sequelize: Sequelize) {
  User.initModel(sequelize)
  Account.initModel(sequelize)
  Session.initModel(sequelize)
  VerificationToken.initModel(sequelize)
  RespondentProfile.initModel(sequelize)
  PasswordResetToken.initModel(sequelize)
  Project.initModel(sequelize)
  Questionnaire.initModel(sequelize)
  Question.initModel(sequelize)
  AIGenerationLog.initModel(sequelize)
  Transaction.initModel(sequelize)
  Response.initModel(sequelize)
  HonorTransaction.initModel(sequelize)
  ResearchVariable.initModel(sequelize)
  VariableIndicator.initModel(sequelize)

  User.hasMany(Account, {
    as: 'accounts',
    foreignKey: 'user_id'
  })
  User.hasMany(Session, {
    as: 'sessions',
    foreignKey: 'user_id'
  })
  User.hasMany(VerificationToken, {
    as: 'verificationTokens',
    foreignKey: 'user_id'
  })
  User.hasOne(RespondentProfile, {
    as: 'respondentProfile',
    foreignKey: 'user_id'
  })
  User.hasMany(PasswordResetToken, {
    as: 'passwordResetTokens',
    foreignKey: 'user_id'
  })

  Account.belongsTo(User, {
    as: 'user',
    foreignKey: 'user_id'
  })
  Session.belongsTo(User, {
    as: 'user',
    foreignKey: 'user_id'
  })
  VerificationToken.belongsTo(User, {
    as: 'user',
    foreignKey: 'user_id'
  })
  RespondentProfile.belongsTo(User, {
    as: 'user',
    foreignKey: 'user_id'
  })
  PasswordResetToken.belongsTo(User, {
    as: 'user',
    foreignKey: 'user_id'
  })

  // Project associations
  User.hasMany(Project, {
    as: 'projects',
    foreignKey: 'peneliti_id'
  })
  Project.belongsTo(User, {
    as: 'peneliti',
    foreignKey: 'peneliti_id'
  })

  // Questionnaire associations
  Project.hasMany(Questionnaire, {
    as: 'questionnaires',
    foreignKey: 'project_id'
  })
  Questionnaire.belongsTo(Project, {
    as: 'project',
    foreignKey: 'project_id'
  })

  // Question associations
  Questionnaire.hasMany(Question, {
    as: 'questions',
    foreignKey: 'questionnaire_id'
  })
  Question.belongsTo(Questionnaire, {
    as: 'questionnaire',
    foreignKey: 'questionnaire_id'
  })

  // ResearchVariable associations
  Questionnaire.hasMany(ResearchVariable, {
    as: 'researchVariables',
    foreignKey: 'questionnaire_id'
  })
  ResearchVariable.belongsTo(Questionnaire, {
    as: 'questionnaire',
    foreignKey: 'questionnaire_id'
  })

  // VariableIndicator associations
  ResearchVariable.hasMany(VariableIndicator, {
    as: 'indicators',
    foreignKey: 'variable_id'
  })
  VariableIndicator.belongsTo(ResearchVariable, {
    as: 'variable',
    foreignKey: 'variable_id'
  })

  // Question to Variable/Indicator associations
  ResearchVariable.hasMany(Question, {
    as: 'questions',
    foreignKey: 'variable_id'
  })
  Question.belongsTo(ResearchVariable, {
    as: 'variable',
    foreignKey: 'variable_id'
  })

  VariableIndicator.hasMany(Question, {
    as: 'questions',
    foreignKey: 'indicator_id'
  })
  Question.belongsTo(VariableIndicator, {
    as: 'indicator',
    foreignKey: 'indicator_id'
  })

  // AIGenerationLog associations
  User.hasMany(AIGenerationLog, {
    as: 'aiGenerationLogs',
    foreignKey: 'user_id'
  })
  AIGenerationLog.belongsTo(User, {
    as: 'user',
    foreignKey: 'user_id'
  })
  Questionnaire.hasMany(AIGenerationLog, {
    as: 'aiGenerationLogs',
    foreignKey: 'questionnaire_id'
  })
  AIGenerationLog.belongsTo(Questionnaire, {
    as: 'questionnaire',
    foreignKey: 'questionnaire_id'
  })

  // Transaction associations
  User.hasMany(Transaction, {
    as: 'transactions',
    foreignKey: 'user_id'
  })
  Transaction.belongsTo(User, {
    as: 'user',
    foreignKey: 'user_id'
  })
  Questionnaire.hasMany(Transaction, {
    as: 'transactions',
    foreignKey: 'questionnaire_id'
  })
  Transaction.belongsTo(Questionnaire, {
    as: 'questionnaire',
    foreignKey: 'questionnaire_id'
  })

  // Response associations
  User.hasMany(Response, {
    as: 'responses',
    foreignKey: 'respondent_id'
  })
  Response.belongsTo(User, {
    as: 'respondent',
    foreignKey: 'respondent_id'
  })
  Questionnaire.hasMany(Response, {
    as: 'responses',
    foreignKey: 'questionnaire_id'
  })
  Response.belongsTo(Questionnaire, {
    as: 'questionnaire',
    foreignKey: 'questionnaire_id'
  })

  // HonorTransaction associations
  User.hasMany(HonorTransaction, {
    as: 'honorTransactions',
    foreignKey: 'respondent_id'
  })
  HonorTransaction.belongsTo(User, {
    as: 'respondent',
    foreignKey: 'respondent_id'
  })
  Response.hasOne(HonorTransaction, {
    as: 'honorTransaction',
    foreignKey: 'response_id'
  })
  HonorTransaction.belongsTo(Response, {
    as: 'response',
    foreignKey: 'response_id'
  })

  return {
    User,
    Account,
    Session,
    VerificationToken,
    RespondentProfile,
    PasswordResetToken,
    Project,
    Questionnaire,
    Question,
    AIGenerationLog,
    Transaction,
    Response,
    HonorTransaction,
    ResearchVariable,
    VariableIndicator
  }
}