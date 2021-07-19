import Estado from '../models/Estado';

class EstadoController {
  async index(req, res) {
    try {
      const { estado_id } = req.query;
      const whereStatement = {};
      if (estado_id) whereStatement.estado_id = estado_id;
      const estado = await Estado.findAll({
        where: whereStatement,
        attributes: {
          exclude: ['createdAt', 'updatedAt', 'deletedAt'],
        },
      });
      return res.status(200).json(estado);
    } catch (error) {
      return res
        .status(500)
        .json({ error: 'Ops... estamos passando por uma instabilidade!' });
    }
  }

  async show(req, res) {
    try {
      const estado = await Estado.findOne({
        where: { id: req.params.id },
        attributes: {
          exclude: ['createdAt', 'updatedAt', 'deletedAt'],
        },
      });
      return res.status(200).json(estado);
    } catch (error) {
      return res
        .status(500)
        .json({ error: 'Ops... estamos passando por uma instabilidade!' });
    }
  }
}

export default new EstadoController();
