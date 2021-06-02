import * as Yup from 'yup';
import {
  startOfHour, parseISO, isBefore, format, subHours,
} from 'date-fns';
import { pt } from 'date-fns/locale';
import User from '../models/User';
import Appointment from '../models/Appointment';
import File from '../models/File';
import Notification from '../schemas/Notification';

class AppointmentController {
  async index(req, res) {
    const { page = 1 } = req.query; // Define 1 como padrão
    const appointments = await Appointment.findAll({
      where: { user_id: req.userId, canceled_at: null },
      order: ['date'],
      attributes: ['id', 'date'],
      limit: 20,
      offset: (page - 1) * 20, // Define quantos registros eu quero pular para mostrar resultados
      include: [ // Dados do prestador de serviço
        {
          model: User,
          as: 'provider', // Como tem 2 relacionamentos, tenho q usar o as
          attributes: ['id', 'name'],
          include: [ // Avatar do provider
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'path', 'url'], // Tenho que chamar o path, senao o model nao vai saber pelo THIS
            },
          ],
        },
      ],
    });
    res.json(appointments);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required(),
    });
    // Verifica se os campos são válidos
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }
    // Pega os dados da requisição
    const { provider_id, date } = req.body;
    // Checa se o provider_id é um provider
    const checkIsProvider = await User.findOne({
      where: { id: provider_id, provider: true },
    });
    // Se o provider chamado nao for um provider:
    if (!checkIsProvider) {
      return res.status(401).json({ error: 'You can only create appointments with providers' });
    }
    // Pega o horario sempre para a hora o começo da hora.
    // ParseISO pega a data recebida e tranforma em um objeto DATE
    const hourStart = startOfHour(parseISO(date));
    // Verifica se a data que eu chamo, já passou/está no passado
    if (isBefore(hourStart, new Date())) {
      return res.status(400).json({ error: 'Past dates are not permitted' });
    }

    // Checar se o appointment da disponivel
    const checkAvailability = await Appointment.findOne({
      where: {
        provider_id,
        canceled_at: null,
        date: hourStart,
      },
    });

    if (checkAvailability) {
      return res.status(400).json({ error: 'Appointment not avaliable' });
    }

    // Se tudo tiver a data tiver ok, cria o appointment
    const appointment = await Appointment.create({
      user_id: req.userId,
      provider_id,
      date,
    });

    // Notificar prestador de serviço

    const user = await User.findByPk(req.userId);
    // FNS nao trabalha com o q ta entre aspas simples
    const formattedDate = format(hourStart, "'dia' dd 'de' MMMM' às' H:mm'h'",
      { locale: pt });

    await Notification.create({
      content: `Novo agendamento de ${user.name} para ${formattedDate}`,
      user: provider_id,
    });

    return res.json(appointment);
  }

  async delete(req, res) {
    const appointment = await Appointment.findByPk(req.params.id);

    if (appointment.user_id !== req.userId) {
      return res.status(401).json({
        error: "You don't have permission to cancel this appointment",
      });
    }
    // Método para subtrair horas.
    const dateWithSub = subHours(appointment.date, 2); // Data ja vem do db ja em formato de data
    // Subtrai a data em 2 horas. Se ainda sim for antes da data atual, ai pode cancelar
    if (isBefore(dateWithSub, new Date())) {
      res.status(401).json({
        error: 'You can only cancel appointments 2 hours in advance',
      });
    }

    appointment.canceled_at = new Date();
    await appointment.save();
    res.json(appointment);

    return res.json();
  }
}

export default new AppointmentController();
