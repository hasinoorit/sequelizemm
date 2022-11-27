import prompts from "prompts"
import type { Model, Fields, Field, CompareFields } from "./types"
import {
  removeColumnQI,
  addColumnQI,
  renameColumnQI,
  changeColumnQI,
  renameTableQI,
} from "./qi.js"
export const compareModel = async (
  current: Model,
  old: Model,
  upMig: string[],
  downMig: string[]
) => {
  const missingFields: Fields = {}
  const newFields: Fields = {}
  if (current.tableName !== old.tableName) {
    upMig.push(renameTableQI(old.tableName, current.tableName))
    downMig.push(renameTableQI(current.tableName, old.tableName))
  }
  Object.keys(old.fields).forEach((key) => {
    const cField = current.fields[key]
    if (!cField) {
      missingFields[key] = old.fields[key]
    } else {
      const oField = old.fields[key]
      if (cField.field !== oField.field) {
        upMig.push(renameColumnQI(current.tableName, oField, cField))
        downMig.push(renameColumnQI(current.tableName, cField, oField))
      }
      if (
        cField.allowNull !== oField.allowNull ||
        cField.autoIncrement !== oField.autoIncrement ||
        cField.defaultValue !== oField.defaultValue ||
        cField.primaryKey !== oField.primaryKey ||
        JSON.stringify(cField.type) !== JSON.stringify(oField.type) ||
        cField.unique !== oField.unique
      ) {
        upMig.push(changeColumnQI(current.tableName, cField))
        downMig.push(changeColumnQI(old.tableName, oField))
      }
    }
  })
  Object.keys(current.fields).forEach((key) => {
    if (!old.fields[key]) {
      newFields[key] = current.fields[key]
    }
  })
  const missingFieldsKeys = Object.keys(missingFields)
  for (let index = 0; index < missingFieldsKeys.length; index++) {
    const fieldName = missingFieldsKeys[index]
    const { ans } = await prompts({
      name: "ans",
      type: "confirm",
      message: `${fieldName} is missing in ${old.modelName} model. Have you deleted it?`,
    })
    if (ans) {
      upMig.push(removeColumnQI(old.tableName, missingFields[fieldName]))
      downMig.push(addColumnQI(old.tableName, missingFields[fieldName]))
      delete missingFields[fieldName]
    } else {
      const { newField } = await prompts({
        name: "newField",
        type: "select",
        message: `Select current model for ${fieldName} model`,
        choices: Object.keys(newFields).map((n) => ({ title: n, value: n })),
      })
      const cField = newFields[newField]
      const oField = missingFields[fieldName]
      if (cField.field !== oField.field) {
        upMig.push(renameColumnQI(current.tableName, oField, cField))
        downMig.push(renameColumnQI(current.tableName, cField, oField))
      }
      if (
        cField.allowNull !== oField.allowNull ||
        cField.autoIncrement !== oField.autoIncrement ||
        cField.defaultValue !== oField.defaultValue ||
        cField.primaryKey !== oField.primaryKey ||
        JSON.stringify(cField.type) !== JSON.stringify(oField.type) ||
        cField.unique !== oField.unique
      ) {
        upMig.push(changeColumnQI(current.tableName, cField))
        downMig.push(changeColumnQI(old.tableName, oField))
      }
      delete missingFields[fieldName]
      delete newFields[newField]
    }
    Object.keys(newFields).forEach((fieldName) => {
      upMig.push(addColumnQI(current.tableName, newFields[fieldName]))
      downMig.push(removeColumnQI(current.tableName, newFields[fieldName]))
    })
  }
  return true
}
