import Cidade from '../models/Cidade';
import Estado from '../models/Estado';

class CidadeController {
  async index(req, res) {
    try {
      const { estado_id } = req.query;
      const whereStatement = {};
      if (estado_id) whereStatement.estado_id = estado_id;
      const cidade = await Cidade.findAll({
        where: whereStatement,
        attributes: {
          exclude: ['createdAt', 'updatedAt', 'deletedAt'],
        },
        include: [
          {
            model: Estado,
            as: 'estado',
            attributes: {
              exclude: ['createdAt', 'updatedAt', 'deletedAt'],
            },
          },
        ],
      });
      return res.status(200).json(cidade);
    } catch (error) {
      return res
        .status(500)
        .json({ error: 'Ops... estamos passando por uma instabilidade!' });
    }
  }

  async show(req, res) {
    try {
      const cidade = await Cidade.findOne({
        where: { id: req.params.id },
        attributes: {
          exclude: ['createdAt', 'updatedAt', 'deletedAt'],
        },
        include: [
          {
            model: Estado,
            as: 'estado',
            attributes: {
              exclude: ['createdAt', 'updatedAt', 'deletedAt'],
            },
          },
        ],
      });
      return res.status(200).json(cidade);
    } catch (error) {
      return res
        .status(500)
        .json({ error: 'Ops... estamos passando por uma instabilidade!' });
    }
  }
}

export default new CidadeController();
