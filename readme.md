# Sequelize Make Migration

Sequelize Make Migration is a command-line interface tool that simplifies the creation and management of migrations for your Sequelize project. This tool utilizes the Query Interface provided by Sequelize to create migration files that can be used to modify your database schema.

## Installation

To install the library globally, run the following command:

```bash
npm i -g sequelizemm
```

## Getting Started

Before you can use `sequelizemm`, you need to set up your Sequelize instance. To do this, create a file called sequelize.js in the root directory of your application, and then initialize your models and associations.

Here's an example of what your sequelize.js file might look like:

```js
const { Sequelize } = require("sequelize")

const sequelize = new Sequelize(/* options go here */)

// initialize models and associations here
// ...

module.exports.sequelize = sequelize
```

> Note: If you have exported the Sequelize instance from a file with a different name or path, you can specify the path to that file and the exported name using the --file and --name command-line arguments, respectively. See the Command-line Arguments section for more information.

## Creating Migrations

To create a new migration file, run the following command in your terminal:

```bash
sequelizemm
```

This will open an interactive prompt that will guide you through creating the migration. You will be asked to provide details such as the name of the migration and the changes you want to make to your models.

Once you have completed the prompts, `sequelizemm` will create a new migration file in your project's migrations directory. This file will contain the necessary Query Interface code to make the changes you specified.

In addition to creating the migration file, `sequelizemm` will also create a schema.json file in your project's root directory. This file contains the current details of your Sequelize models and will be used to detect changes in your model structure for future migrations. Do not delete this file.

## Programmatic Use

You can also import the makemigration function and use it programmatically in your application. Here's an example of what your code might look like:

```js
const { makemigration } = require("sequelizemm")

makemigration(sequelize, schema)
```

> Note: The schema parameter is optional. If you don't provide a schema, a new migration will be generated.

## Command-line Arguments

You can use the following command-line arguments with sequelizemm:

- --file or -f: Path to a file that exports the Sequelize instance (default: sequelize.js). Example: sequelizemm --file path/to/my/sequelize.js
- --name or -n: Name of the exported Sequelize instance (default: sequelize). Example: sequelizemm --name mySequelize
- --help or -h: Display help message. Example: sequelizemm --help

> Note: All command-line arguments are optional.

## Features

- Support Sequelize v6 & v7
- Synchronize database with current models
- Generate up and down migrations
- Follow Sequelize migration naming strategy
- Add constraints automatically
- Support ESM and CJS
- Perform migration using transaction

## License

[MIT](https://opensource.org/licenses/MIT)

Copyright (c) 2033-present, Md Hashinur Rahman
