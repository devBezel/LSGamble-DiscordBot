import { Command } from "discord-akairo";
import { Message } from "discord.js";
import { Repository } from "typeorm";
import { TaskDataModel } from "../../../Models/TaskDataModel";
import { MessageEmbed } from "discord.js";
import { EmbedColors } from "../../../Constants/EmbedColors";

export default class TopTestersDeclaringBugsCommand extends Command {
    constructor() {
        super('topzglaszajacych', {
            aliases: ['top10zgloszen', 'top10z', 'top10'],
            category: 'Task',
            description: {
                content: 'Pokazuje testera, który napisał najwięcej zgłoszeń',
                examples: ['topzglaszajacych'],
                usages: 'topzglaszajacych'
            },
            cooldown: 20,
        })
    }

    public async exec(message: Message) {
        const usersTasksReported: { user?: any, quantity?: number }[] = [];
        // let top10: { user: any, quantity: number }[] = [];

        const tasksRepo: Repository<TaskDataModel> = this.client.db.getRepository(TaskDataModel);
        const tasks = await tasksRepo.find({ isEnded: true });

        for(let i = 0; i < tasks.length; i++) {
            const userTask = usersTasksReported.find(x => x.user === tasks[i].senderId);
            if(userTask === undefined) {
                usersTasksReported.push({ user: tasks[i].senderId, quantity: 0});
            }
        }

        for(let i = 0; i < usersTasksReported.length; i++)
        {
            for(let x = 0; x < tasks.length; x++)
            {
                if(usersTasksReported[i].user === tasks[x].senderId) {
                    usersTasksReported[i].quantity += 1;
                }
            }
        }

        const top10 = usersTasksReported.sort((a: { user?: any, quantity?: number }, b: { user?: any, quantity?: number }) => b.quantity-a.quantity ).slice(0, 10);

        message.delete();


        const tasksEmbed = new MessageEmbed()
            .setAuthor('TOP 10 osób zgłaszających blędy')
            .setColor(EmbedColors.Normal);

        for(let i = 0; i < top10.length; i++) {
            tasksEmbed.addField(`Miejsce ${i + 1} [${await (await this.client.users.fetch(top10[i].user)).tag}]`, `Ilość zgłoszeń: ${top10[i].quantity}`, false);
        }

        const msgEmbed: Message = await message.channel.send(tasksEmbed);

        setTimeout(() => {
            tasksEmbed.setAuthor('Ta wiadomość wkrótce zostanie usunięta.');
            tasksEmbed.setColor(EmbedColors.Warning);
            msgEmbed.edit(tasksEmbed);

            setTimeout(async () => {
                await msgEmbed.delete();
            }, 3000);
        }, 10000);
        
    }
}