import { Command } from "discord-akairo";
import { Message } from "discord.js";
import { MessageEmbed } from "discord.js";
import { EmbedColors } from "../../../Constants/EmbedColors";
import { faqAnwserList, channelForSendRequestAnwser } from "../../../Config";

export default class FAQCommand extends Command {
    constructor() {
        super('faq', {
            aliases: ['faq', 'pytania', 'start'],
            category: 'Question',
            description: {
                content: 'Pokazuje najczęściej zadawane pytania',
                examples: ['!faq'],
                usage: '!faq'
            },

            cooldown: 10
        });
    }

    public async exec(message: Message) {
        await message.delete();

        const questionEmbed = new MessageEmbed()
            .setAuthor('Zaraz ukażą się najczęsciej zadawane pytania...')
            .setColor(EmbedColors.Warning);

        const messageQuestion = await message.channel.send(questionEmbed);

        setTimeout(async () => {
            questionEmbed.setAuthor('❔ Najczęściej zadawane pytania');
            questionEmbed.setColor(EmbedColors.Normal);

            for (let i = 0; i < faqAnwserList.length; i++) {
                questionEmbed.addField(`${faqAnwserList[i].question}`, `${faqAnwserList[i].anwser}`);
            }

            questionEmbed.setFooter('Nie ma twojego pytania na liście? kliknij ikonę, aby poinformować nas o tym fakcie');

            messageQuestion.reactions.forEach((reaction: any) => {
                reaction.remove();
            });

            messageQuestion.react('⬆');
            await messageQuestion.edit(questionEmbed);
        }, 5000);

        // setTimeout(async () => {
        //     if(messageQuestion !== undefined) {
        //         await messageQuestion.delete();
        //     }
        // }, 5000);


        const questionAddpropositionFilter = (reacion, user) => {
            return ['⬆'].includes(reacion.emoji.name) && user.id === message.author.id;
        };

        await messageQuestion.awaitReactions(questionAddpropositionFilter, { max: 1 }).then(async (collectedPropostion: any) => {
            let cR = collectedPropostion.first();

            if (cR.emoji.name === '⬆') {

                questionEmbed.setAuthor('Napisz na czacie pytanie na które nie uzyskałeś odpowiedzi.');
                questionEmbed.setColor(EmbedColors.Normal);

                questionEmbed.fields = [];

                questionEmbed.setFooter('');
    
                await messageQuestion.edit(questionEmbed);

                const messageFilter = (response: Message) => {
                    return response.content && response.author.id === message.author.id;
                };

                await message.channel.awaitMessages(messageFilter, { max: 1, time: 30000, errors: ['time'] }).then(async (collected: any) => {
                    const messageQuestionFromUser = collected.first().content;

                    questionEmbed.setAuthor('Twoje pytanie zostało wysłane do administracji i po analizie zostanie dodane do FAQ');
                    questionEmbed.setColor(EmbedColors.Normal);
    
                    questionEmbed.fields = [];
    
                    questionEmbed.setFooter('');
    
                    await messageQuestion.edit(questionEmbed);
    
                    // TODO: Zgloszenie pytania gdzies na kanal do administracji
    
                    const messageForAdminChannel = this.client.channels.get(channelForSendRequestAnwser);
                    if (messageForAdminChannel) {
                        const messageForAdminEmbed = new MessageEmbed()
                            .setAuthor(`${message.author.tag} zgłosił, że jego pytania nie ma w FAQ`)
                            .setColor(EmbedColors.Normal)
                            .addField('Pytanie od zgłaszającego', messageQuestionFromUser);
    
                        // @ts-ignore
                        messageForAdminChannel.send(messageForAdminEmbed);
                        await collected.first().delete();
                    }
    
                    setTimeout(async () => {
                        await messageQuestion.delete();
                    }, 5000);

                }).catch(async () => {
                    questionEmbed.setAuthor('Czas na odpowiedź minął :( Wiadomość zostanie usunięta za 5 sekund');
                    questionEmbed.setColor(EmbedColors.Warning);
    
                    questionEmbed.fields = [];
        
                    await messageQuestion.edit(questionEmbed);

                    setTimeout(async () => {
                        await messageQuestion.delete();
                    }, 5000);
                });
            }
        });
    }
}