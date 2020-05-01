import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { listRequest, getTrelloBoardLists, createTrelloList } from '../../../Modules/TrelloModule';
import TrelloHelper from '../../../Helpers/TrelloHelper';
import { trelloBoardId } from '../../../Config'

export default class TrelloTasksListCommand extends Command {
    constructor() {
        super('zadania', {
            aliases: ['zadania', 'taski', 'bledy'],
            category: 'Trello',
            description: {
                content: 'Pokazuje zadania trello',
                examples: ['zadania'],
                usages: 'zadania'
            },
            // ratelimit: 3
        });
    }

    public async exec(message: Message) {
        
    }
}