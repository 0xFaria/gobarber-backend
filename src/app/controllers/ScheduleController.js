import { startOfDay, endOfDay, parseISO } from 'date-fns';
import { Op } from 'sequelize';
import Appointment from '../models/Appointment';
import User from '../models/User';

class ScheduleController {
  async index(req, res) {
    const checkUserProvider = await User.findOne({
      where: { id: req.userId, provider: true },
    });

    if (!checkUserProvider) {
      return res.status(401).json({ error: 'User is not a provider' });
    }

    const { date } = req.query; // Pega a data passada como query
    const parsedDate = parseISO(date); // "Formata" a data

    const appointments = await Appointment.findAll({
      where: {
        provider_id: req.userId,
        canceled_at: null, // Que nao esteja cancelada ainda
        date: { // Padroniza a data do bd
          [Op.between]: [startOfDay(parsedDate), endOfDay(parsedDate)],
        },
      },
      include: [ // Chama o relacionamento da tabela
        {
          model: User,
          as: 'user', // Sempre usar o nome dado na criaçao do model qnd tem 2 relacionamentos pra não confundir
          attributes: ['name'], // Mostrar só o nome
        },
      ],
      order: ['date'],
    });
    return res.json({ appointments });
  }
}

export default new ScheduleController();
