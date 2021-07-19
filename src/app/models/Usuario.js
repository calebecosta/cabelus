import Sequelize, { Model } from 'sequelize';
import bcrypt from 'bcryptjs';

class Usuario extends Model {
  static init(sequelize) {
    super.init(
      {
        nome: Sequelize.STRING,
        email: Sequelize.STRING,
        cpf: Sequelize.STRING,
        senha: Sequelize.VIRTUAL, // este campo nunca existira na base de dados, somente aqui
        senha_hash: Sequelize.STRING,
        ativo: Sequelize.BOOLEAN,
      },
      { tableName: 'usuario', paranoid: true, sequelize }
    );
    this.addHook('beforeSave', async (usuario) => {
      /**
       * hooks sao trechos de codigos que sao
       * executados de forma automatica baseado em acoes que acontecem em nosso model
       * ex: beforesave: antes de qualquer usuario ser salvo ou editado no banco de dados ele
       * executa esta funcao de callback
       */
      if (usuario.senha) {
        /**
         * somente executar este codigo quando
         * o usuario estiver informando uma senha nova
         */
        usuario.senha_hash = await bcrypt.hash(usuario.senha, 8); // o segundo parametro significa o numero da forca da criptografia. ps: quanto maior o numero, mais custoso em nivel de hardaware sera
      }
    });

    return this;
  }

  static associate(models) {
    this.belongsTo(models.GrupoSistema, {
      foreignKey: 'gruposistema_id',
      as: 'grupo',
    });
  }

  verificaSenha(senha) {
    /**
     * retorna true se a senha informada pelo usuario e igual a registrada no banco
     */
    return bcrypt.compare(senha, this.senha_hash);
  }
}

export default Usuario;
