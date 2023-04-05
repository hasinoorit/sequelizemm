# Sequelize Make Migration

Sequelize Make Migration is a command line interface tool that makes it easy to create and manage migrations for your Sequelize project. This tool uses the Query Interface provided by Sequelize to create migration files that can be used to make changes to your database schema.

## Installation:

First install the library globally.

```bash
npm i -g sequelizemm
```

## Project setup:

To run this application, you'll need to create a file called "sequelize.js" in the root directory of your application. Once you've done that, you can initialize your models and associations, and then export your Sequelize instance.

To export your Sequelize instance, you should use a named export with the name "sequelize". This will allow the application to import and work with your Sequelize instance.

Here's an example of what your code might look like:

```js
// Import the Sequelize library
const { Sequelize } = require("sequelize")

// Create a new Sequelize instance
const sequelize = new Sequelize(/* options go here */)

// Initialize your models and associations here
// ...

// Export your Sequelize instance as a named export
module.exports.sequelize = sequelize
```

## Programmatic Use

You can also import `makemigration` function and use it programmatically into your app.

Here's an example of what your code might look like:

```js
// import makemigration function
// import sequelize instance and your saved schema.
// schema is optional, if you don't provide schema, it will generate new migration.
const { makemigration } = require("sequelizemm")

makemigration(sequelize, schema)
```

## Creating Migrations:

Once you have set up your Sequelize instance, you can use sequelizemm to create migrations for your project.

To create a new migration, run the following command in your terminal:

```bash
sequelizemm
```

This will open an interactive prompt that will guide you through creating the migration. You will be asked to provide details such as the name of the migration and the changes you want to make to your models.

Once you have completed the prompts, `sequelizemm` will create a new migration file in your project's migrations directory. This file will contain the necessary Query Interface code to make the changes you specified.

In addition to creating the migration file, `sequelizemm` will also create a schema.json file in your project's root directory. This file contains the current details of your Sequelize models and will be used to detect changes in your model structure for future migrations. It is important that you do not delete this file.

By following these steps, you can easily create and manage migrations for your Sequelize project using sequelizemm.

## Features:

- Sync database with current models
- Generate Up & Down Migration
- Follows sequelize migration naming strategy
- Add constraint automatically
- Support ESM & CJS
- Perform migration using transaction

## License

[MIT](https://opensource.org/licenses/MIT)

Copyright (c) 2033-present, Md Hashinur Rahman
