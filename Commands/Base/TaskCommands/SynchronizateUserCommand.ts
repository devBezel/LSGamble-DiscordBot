import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { Repository } from 'typeorm';

import { UserDataModel } from '../../../Models/UserDataModel';
import { MessageEmbed } from 'discord.js';
import { GuildMember } from 'discord.js';

export default class TrelloSynchronizateUserCommand extends Command {
    constructor() {
        super('synchronizuj', {
            aliases: ['synchronizuj'],
            category: 'Task',
            description: {
                content: 'Synchronizuje listę gracza z discordem',
                examples: ['synchronizuj'],
                usage: 'synchronizuj'
            },
            userPermissions: ['ADMINISTRATOR'],
            args: [
            {
                id: 'member',
                type: 'member',
                prompt: {
                    start: (msg: Message) => `❔ ${msg.author}, uwzględnij osobę, którą chcesz zsynchronizować`,
                    retry: (msg: Message) => `❔ ${msg.author} proszę... Uwzględnij prawidłową osobę, którą chcesz zsynchronizować`
                },
            }
        ]
            
            // cooldown: 120000,
            // ratelimit: 2,
        });
    }

    // TODO: Pobrawić ten kod jakoś, żeby synchronizate się nie powtarzał bo przeokropnie to wygląda
    public async exec(message: Message, { member }: { member: GuildMember } ) {
        const discordUserId: string = member.id;
        const userRepo: Repository<UserDataModel> = this.client.db.getRepository(UserDataModel);

        const developer = await userRepo.findOne({ userId: discordUserId });

        await message.delete();

        const embed = new MessageEmbed()
            .setAuthor('Przeprowadzam synchronizacje...');

        const embedMsg: Message = await message.channel.send(embed);
        
        if(developer === undefined) {
            
            await userRepo.insert({
                userId: discordUserId,
            });
            await userRepo.save(developer);

            embed.setAuthor('✅ Utworzono i zsynchronizowano listę z discordem użytkownika!');
            embed.setColor('#208c34');
            embed.setFooter('Ta wiadomość wkrótce zniknie');

            await embedMsg.edit(embed);

        } else {
            embed.setAuthor('❌ Te konto jest już zsynchronizowane!');
            await embedMsg.edit(embed);
        }

        setTimeout(async () => {
            await embedMsg.delete();
        }, 6000);

    } 
}