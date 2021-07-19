import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import authConfig from '../../config/auth';

export default async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    // se nao enviar o token retorno um erro
    return res.status(401).json({ error: 'Token não enviado!' });
  }

  const [, token] = authHeader.split(' '); // dividiando o header da requisicao. Bearer e o token por um espaco em branco
  try {
    /**
     * o promisify transforma uma funcao
     * de callback em uma com sintax async await.
     * o promisify retorna uma funcao
     * por isso utilizamos o segundo conjunto de parentes.
     */
    const decoded = await promisify(jwt.verify)(token, authConfig.secret);
    req.usuario_id = decoded.id;
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Token Inválido!' });
  }
};
