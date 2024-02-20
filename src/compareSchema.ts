import fs from "fs/promises"
import prompts from "prompts"
import type { Schema, Models, CompareModels, Model } from "./types"
import {
  createTableQI,
  dropTableQI,
  addFKConstraintQI,
  removeFKConstraintQI,
  addUniqueConstraintQI,
  removeUniqueConstraintQI,
  removeIndexQI,
  addIndexQI,
} from "./qi.js"
import { compareModel } from "./compareModel.js"

export const compareSchema = async (
  current: Schema,
  old: Schema = {
    fKeyConstraints: {},
    models: {},
    uKeyConstraints: {},
    indexes: {}
  }
) => {
  const saveCurrent = JSON.stringify(current)
  const upQI: string[] = []
  const downQI: string[] = []
  const missingModels: Models = {}
  const newModels: Models = {}
  const oldModelKeys = Object.keys(old.models)
  for (let index = 0; index < oldModelKeys.length; index++) {
    const modelName = oldModelKeys[index]
    if (!current.models[modelName]) {
      missingModels[modelName] = old.models[modelName]
      delete old.models[modelName]
    } else {
      if (
        JSON.stringify(current.models[modelName]) !==
        JSON.stringify(old.models[modelName])
      ) {
        await compareModel(
          current.models[modelName],
          old.models[modelName],
          upQI,
          downQI
        )
      }
    }
  }
  Object.keys(current.models).forEach(async (modelName) => {
    if (!old.models[modelName]) {
      newModels[modelName] = current.models[modelName]
      delete current.models[modelName]
    }
  })
  const missingModelKeys = Object.keys(missingModels)
  for (let i = 0; i < missingModelKeys.length; i++) {
    const modelName = missingModelKeys[i]
    const { ans } = await prompts({
      name: "ans",
      type: "confirm",
      message: `${modelName} is missing in current schema. Have you deleted it?`,
    })
    if (ans) {
      upQI.push(dropTableQI(missingModels[modelName]))
      downQI.push(createTableQI(missingModels[modelName]))
      delete missingModels[modelName]
    } else {
      const { newModel } = await prompts({
        name: "newModel",
        type: "select",
        message: `Select current model for ${modelName} model`,
        choices: Object.keys(newModels).map((n) => ({ title: n, value: n })),
      })
      await compareModel(newModels[newModel], missingModels[modelName], upQI, downQI)
      delete missingModels[modelName]
      delete newModels[newModel]
    }
  }
  Object.keys(newModels).forEach((modelName) => {
    upQI.push(createTableQI(newModels[modelName]))
    downQI.push(dropTableQI(newModels[modelName]))
  })
  // <-- comparing models start --> //
  // compareModelsTable.forEach(({ old, current }) => {})
  const upConstraint: string[] = []
  const downConstraint: string[] = []
  Object.keys(old.fKeyConstraints).forEach((key) => {
    if (!current.fKeyConstraints[key]) {
      upConstraint.push(removeFKConstraintQI(old.fKeyConstraints[key]))
      downConstraint.push(addFKConstraintQI(old.fKeyConstraints[key]))
    }
  })
  Object.keys(current.fKeyConstraints).forEach((key) => {
    if (!old.fKeyConstraints[key]) {
      upConstraint.push(addFKConstraintQI(current.fKeyConstraints[key]))
      downConstraint.push(removeFKConstraintQI(current.fKeyConstraints[key]))
    }
  })
  Object.keys(old.uKeyConstraints).forEach((key) => {
    if (!current.uKeyConstraints[key]) {
      upConstraint.push(removeUniqueConstraintQI(old.uKeyConstraints[key]))
      downConstraint.push(addUniqueConstraintQI(old.uKeyConstraints[key]))
    }
  })
  Object.keys(current.uKeyConstraints).forEach((key) => {
    if (!old.uKeyConstraints[key]) {
      upConstraint.push(addUniqueConstraintQI(current.uKeyConstraints[key]))
      downConstraint.push(removeUniqueConstraintQI(current.uKeyConstraints[key]))
    }
  })

  const upIndex: string[] = []
  const downIndex: string[] = []
  Object.keys(old.indexes).forEach((key) => {
    if (!current.indexes[key]) {
      upIndex.push(removeIndexQI(old.indexes[key]))
      downIndex.push(addIndexQI(old.indexes[key]))
    }
  })
  Object.keys(current.indexes).forEach((key) => {
    if (!old.indexes[key]) {
      upIndex.push(addIndexQI(current.indexes[key]))
      downIndex.push(removeIndexQI(current.indexes[key]))
    }
  })
  const script = `module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
    ${upQI.join("")}
    })
    await queryInterface.sequelize.transaction(async (transaction) => {
    ${upConstraint.join("")}
    })
    await queryInterface.sequelize.transaction(async (transaction) => {
    ${upIndex.join("")}
    })
  },down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
    ${downConstraint.join("")}
    })
    await queryInterface.sequelize.transaction(async (transaction) => {
    ${downQI.join("")}
    })
    await queryInterface.sequelize.transaction(async (transaction) => {
    ${downIndex.join("")}
    })
  },
};`
  const { migName } = await prompts({
    name: "migName",
    type: "text",
    message: `Enter migration name`,
  })
  const date = new Date()
  const name = `${date.getUTCFullYear()}${date
    .getUTCMonth()
    .toString()
    .padStart(2, "0")}${date.getUTCDate().toString().padStart(2, "0")}${date
    .getUTCHours()
    .toString()
    .padStart(2, "0")}${date.getUTCMinutes().toString().padStart(2, "0")}${date
    .getUTCSeconds()
    .toString()
    .padStart(2, "0")}-${migName}`
  await fs.writeFile(
    `./${process.env.SEQ_MM_MIGRATIONS_PATH || 'migrations'}/${name}.js`,
    script.replaceAll(`"%%`, "").replaceAll(`%%"`, "").replaceAll("\\", "")
  )
  await fs.writeFile(`./${process.env.SEQ_MM_SCHEMA_PATH || 'migrations/schema.json'}`, saveCurrent)
}
