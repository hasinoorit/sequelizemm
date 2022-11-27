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
} from "./qi.js"
import { compareModel } from "./compareModel.js"

export const compareSchema = async (
  current: Schema,
  old: Schema = {
    fKeyConstraints: {},
    models: {},
    uKeyConstraints: {},
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
  const script = `module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
    ${upQI.join("")}
    })
    await queryInterface.sequelize.transaction(async (transaction) => {
    ${upConstraint.join("")}
    })
  },down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
    ${downConstraint.join("")}
    })
    await queryInterface.sequelize.transaction(async (transaction) => {
    ${downQI.join("")}
    })
  },
};`
  const { migName } = await prompts({
    name: "migName",
    type: "text",
    message: `Enter migration name`,
  })
  await fs.writeFile(
    `./${Date.now().toString()}-${migName}.js`,
    script.replaceAll(`"%%`, "").replaceAll(`%%"`, "").replaceAll("\\", "")
  )
  await fs.writeFile(`./${Date.now().toString()}-${migName}.json`, saveCurrent)
}
