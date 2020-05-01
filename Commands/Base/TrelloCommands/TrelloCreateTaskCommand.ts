import { Command } from "discord-akairo";
import { Message } from "discord.js";
import { GuildMember } from "discord.js";
import { Repository } from "typeorm";
import { UserDataModel } from "../../../Models/UserDataModel";
import TrelloHelper from "../../../Helpers/TrelloHelper";
import { TaskDataModel } from "../../../Models/TaskDataModel";

export default class TrelloCreateTaskCommand extends Command {
    constructor() {
        super('blad', {
            aliases: ['blad', 'bug', 'zadanie', 'task'],
            category: 'Trello',
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

        if (developer != undefined) {
            if (developer.trelloListId == undefined) {
                return message.util.reply('Ta osoba nie ma zsynchronizowanej listy, przekaż zadanie innej');
            }

            await TrelloHelper.createCardForUserList(developer.trelloListId, `${message.author.tag} (${message.author.id})`, `**Zadanie:** \n ${task}`).then(async (res: any) => {

                // TODO: Na podstawie res.id zrobić nowy task i wlączyć w to użytkownika sendera i resolvera który rozwiązał zadanie (sender otrzymuje punkt za wykonane zadanie)

                await taskRepo.insert({
                    getterId: developer.userId,
                    senderId: message.author.id,
                    trelloListId: developer.trelloListId,
                    trelloCardId: res.id,
                    isEnded: false
                })

                message.util.reply(`✅ Utworzyłeś zadanie dla ${member.displayName}! Jeśli twoje zadanie okaże się przydatne - otrzymasz punkty lojalnościowe`);
                console.log(`Utworzono card ${res.id}`);
            });
        } else {
            return message.util.reply('Ta osoba nie ma zsynchronizowanej listy, przekaż zadanie innej');
        }
    }

}