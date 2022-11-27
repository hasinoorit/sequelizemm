import { defineBuildConfig } from "unbuild"

export default defineBuildConfig({
  // If entries is not provided, will be automatically inferred from package.json
  // Change outDir, default is 'dist'
  declaration: true,
  externals: ["sequelize"],
  failOnWarn: false,
})
