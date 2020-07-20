import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { TaskDataModel } from '../../../Models/TaskDataModel';
import { MessageEmbed } from 'discord.js';
import { UserDataModel } from '../../../Models/UserDataModel';
import { EmbedColors } from '../../../Constants/EmbedColors';

export default class TrelloEndTaskCommand extends Command {
    constructor() {
        super('zakoncz', {
            aliases: ['taskend', 'ukoncz'],
            category: 'Task',
            description: {
                content: 'Koniec zadania w karcie od trello',
                examples: ['zakoncz [id zadania]'],
                usage: 'zakoncz'
            },
            cooldown: 120,
            args: [
                {
                    'id': 'id',
                    'type': 'number',
                    prompt: {
                        start: (msg: Message) => `❔ ${msg.author}, uwzględnij id zadania, które chcesz skończyć!`,
                        retry: (msg: Message) => `❔ ${msg.author} proszę... Uwzględnij id zadania, które chcesz skończyć!`
                    }
                }
            ]
        });
    }

    public async exec(message: Message, { id }: { id: number }) {
        const taskRepo = await this.client.db.getRepository<TaskDataModel>(TaskDataModel);

        const taskToEnd = await taskRepo.findOne({ id: id });

        await message.delete();
        
        if(taskToEnd === undefined) {
            return message.util.reply('❌ Nie ma takiego zadania, wpisz ponownie ID zadania, które chcesz usunąć');
        }

        // Jeśli nie jest osobą której zostało przydzielone zadanie
        if(taskToEnd.getterId !== message.author.id) {
            return message.util.reply('❌ Nie jesteś osobą rozwiązującą to zadanie, nie możesz go zakończyć!');
        }

        const userRepo = await this.client.db.getRepository<UserDataModel>(UserDataModel);
        const userForCoin = await userRepo.findOne({ userId: taskToEnd.senderId })

        if(userForCoin == undefined) {
            await userRepo.insert({
                userId: taskToEnd.senderId,
            });
        }

        const embed = new MessageEmbed()
            .setAuthor('Czy ten błąd/zadanie było pomocne?')
            .setColor(EmbedColors.Normal)
            .setFooter('Zaznacz tak lub nie!');

        const msgEmbed: Message = await message.channel.send(embed);

        const filter = (reaction, user) => {
            return ['❌', '✅'].includes(reaction.emoji.name) && user.id === message.author.id;
        };

        msgEmbed.react('✅');
        msgEmbed.react('❌');

        await msgEmbed.awaitReactions(filter, { max: 1 }).then(async (collected: any) => {
            const r = collected.first();

            if(r.emoji.name === '✅') {
                userForCoin.coins += 1;
                await userRepo.save(userForCoin);

                embed.setAuthor('Przydzielono 1 punkt lojalnościowy użytkownikowi składącemu zadanie.');

                // await message.util.reply('przydzielono 1 punkt lojalnościowy użytkownikowi składącemu zadanie.');
            } else {
                embed.setAuthor('Nie przydzielono punktów lojalnościowych użytkownikowi składającemu zadanie.');
            }

            embed.setFooter('Ta wiadomość wkrótce zniknie');
            await msgEmbed.edit(embed);

            setTimeout(async () => {
              await msgEmbed.delete();
            }, 6000);
            
        })

        

        // Usuwanie zadanie z bazy danych
        taskToEnd.isEnded = true;
        await taskRepo.save(taskToEnd);
    }

}