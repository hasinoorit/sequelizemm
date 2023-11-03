import type { Sequelize } from "sequelize"
import type { Schema, Models, FKeyConstraints, UKeyConstraints, Indexes } from "./types"
import { generateModel } from "./utils.js"

export const currentSchema = (db: Sequelize): Schema => {
  const models: Models = {}
  const fKeyConstraints: FKeyConstraints = {}
  const uKeyConstraints: UKeyConstraints = {}
  const indexes: Indexes = {}
  const modelNames = Object.keys(db.models)
  for (let mIndex = 0; mIndex < modelNames.length; mIndex++) {
    const modelName = modelNames[mIndex]
    const _model = db.model(modelName)
    const modelWithFkeys = generateModel(_model, modelName)
    models[modelName] = modelWithFkeys.model
    Object.assign(fKeyConstraints, modelWithFkeys.fKeyConstraints)
    Object.assign(uKeyConstraints, modelWithFkeys.uKeyConstraints)
    Object.assign(indexes, modelWithFkeys.indexes)
  }
  return { models, fKeyConstraints, uKeyConstraints, indexes }
}

export default currentSchema
