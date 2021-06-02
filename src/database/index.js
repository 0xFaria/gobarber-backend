import Sequelize from 'sequelize';
import mongoose from 'mongoose';

import User from '../app/models/User';
import File from '../app/models/File';
import Appointment from '../app/models/Appointment';

import databaseConfig from '../config/database';

// Coloca todos os models criados dentro de um array para percorrer
const models = [User, File, Appointment];
class Database {
  constructor() {
    this.init(); // Assim que instanciado, ele já chama a função de conexão ao db e aos models
    this.mongo();
  }

  init() {
    this.connection = new Sequelize(databaseConfig); // Conecta ao banco de dados
    models // Percorre todos os models
    // Pra cada model, fazer a conexão dos mesmos
      .map((model) => model.init(this.connection))
      // Se existir o método associate no model, chamá-lo
      .map((model) => model.associate && model.associate(this.connection.models));
  }

  mongo() {
    this.mongoConnection = mongoose.connect(
      'mongodb://localhost:27017/gobarber',
      { useNewUrlParser: true, useFindAndModify: true, useUnifiedTopology: true },
    );
  }
}

export default new Database();
