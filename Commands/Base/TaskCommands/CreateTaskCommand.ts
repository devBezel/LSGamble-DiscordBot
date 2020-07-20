import { Command } from "discord-akairo";
import { Message } from "discord.js";
import { GuildMember } from "discord.js";
import { Repository } from "typeorm";
import { UserDataModel } from "../../../Models/UserDataModel";
import { TaskDataModel } from "../../../Models/TaskDataModel";
import { MessageEmbed } from "discord.js";

export default class TrelloCreateTaskCommand extends Command {
    constructor() {
        super('blad', {
            aliases: ['bug', 'zadanie', 'task'],
            category: 'Task',
            description: {
                content: 'Zglasza bląd do konkretnego użytkownika na trello',
                examples: ['blad @Algorytm jakis przykladowy blad'],
                usage: 'blad'
            },
            // cooldown: 120000,
            args: [
                {
                    id: 'member',
                    type: 'member',
                    prompt: {
                        start: (msg: Message) => `❔ ${msg.author}, uwzględnij osobę, której chcesz dodać zadanie do listy!`,
                        retry: (msg: Message) => `❔ ${msg.author} proszę... Uwzględnij prawidłową osobę, której chcesz dodać zadanie do listy!`
                    },
                },
                {
                    id: 'task',
                    type: 'string',
                    match: 'text',
                    default: 'Nie wprowadzono treści blędu'
                }
            ]
        });
    }

    public async exec(message: Message, { member, task }: { member: GuildMember, task: string }) {
        const userRepo: Repository<UserDataModel> = this.client.db.getRepository(UserDataModel);
        const taskRepo: Repository<TaskDataModel> = this.client.db.getRepository(TaskDataModel);

        const developer = await userRepo.findOne({ userId: member.id });

        await message.delete();

        const embed = new MessageEmbed()
            .setAuthor(`Tworzenie zadania dla ${member.user.tag} ...`);

        const msgEmbed: Message = await message.channel.send(embed);

        if (developer != undefined) {

            await taskRepo.insert({
                getterId: developer.userId,
                senderId: message.author.id,
                text: task,
                isEnded: false
            })
            embed.setAuthor(`✅ Utworzyłeś zadanie dla ${member.displayName}! Jeśli twoje zadanie okaże się przydatne - otrzymasz punkty lojalnościowe`);

            await msgEmbed.edit(embed);

        } else {
            embed.setAuthor('Ta osoba nie ma zsynchronizowanej listy, przekaż zadanie innej');
            await msgEmbed.edit(embed);
        }

        setTimeout(async () => {
            await msgEmbed.delete();
        }, 6000);
    }

}