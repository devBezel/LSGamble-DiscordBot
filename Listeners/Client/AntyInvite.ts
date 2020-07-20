import { Listener } from "discord-akairo";
import { Message } from "discord.js";
import { MessageEmbed } from "discord.js";
import { EmbedColors } from "../../Constants/EmbedColors";
import { MessageReaction } from "discord.js";
import { adminRoles, channelMessageVerification } from "../../Config";
import { User } from "discord.js";

export default class AntyInvite extends Listener {
    constructor() {
        super('antyinvite', {
            emitter: 'client',
            event: 'message',
            category: 'client'
        })
    }

    public async exec(message: Message) {
        const badWord = 'discord.gg/';

        if (!message.content.includes(badWord) || message.author.id === this.client.user.id) return;

        const antyInviteEmbed = new MessageEmbed()
            .setAuthor(`${message.author.tag} twoja wiadomość została zablokowana i wysłana do weryfikacji`)
            .setColor(EmbedColors.Warning);


        const messageToVerificateEmbed = new MessageEmbed()
            .setAuthor(`Podejrzana wiadomość od ${message.author.tag} do weryfikacji`)
            .addField('Podejrzana wiadomość', message.content)
            .setColor(EmbedColors.Danger);


        const channelToVerificate = this.client.channels.get(channelMessageVerification);
        if (!messageToVerificateEmbed) { 
            return console.log('[Error] Kanal od AntyInvite nie istnieje, skoryguj to, aby bot mógł działąć poprawnie');
        }


        // @ts-ignore
        const messageToVerificate: Message = await channelToVerificate.send(messageToVerificateEmbed);
        messageToVerificate.react('✅');


        const antyInviteMessage = await message.channel.send(antyInviteEmbed);



        await message.delete();

        const badWorldFilter = (reacion: MessageReaction, user: User) => {
            return ['✅'].includes(reacion.emoji.name);
        };
        await messageToVerificate.awaitReactions(badWorldFilter, { max: 1 }).then(async (collected: any) => {
            const r = collected.first();

            if (r.emoji.name === '✅') {
                antyInviteEmbed.setAuthor('Wiadomość została zweryfikowana przez administratora!');
                antyInviteEmbed.setColor(EmbedColors.Normal);

                await antyInviteMessage.edit(antyInviteEmbed);

                await message.channel.send(`Odblokowana wiadomość ${message.author.tag}: ${message.content}`);


                messageToVerificateEmbed.setAuthor('Wiadomość zostanie usunięta za 5 sekund');
                messageToVerificateEmbed.setColor(EmbedColors.Warning);
                await messageToVerificate.edit(messageToVerificateEmbed);

                setTimeout(async () => {
                    await antyInviteMessage.delete();
                    await messageToVerificate.delete();
                }, 5000);
            }
        });
    }
} 