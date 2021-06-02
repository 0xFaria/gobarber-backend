import Sequelize, { Model } from 'sequelize';

class File extends Model {
  static init(sequelize) {
    // Super é usado pra acessar os métodos do pai
    super.init(
      {
        name: Sequelize.STRING,
        path: Sequelize.STRING,
        url: {
          type: Sequelize.VIRTUAL,
          get() {
            return `http://localhost:3333/files/${this.path}`;
          },
        },
      },
      {
        sequelize,
      },
    );
    return this;
  }
}

export default File;
