import File from '../models/File';

class FileController {
  async store(req, res) {
    const { originalname: name, filename: path } = req.file; // multer libera um req.file
    // Cria o arquivo no db
    const file = await File.create({
      name,
      path,
    });
    res.json(file);
  }
}

export default new FileController();
