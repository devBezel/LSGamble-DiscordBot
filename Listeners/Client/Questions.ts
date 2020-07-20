import { Listener } from "discord-akairo";
import { Message } from "discord.js";
import { faqLikeQuestions, faqAnwserList, channelForSendRequestAnwser } from "../../Config";
import { MessageEmbed } from "discord.js";
import { EmbedColors } from "../../Constants/EmbedColors";
import { Channel } from "discord.js";

export default class QuestionsListener extends Listener {

    public constructor() {
        super('questions', {
            emitter: 'client',
            event: 'message',
            category: 'client'
        });
    }

    public async exec(message: Message) {
        console.log(message.content);

        const questionEmbed = new MessageEmbed()
            .setAuthor('Zauważyliśmy, że twoje pytanie jest identyczne z najczęściej zadawanymi pytaniami. Chcesz otworzyć tablicę z FAQ?')
            .setFooter('Kliknij zielone kółko jeśli chcesz, jeżeli nie kliknij czerowne')
            .setColor(EmbedColors.Normal);
        
        let messageQuestion: Message = null;

        for (let i = 0; i < faqLikeQuestions.length; i++) {
            if(message.content === faqLikeQuestions[i]) {
                messageQuestion = await message.channel.send(questionEmbed);
                
                await messageQuestion.react('🟢');
                await messageQuestion.react('🔴');
                
            }
        }

        if(messageQuestion == null) return;

        const filter = (reaction, user) => {
            return ['🟢', '🔴'].includes(reaction.emoji.name) && user.id === message.author.id;
        };

        await messageQuestion.awaitReactions(filter, { max: 1 }).then(async (collected: any) => {
            const r = collected.first();

            if(r.emoji.name === '🟢') {

                questionEmbed.setAuthor('Zaraz ukażą się najczęsciej zadawane pytania...');
                questionEmbed.setColor(EmbedColors.Warning);

                await messageQuestion.edit(questionEmbed);

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


                const questionAddpropositionFilter = (reacion, user) => {
                    return ['⬆'].includes(reacion.emoji.name) && user.id === message.author.id;
                };

                await messageQuestion.awaitReactions(questionAddpropositionFilter, { max: 1 }).then(async (collectedPropostion: any) => {
                    let cR = collectedPropostion.first();

                    if(cR.emoji.name === '⬆') {

                        questionEmbed.setAuthor('Twoje pytanie zostało wysłane do administracji i po analizie zostanie dodane do FAQ');
                        questionEmbed.setColor(EmbedColors.Normal);

                        questionEmbed.fields = [];

                        questionEmbed.setFooter('');

                        await messageQuestion.edit(questionEmbed);

                        // TODO: Zgloszenie pytania gdzies na kanal do administracji

                        const messageForAdminChannel = this.client.channels.get(channelForSendRequestAnwser);
                        if(messageForAdminChannel) {
                           const messageForAdminEmbed = new MessageEmbed()
                            .setAuthor(`${message.author.tag} zgłosił, że jego pytania nie ma w FAQ`)
                            .setColor(EmbedColors.Normal)
                            .addField('Pytanie od zgłaszającego', message.content);

                            // @ts-ignore
                            messageForAdminChannel.send(messageForAdminEmbed);
                        }

                        setTimeout(async () => {
                            await messageQuestion.delete();
                        }, 5000);
                    }
                });

            } else {
                // Kończymy i usuwamy
                questionEmbed.setAuthor('Ta wiadomość zniknie za 5 sekund...');
                questionEmbed.setColor(EmbedColors.Warning);

                await messageQuestion.edit(questionEmbed);

                setTimeout(async () => {
                    await messageQuestion.delete();
                }, 5000);
            }
        });
    }

    // public async anwserForFaq(questionEmbed: MessageEmbed) {


    // }
}