import { ConnectionManager } from 'typeorm';
import { databaseName } from '../Config';

import { UserDataModel } from '../Models/UserDataModel';
import { TaskDataModel } from '../Models/TaskDataModel';


const connectionManager: ConnectionManager = new ConnectionManager();
connectionManager.create({
    name: databaseName,
    type: 'sqlite',
    database: '../data/db.sqlite',
    entities: [
        UserDataModel,
        TaskDataModel
    ]
});

export default connectionManager;