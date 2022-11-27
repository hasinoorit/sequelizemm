import type { Model } from "sequelize"
import { Sequelize } from "sequelize"
import { Category } from "./Category.js"
import { Post } from "./Post.js"
import { PostCategory } from "./PostCategory.js"
import { PostComment } from "./PostComment.js"
import { PostNeta } from "./PostNeta.js"
import { PostTag } from "./PostTag.js"
import { Tag } from "./Tag.js"
import { User } from "./User.js"

const sequelize = new Sequelize("mysql://root:asd123@localhost:3306/mydb")

export { Category, Post, PostCategory, PostComment, PostNeta, PostTag, Tag, User }

export function initModels(sequelize: Sequelize) {
  Category.initModel(sequelize)
  Post.initModel(sequelize)
  PostCategory.initModel(sequelize)
  PostComment.initModel(sequelize)
  PostNeta.initModel(sequelize)
  PostTag.initModel(sequelize)
  Tag.initModel(sequelize)
  User.initModel(sequelize)

  Category.belongsTo(Category, {
    as: "parent",
    foreignKey: "parent_id",
  })
  Category.hasMany(Category, {
    as: "children",
    foreignKey: "parent_id",
  })
  Category.hasMany(PostCategory, {
    as: "postCategories",
    foreignKey: "category_id",
  })
  Category.belongsToMany(Post, {
    as: "posts",
    through: PostCategory,
    foreignKey: "category_id",
    otherKey: "post_id",
    onDelete: "CASCADE",
  })
  Post.belongsTo(User, {
    as: "author",
    foreignKey: "author_id",
  })
  Post.belongsTo(Post, {
    as: "parent",
    foreignKey: "parent_id",
  })
  Post.hasMany(Post, {
    as: "children",
    foreignKey: "parent_id",
  })
  Post.hasMany(PostCategory, {
    as: "postCategories",
    foreignKey: "post_id",
  })
  Post.belongsToMany(Category, {
    as: "categories",
    through: PostCategory,
    foreignKey: "post_id",
    otherKey: "category_id",
    onDelete: "CASCADE",
  })
  Post.hasMany(PostComment, {
    as: "comments",
    foreignKey: "post_id",
  })
  Post.hasMany(PostNeta, {
    as: "metas",
    foreignKey: "post_id",
  })
  Post.hasMany(PostTag, {
    as: "postTags",
    foreignKey: "post_id",
  })
  Post.belongsToMany(Tag, {
    as: "tags",
    through: PostTag,
    foreignKey: "post_id",
    otherKey: "tag_id",
    onDelete: "CASCADE",
  })
  PostCategory.belongsTo(Post, {
    as: "post",
    foreignKey: "post_id",
  })
  PostCategory.belongsTo(Category, {
    as: "category",
    foreignKey: "category_id",
  })
  PostComment.belongsTo(Post, {
    as: "post",
    foreignKey: "post_id",
  })
  PostComment.belongsTo(PostComment, {
    as: "parent",
    foreignKey: "parent_id",
  })
  PostComment.hasMany(PostComment, {
    as: "children",
    foreignKey: "parent_id",
  })
  PostNeta.belongsTo(Post, {
    as: "post",
    foreignKey: "post_id",
  })
  PostTag.belongsTo(Post, {
    as: "post",
    foreignKey: "post_id",
  })
  PostTag.belongsTo(Tag, {
    as: "tag",
    foreignKey: "tag_id",
  })
  Tag.hasMany(PostTag, {
    as: "postTags",
    foreignKey: "tag_id",
  })
  Tag.belongsToMany(Post, {
    as: "posts",
    through: PostTag,
    foreignKey: "tag_id",
    otherKey: "post_id",
    onDelete: "CASCADE",
  })
  User.hasMany(Post, {
    as: "posts",
    foreignKey: "author_id",
  })

  return {
    Category,
    Post,
    PostCategory,
    PostComment,
    PostNeta,
    PostTag,
    Tag,
    User,
  }
}

initModels(sequelize)
export default sequelize
