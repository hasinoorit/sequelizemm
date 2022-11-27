import {
  Association,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  BelongsToCreateAssociationMixin,
  CreationOptional,
  DataTypes,
  HasManyGetAssociationsMixin,
  HasManySetAssociationsMixin,
  HasManyAddAssociationMixin,
  HasManyAddAssociationsMixin,
  HasManyCreateAssociationMixin,
  HasManyRemoveAssociationMixin,
  HasManyRemoveAssociationsMixin,
  HasManyHasAssociationMixin,
  HasManyHasAssociationsMixin,
  HasManyCountAssociationsMixin,
  InferCreationAttributes,
  InferAttributes,
  Model,
  NonAttribute,
  Sequelize
} from 'sequelize'
import type { Post } from './Post'

type PostCommentAssociations = 'post' | 'parent' | 'children'

export class PostComment extends Model<
  InferAttributes<PostComment, {omit: PostCommentAssociations}>,
  InferCreationAttributes<PostComment, {omit: PostCommentAssociations}>
> {
  declare id: CreationOptional<number>
  declare title: string
  declare published: boolean
  declare publishedAt: Date | null
  declare content: string | null
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  // PostComment belongsTo Post
  declare post?: NonAttribute<Post>
  declare getPost: BelongsToGetAssociationMixin<Post>
  declare setPost: BelongsToSetAssociationMixin<Post, number>
  declare createPost: BelongsToCreateAssociationMixin<Post>
  
  // PostComment belongsTo PostComment (as Parent)
  declare parent?: NonAttribute<PostComment>
  declare getParent: BelongsToGetAssociationMixin<PostComment>
  declare setParent: BelongsToSetAssociationMixin<PostComment, number>
  declare createParent: BelongsToCreateAssociationMixin<PostComment>
  
  // PostComment hasMany PostComment (as Children)
  declare children?: NonAttribute<PostComment[]>
  declare getChildren: HasManyGetAssociationsMixin<PostComment>
  declare setChildren: HasManySetAssociationsMixin<PostComment, number>
  declare addChild: HasManyAddAssociationMixin<PostComment, number>
  declare addChildren: HasManyAddAssociationsMixin<PostComment, number>
  declare createChild: HasManyCreateAssociationMixin<PostComment>
  declare removeChild: HasManyRemoveAssociationMixin<PostComment, number>
  declare removeChildren: HasManyRemoveAssociationsMixin<PostComment, number>
  declare hasChild: HasManyHasAssociationMixin<PostComment, number>
  declare hasChildren: HasManyHasAssociationsMixin<PostComment, number>
  declare countChildren: HasManyCountAssociationsMixin
  
  declare static associations: {
    post: Association<PostComment, Post>,
    parent: Association<PostComment, PostComment>,
    children: Association<PostComment, PostComment>
  }

  static initModel(sequelize: Sequelize): typeof PostComment {
    PostComment.init({
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      title: {
        type: DataTypes.STRING(75),
        allowNull: false
      },
      published: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      },
      publishedAt: {
        type: DataTypes.DATE
      },
      content: {
        type: DataTypes.TEXT
      },
      createdAt: {
        type: DataTypes.DATE
      },
      updatedAt: {
        type: DataTypes.DATE
      }
    }, {
      sequelize
    })
    
    return PostComment
  }
}
