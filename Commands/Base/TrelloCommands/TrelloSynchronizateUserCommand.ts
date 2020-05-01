import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { Repository } from 'typeorm';

import { UserDataModel } from '../../../Models/UserDataModel';
import TrelloHelper from '../../../Helpers/TrelloHelper';

export default class TrelloSynchronizateUserCommand extends Command {
    constructor() {
        super('synchronizuj', {
            aliases: ['synchronizuj'],
            category: 'Trello',
            description: {
                content: 'Synchronizuje listę gracza z discordem',
                examples: ['synchronizuj'],
                usage: 'synchronizuj'
            },
            // cooldown: 120000,
            // ratelimit: 2,
        });
    }

    // TODO: Pobrawić ten kod jakoś, żeby synchronizate się nie powtarzał bo przeokropnie to wygląda
    public async exec(message: Message) {
        const discordUserId: string = message.author.id;
        const userRepo: Repository<UserDataModel> = this.client.db.getRepository(UserDataModel);

        const developer = await userRepo.findOne({ userId: discordUserId });
        
        if(developer !== undefined) {
            if(developer.trelloListId !== undefined && developer.trelloListId !== '') {
                return message.util.reply('❌ Twoje konto jest już zsynchronizowane z kartą na trello!');
            }
            await this.synchronizateTrello(message, discordUserId, userRepo, developer);

        } else {
            await this.synchronizateTrello(message, discordUserId, userRepo, developer);
        }

    }

    public async synchronizateTrello(message: Message, discordUserId: string, userRepo: Repository<UserDataModel>, developer: UserDataModel) {

        await TrelloHelper.createUserList(discordUserId).then(async (res: any) => {
            await TrelloHelper.isUserDiscordHaveList(discordUserId).then(async (listId: string) => {

                if (listId == undefined) {
                    return message.util.reply('Upss... Coś poszło nie tak! Spróbuj ponownie później');
                }

                if(developer === undefined) {
                    await userRepo.insert({
                        userId: discordUserId,
                        trelloListId: listId
                    });
                } else {
                    developer.trelloListId = listId;
                    await userRepo.save(developer);
                }

                return message.util.reply('✅ Utworzono i zsynchronizowano listę z twoim discordem!');
            });
        });
    } 
}