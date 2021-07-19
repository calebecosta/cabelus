import Mail from '../../lib/Mail';

class NovoAgendamentoMail {
  get key() {
    return 'NovoAgendamentoMail';
  }

  async handle({ data }) {
    const { objeto, mailto } = data;
    const link = process.env.APP_FRONT_URL;
    console.log('A fila Executou >> NovoAgendamentoMail');
    await Mail.sendMail({
      to: `Você <suporte+agendamento@clickativo.com.br>`,
      bcc: mailto,
      subject: 'Nova Agendamento Realizado - Cabelus',
      template: 'novoAgendamento',
      context: {
        link,
        objeto,
        footer: false,
      },
    });
  }
}
export default new NovoAgendamentoMail();
