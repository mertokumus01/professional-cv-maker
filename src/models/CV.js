const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CV = sequelize.define('CV', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [3, 100],
      },
    },
    template: {
      type: DataTypes.ENUM('classic', 'modern', 'creative', 'minimal'),
      defaultValue: 'classic',
    },
    version: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    data: {
      type: DataTypes.JSONB,
      defaultValue: {
        personalInfo: {},
        summary: '',
        experience: [],
        education: [],
        skills: [],
        languages: [],
        projects: [],
        certifications: [],
        references: [],
      },
    },
    viewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    shareLink: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true,
    },
    lastModified: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'cvs',
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { fields: ['isPublic'] },
      { fields: ['createdAt'] },
      { fields: ['shareLink'] },
    ],
  });

  return CV;
};
