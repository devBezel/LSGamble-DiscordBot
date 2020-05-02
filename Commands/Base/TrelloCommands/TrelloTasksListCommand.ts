import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { listRequest, getTrelloBoardLists, createTrelloList } from '../../../Modules/TrelloModule';
import TrelloHelper from '../../../Helpers/TrelloHelper';
import { trelloBoardId } from '../../../Config'
import { Repository } from 'typeorm';
import { TaskDataModel } from '../../../Models/TaskDataModel';
import { MessageEmbed } from 'discord.js';

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
            cooldown: 20
        });
    }

    public async exec(message: Message) {
        const taskRepo: Repository<TaskDataModel> = this.client.db.getRepository(TaskDataModel);

        const userTasks = await taskRepo.find({ getterId: message.author.id, isEnded: false });

        message.delete();

        if(userTasks == undefined) {
            return message.util.reply('❌ Nie masz zsynchronizowanej listy!');
        }

        if(userTasks.length <= 0) {
            return message.util.reply('❌ Nie masz aktualnie żadnych zadań!');
        }

        const taskEmbed = new MessageEmbed()
            .setAuthor('Twoje zadania')
            .setColor('#208c34');

        for(let i = 0; i < userTasks.length; i++) {
            taskEmbed.addField(`Zadanie [ID: ${userTasks[i].id}]`, `Dla ${userTasks[i].text}`, false);
        }    

        const msgEmbed: Message = await message.channel.send(taskEmbed);

        await msgEmbed.react('🗑');

        const filter = (reaction, user) => {
            return ['🗑'].includes(reaction.emoji.name) && user.id === message.author.id;
        };

        await msgEmbed.awaitReactions(filter, { max: 1 }).then((collected: any) => {
            let r = collected.first();

            if(r.emoji.name === '🗑') {
                msgEmbed.delete();
            }
        });
        
    }
}