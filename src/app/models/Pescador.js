/* eslint-disable no-underscore-dangle */
import Sequelize, { Model } from 'sequelize';
import bcrypt from 'bcryptjs';
import deleteFileS3 from '../../utils/deleteFileS3';

class Pescador extends Model {
  static init(sequelize) {
    super.init(
      {
        nome: Sequelize.STRING,
        email: Sequelize.STRING,
        celular: Sequelize.STRING,
        contato: Sequelize.STRING,
        telefone: Sequelize.STRING,
        cpf: Sequelize.STRING,
        rg: Sequelize.STRING,
        data_nascimento: Sequelize.DATEONLY,
        senha: Sequelize.VIRTUAL, // este campo nunca existira na base de dados, somente aqui
        senha_hash: Sequelize.STRING,
        cep: Sequelize.STRING,
        endereco: Sequelize.STRING,
        bairro: Sequelize.STRING,
        numero: Sequelize.STRING,
        complemento: Sequelize.STRING,
        data_protocolo: Sequelize.DATEONLY,
      },
      { tableName: 'pescador', paranoid: true, sequelize }
    );
    this.addHook('beforeSave', async (pescador) => {
      /**
       * hooks sao trechos de codigos que sao
       * executados de forma automatica baseado em acoes que acontecem em nosso model
       * ex: beforesave: antes de qualquer usuario ser salvo ou editado no banco de dados ele
       * executa esta funcao de callback
       */
      if (pescador.senha) {
        /**
         * somente executar este codigo quando
         * o usuario estiver informando uma senha nova
         */
        pescador.senha_hash = await bcrypt.hash(pescador.senha, 8); // o segundo parametro significa o numero da forca da criptografia. ps: quanto maior o numero, mais custoso em nivel de hardaware sera
      }
    });

    this.addHook('beforeUpdate', async (pescador) => {
      // console.log('pescador > ', pescador);
      // console.log('New value > ', pescador.dataValues); // new values
      // console.log('Old value > ', pescador._previousDataValues); // current values
      const {
        cpf_id,
        rg_id,
        documentopesca_id,
        comprovanteresidencia_id,
        certidao_id,
        residenciapaiconjuge_id,
      } = pescador.dataValues;
      const {
        cpf_id: old_cpf,
        rg_id: old_rg,
        documentopesca_id: old_documentopesca,
        comprovanteresidencia_id: old_comprovanteresidencia,
        certidao_id: old_certidao,
        residenciapaiconjuge_id: old_residenciapaiconjuge,
      } = pescador._previousDataValues;

      const Arquivo = await this.associations.fotocpf.target;
      if (old_cpf && cpf_id !== old_cpf) {
        const cpf = await Arquivo.findByPk(old_cpf);
        await deleteFileS3(cpf.key);
        await cpf.destroy();
      }
      if (old_rg && rg_id !== old_rg) {
        const rg = await Arquivo.findByPk(old_rg);
        await deleteFileS3(rg.key);
        await rg.destroy();
      }
      if (old_documentopesca && documentopesca_id !== old_documentopesca) {
        const documentopesca = await Arquivo.findByPk(old_documentopesca);
        await deleteFileS3(documentopesca.key);
        await documentopesca.destroy();
      }
      if (
        old_comprovanteresidencia &&
        comprovanteresidencia_id !== old_comprovanteresidencia
      ) {
        const comprovanteresidencia = await Arquivo.findByPk(
          old_comprovanteresidencia
        );
        await deleteFileS3(comprovanteresidencia.key);
        await comprovanteresidencia.destroy();
      }
      if (old_certidao && certidao_id !== old_certidao) {
        const certidao = await Arquivo.findByPk(old_certidao);
        await deleteFileS3(certidao.key);
        await certidao.destroy();
      }
      if (
        old_residenciapaiconjuge &&
        residenciapaiconjuge_id !== old_residenciapaiconjuge
      ) {
        const residenciapaiconjuge = await Arquivo.findByPk(
          old_residenciapaiconjuge
        );
        await deleteFileS3(residenciapaiconjuge.key);
        await residenciapaiconjuge.destroy();
      }
    });

    return this;
  }

  static associate(models) {
    this.belongsTo(models.Cidade, {
      foreignKey: 'cidade_id',
      as: 'cidade',
    });
    this.belongsTo(models.EstadoCivil, {
      foreignKey: 'estadocivil_id',
      as: 'estadocivil',
    });
    this.hasMany(models.ContaBancaria, {
      foreignKey: 'pescador_id',
      as: 'contasbancaria',
    });
    this.belongsTo(models.TipoDocumento, {
      foreignKey: 'tipodocumento_id',
      as: 'tipodocumento',
    });
    this.belongsTo(models.Arquivo, {
      foreignKey: 'cpf_id',
      as: 'fotocpf',
    });
    this.belongsTo(models.Arquivo, {
      foreignKey: 'rg_id',
      as: 'fotorg',
    });
    this.belongsTo(models.Arquivo, {
      foreignKey: 'rgverso_id',
      as: 'fotorgverso',
    });
    this.belongsTo(models.Arquivo, {
      foreignKey: 'documentopesca_id',
      as: 'fotodocumentopesca',
    });
    this.belongsTo(models.Arquivo, {
      foreignKey: 'documentopescaverso_id',
      as: 'fotodocumentopescaverso',
    });
    this.belongsTo(models.Arquivo, {
      foreignKey: 'comprovanteresidencia_id',
      as: 'fotocomprovanteresidencia',
    });
    this.belongsTo(models.Arquivo, {
      foreignKey: 'certidao_id',
      as: 'fotocertidao',
    });
    this.belongsTo(models.Arquivo, {
      foreignKey: 'residenciapaiconjuge_id',
      as: 'fotoresidenciapaiconjuge',
    });
    this.belongsToMany(models.TipoPesca, {
      through: 'pescador_tipopesca',
      as: 'tipos_pesca',
      foreignKey: 'pescador_id',
    });
    this.belongsToMany(models.LocalPesca, {
      through: 'pescador_localpesca',
      as: 'locais_pesca',
      foreignKey: 'pescador_id',
    });
    this.hasMany(models.PescadorAcao, {
      as: 'acoes',
      foreignKey: 'pescador_id',
    });
  }

  verificaSenha(senha) {
    /**
     * retorna true se a senha informada pelo usuario e igual a registrada no banco
     */
    return bcrypt.compare(senha, this.senha_hash);
  }
}

export default Pescador;
