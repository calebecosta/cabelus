import Sequelize, { Model } from 'sequelize';
import bcrypt from 'bcryptjs';


class Cliente extends Model {
  static init(sequelize) {
    super.init(
      {
        nome: Sequelize.STRING,
        email: Sequelize.STRING,
        endereco: Sequelize.STRING,
        senha: Sequelize.VIRTUAL, // este campo nunca existira na base de dados, somente aqui
        senha_hash: Sequelize.STRING,
      },
      { tableName: 'cliente', paranoid: true, sequelize }
    );
    this.addHook('beforeSave', async (cliente) => {
      /**
       * hooks sao trechos de codigos que sao
       * executados de forma automatica baseado em acoes que acontecem em nosso model
       * ex: beforesave: antes de qualquer usuario ser salvo ou editado no banco de dados ele
       * executa esta funcao de callback
       */
      if (cliente.senha) {
        /**
         * somente executar este codigo quando
         * o usuario estiver informando uma senha nova
         */
         cliente.senha_hash = await bcrypt.hash(cliente.senha, 8); // o segundo parametro significa o numero da forca da criptografia. ps: quanto maior o numero, mais custoso em nivel de hardaware sera
      }
    });

    return this;
  }
  verificaSenha(senha) {
    /**
     * retorna true se a senha informada pelo usuario e igual a registrada no banco
     */
    return bcrypt.compare(senha, this.senha_hash);
  }
}

export default Cliente;
