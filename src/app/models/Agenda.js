import Sequelize, { Model } from 'sequelize';

class Acao extends Model {
  static init(sequelize) {
    super.init(
      {
        titulo: Sequelize.STRING,
        descricao: Sequelize.STRING,
        numero: Sequelize.STRING,
        responsavel: Sequelize.STRING,
        dano_moral_individual: Sequelize.FLOAT,
        dano_material_individual: Sequelize.FLOAT,
        lucro_cessante_individual: Sequelize.FLOAT,
        qtd_impactados: Sequelize.INTEGER,
        objeto: Sequelize.STRING,
      },
      { tableName: 'acao', paranoid: true, sequelize }
    );

    return this;
  }

  static associate(models) {
    this.belongsToMany(models.Cidade, {
      through: 'acao_cidade',
      as: 'cidades',
      foreignKey: 'acao_id',
    });
    this.belongsToMany(models.TipoIndenizacao, {
      through: 'acao_tipoindenizacao',
      as: 'tiposindenizacao',
      foreignKey: 'acao_id',
    });
    this.belongsToMany(models.TipoDocumento, {
      through: 'acao_tipodocumento',
      as: 'tiposdocumento',
      foreignKey: 'acao_id',
    });
    this.hasMany(models.PescadorAcao, {
      as: 'pescadores',
      foreignKey: 'acao_id',
    });
    this.belongsTo(models.Juizo, {
      foreignKey: 'juizo_id',
      as: 'juizo',
    });
    this.belongsTo(models.Usuario, {
      as: 'usuario_insert',
      foreignKey: 'usuarioinsert_id',
    });
    this.belongsTo(models.Usuario, {
      as: 'usuario_update',
      foreignKey: 'usuarioupdate_id',
    });
  }
}

export default Acao;
