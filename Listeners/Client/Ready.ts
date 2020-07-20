import { Listener } from 'discord-akairo';
import { delay } from '../../Helpers/Wait';

export default class ReadyListener extends Listener {
    public constructor() {
        super('ready', {
            emitter: 'client',
            event: 'ready',
            category: 'client'
        });
    }

    public async exec() {
        await this.client.user.setStatus('dnd');

        const activityText = 'Więcej informacji wkrótce';
        let currentText: string = '';

        (async () => {
            while(true) {

                for (let index = 0; index < activityText.length; index++) {
                    await delay(4000);
                    currentText += activityText[index];

                    await this.client.user.setActivity({
                        name: `${currentText}`,
                        type: 'PLAYING',
                    });

                    if(activityText === currentText) {
                        currentText = '';
                    }
                }

            }
          })();
        console.log(`✅ ${this.client.user.tag} został włączony pomyślnie!`);
    }
}