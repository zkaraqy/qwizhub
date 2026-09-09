import type { Sequelize, Model } from 'sequelize'
import { User } from './User'
import { Account } from './Account'
import { Session } from './Session'
import { VerificationToken } from './VerificationToken'

export {
  User,
  Account,
  Session,
  VerificationToken
}

export function initModels(sequelize: Sequelize) {
  User.initModel(sequelize)
  Account.initModel(sequelize)
  Session.initModel(sequelize)
  VerificationToken.initModel(sequelize)

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

  return {
    User,
    Account,
    Session,
    VerificationToken
  }
}