#! /usr/bin/env node

import { join } from "path"
import { existsSync } from "fs"
import { makemigration } from "sequelizemm"
import { createRequire } from "module"
const require = createRequire(import.meta.url)
const cli = async () => {
  try {
    const base = await import(join(process.cwd(), "sequelize.js")).catch(() => {
      throw new Error("Sequelize declaration file not found")
    })
    if (!base.sequelize || "Sequelize" !== base.sequelize.constructor.name) {
      throw new Error("Sequelize declaration file not found")
    }
    const schemaPath = join(process.cwd(), "migrations/schema.json")
    if (existsSync(schemaPath)) {
      const oldSchema = require(schemaPath)
      await makemigration(base.sequelize, oldSchema)
    } else {
      await makemigration(base.sequelize)
    }
  } catch (error) {
    console.error(error)
  }
}

cli()
