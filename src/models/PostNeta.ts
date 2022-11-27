import {
  Association,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  BelongsToCreateAssociationMixin,
  CreationOptional,
  DataTypes,
  InferCreationAttributes,
  InferAttributes,
  Model,
  NonAttribute,
  Sequelize,
} from "sequelize"
import type { Post } from "./Post"

type PostNetaAssociations = "post"

export class PostNeta extends Model<
  InferAttributes<PostNeta, { omit: PostNetaAssociations }>,
  InferCreationAttributes<PostNeta, { omit: PostNetaAssociations }>
> {
  declare id: CreationOptional<number>
  declare key: string
  declare content: string | null
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  // PostNeta belongsTo Post
  declare post?: NonAttribute<Post>
  declare getPost: BelongsToGetAssociationMixin<Post>
  declare setPost: BelongsToSetAssociationMixin<Post, number>
  declare createPost: BelongsToCreateAssociationMixin<Post>

  declare static associations: {
    post: Association<PostNeta, Post>
  }

  static initModel(sequelize: Sequelize): typeof PostNeta {
    PostNeta.init(
      {
        id: {
          type: DataTypes.INTEGER.UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        key: {
          type: DataTypes.STRING(50),
          allowNull: false,
          unique: true,
        },
        content: {
          type: DataTypes.TEXT,
        },
        createdAt: {
          type: DataTypes.DATE,
        },
        updatedAt: {
          type: DataTypes.DATE,
        },
      },
      {
        sequelize,
      }
    )

    return PostNeta
  }
}
