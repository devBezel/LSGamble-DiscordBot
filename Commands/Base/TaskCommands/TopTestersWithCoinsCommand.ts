import { Command } from "discord-akairo";
import { Message } from "discord.js";
import { UserDataModel } from "../../../Models/UserDataModel";
import { Repository } from "typeorm";
import { MessageEmbed } from "discord.js";
import { EmbedColors } from "../../../Constants/EmbedColors";

export default class TopTestersWithCoinsCommand extends Command {
    constructor() {
        super('toppomocnych', {
            aliases: ['top10pomocnych', 'toppomocnikow', 'topcoins', 'topcoiny'],
            category: 'Task',
            description: {
                content: 'Pokazuje testera, który napisał najwięcej zgłoszeń i zdobył punkty za poprawne zgłoszenie',
                examples: ['toppomocnych'],
                usages: 'toppomocnych'
            },

            cooldown: 20
        });
    }

    public async exec(message: Message) {
        const userRepo: Repository<UserDataModel> = this.client.db.getRepository(UserDataModel);
        
        const users = await userRepo.find();

        const top10testers = users.sort((a: UserDataModel, b: UserDataModel) => b.coins - a.coins).slice(0, 10);

        message.delete();

        const tasksEmbed = new MessageEmbed()
            .setAuthor('TOP 10 osób z punktami lojalnościowymi')
            .setColor(EmbedColors.Normal);

        for(let i = 0; i < top10testers.length; i++) {
            tasksEmbed.addField(`Miejsce ${i + 1} [${await (await this.client.users.fetch(top10testers[i].userId)).tag}]`, `Posiada ${top10testers[i].coins} punktów lojalnościowych`);
        }

        const msgEmbed = await message.channel.send(tasksEmbed);

        setTimeout(() => {
            tasksEmbed.setAuthor('Ta wiadomość wkrótce zostanie usunięta');
            tasksEmbed.setColor(EmbedColors.Warning);
            msgEmbed.edit(tasksEmbed);


            setTimeout(async () => {
                await msgEmbed.delete();
            }, 3000);
        }, 10000);
        
    }

}