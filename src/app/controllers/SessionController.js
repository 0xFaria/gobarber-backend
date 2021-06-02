import jwt from 'jsonwebtoken';
import * as Yup from 'yup';
import User from '../models/User';
import authConfig from '../../config/auth';

class SessionController {
  async store(req, res) {
    const schema = Yup.object().shape({
      email: Yup.string().email(),
      password: Yup.string().min(6).when('oldPassword', (oldPassword, field) => (oldPassword ? field.required() : field)), // Preenchida se tiver preenchido old password
    });
    // ver se tudo está de acordo com o schema proposto e se é valido
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation failed' });
    }

    const { email, password } = req.body;
    // verifica email
    const user = await User.findOne({ where: { email } });
    // Se nao achar
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    // Caso ache, Verificar se as senhas batem
    if (!(await user.checkPassword(password))) {
      return res.status(401).json({ error: 'Password does not match' });
    }

    const { id, name } = user;

    // Retornar as infos e criar o jwt para obter a sessão e o acesso

    return res.json({
      user: {
        id,
        name,
        email,
      },
      // Passa uma informação para ficar salva no payload,
      // palavras unicas do sistema, tempo de expiração
      token: jwt.sign({ id }, authConfig.secret, {
        expiresIn: authConfig.expiresIn,
      }),
    });
  }
}

export default new SessionController();
