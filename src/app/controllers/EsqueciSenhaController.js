import Mail from '../../lib/Mail';
import Sms from '../../lib/Sms';
import Pescador from '../models/Pescador';
import Usuario from '../models/Usuario';

class EsqueciSenhaController {
  async store(req, res) {
    try {
      const { cpf } = req.body;
      let usuario = null;
      if (!cpf) return res.status(400).json({ error: 'Informe o CPF!' });
      usuario = await Pescador.findOne({
        where: { cpf },
        attributes: {
          exclude: ['createdAt', 'updatedAt', 'deletedAt'],
        },
      });
      if (!usuario) {
        usuario = await Usuario.findOne({
          where: { cpf },
          attributes: {
            exclude: ['createdAt', 'updatedAt', 'deletedAt'],
          },
        });
        if (!usuario) {
          return res.status(400).json({ error: 'Usuário não encontrado!' });
        }
      }
      const stringPass = Math.random().toString(36).slice(-10);

      usuario.senha = stringPass;

      await usuario.save();

      await Mail.sendMail({
        to: `${usuario.nome} <${usuario.email}>`,
        subject: 'Recuperação de senha - cabelus',
        template: 'esqueciSenha',
        context: {
          nome: usuario.nome,
          senha: stringPass,
          footer: false,
        },
      });
      await Sms.sendSms({
        numero: '55'+usuario.celular.replace('(','').replace(')','').replace('-','').replace(' ',''),
        content: 'cabelus: Parece que você esqueceu sua senha. Tudo bem, não tem problema :). Sua nova senha é: '+stringPass
      });
      return res.status(200).json({
        success: `Enviamos um link com a instruções para trocar de senha.`,
      });
    } catch (error) {
      console.log('error >>> ', error);
      return res
        .status(500)
        .json({ error: 'Ops... estamos passando por uma instabilidade!' });
    }
  }
}

export default new EsqueciSenhaController();
