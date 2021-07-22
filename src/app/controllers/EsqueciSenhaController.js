import Usuario from '../models/Usuario';
import Colaborador from '../models/Colaborador';
import Cliente from '../models/Cliente';
import Mail from '../../lib/Mail';

class EsqueciSenhaController {
  async store(req, res) {
    try {
      if (!req.body.email)
        return res.status(200).json({ error: 'Informe o email!' });
      if (!req.body.tipo_usuario)
        return res.status(200).json({ error: 'Informe o Tipo de usuário!' });
      let usuario;
      if (req.body.tipo_usuario === 'cli') {
        usuario = await Cliente.findOne({
          where: {
            email: req.body.email
          }
        });
      } else if (req.body.tipo_usuario === 'col') {
        usuario = await Colaborador.findOne({
          where: {
            email: req.body.email
          }
        });
      } else {
        usuario = await Usuario.findOne({
          where: {
            email: req.body.email
          }
        });
      }
      if (!usuario)
        return res
          .status(200)
          .json({ error: 'Email informado não consta em nossa base!' });

      const string = Math.random()
        .toString(36)
        .slice(-10);

      usuario.senha = string;

      await usuario.save();

      await Mail.sendMail({
        to: `${usuario.nome} <${usuario.email}>`,
        cc: 'Cabelus <contato@cabelus.com.br>',
        subject: 'Recuperação de senha - Cabelus ',
        template: 'esqueciMinhaSenha',
        context: {
          nome: usuario.nome,
          senha: string,
          footer: false
        }
      });

      return res.status(200).json({
        success: `Enviamos um link com a instruções para trocar a senha.`
      });
    } catch (error) {
      return res
        .status(500)
        .json({ error: 'Ops... estamos passando por uma instabilidade!' });
    }
  }
}

export default new EsqueciSenhaController();
