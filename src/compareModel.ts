import prompts from "prompts"
import chalk from "chalk"
import type { Model, Fields, Field, CompareFields } from "./types"
import {
  removeColumnQI,
  addColumnQI,
  renameColumnQI,
  changeColumnQI,
  renameTableQI,
} from "./qi.js"

const equalUnique = (c: any, o: any) => {
  let cArg: any = c
  let oArg: any = o
  if (typeof c === "object" && c !== null && "arg" in c) {
    console.log(c)
    cArg = c.arg
  }
  if (typeof o === "object" && o !== null && "arg" in o) {
    oArg = o.arg
  }
  return cArg === oArg
}
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
        !equalUnique(cField.unique, oField.unique)
      ) {
        upMig.push(changeColumnQI(current.tableName, cField))
        downMig.push(changeColumnQI(old.tableName, oField))
      }
    }
  })
  // console.log(current.fields)
  for (const [key, value] of Object.entries(current.fields)) {
    const field = value.field!
    if (!old.fields[field] || !old.fields[field]) {
      newFields[field] = current.fields[field]
    }
  }
  // Object.keys(current.fields).forEach((key) => {
  //   if (!old.fields[key]) {
  //     console.log(key)
  //     newFields[key] = current.fields[key]
  //   }
  // })
  const missingFieldsKeys = Object.keys(missingFields)
  for (let index = 0; index < missingFieldsKeys.length; index++) {
    const fieldName = missingFieldsKeys[index]
    const { ans } = await prompts({
      name: "ans",
      type: "confirm",
      message: `${chalk.green(fieldName)} is missing in ${chalk.green(
        old.modelName
      )} model. Have you deleted it?`,
    })
    if (ans) {
      upMig.push(removeColumnQI(old.tableName, missingFields[fieldName]))
      downMig.push(addColumnQI(old.tableName, missingFields[fieldName]))
      delete missingFields[fieldName]
    } else {
      const { newField } = await prompts({
        name: "newField",
        type: "select",
        message: `Select current field for ${chalk.bold.bgBlack.green(
          fieldName
        )} Field`,
        choices: Object.entries(newFields).map(([key, value]) => ({
          title: value.fieldName,
          value: value.field,
        })),
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
        !equalUnique(cField.unique, oField.unique)
      ) {
        upMig.push(changeColumnQI(current.tableName, cField))
        downMig.push(changeColumnQI(old.tableName, oField))
      }
      delete missingFields[fieldName]
      delete newFields[newField]
    }
  }
  Object.keys(newFields).forEach((fieldName) => {
    upMig.push(addColumnQI(current.tableName, newFields[fieldName]))
    downMig.push(removeColumnQI(current.tableName, newFields[fieldName]))
  })
  return true
}
