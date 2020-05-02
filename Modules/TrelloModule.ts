import TrelloNodeAPI from '../../node_modules/trello-node-api';
import  { trelloOAuthToken, trelloApiKey }  from '../Config';
import { TrelloListModel } from '../Models/TrelloListModel';

const trello = new TrelloNodeAPI();





export const listRequest = async (listId: string) => {
    trello.setApiKey(trelloApiKey);
    trello.setOauthToken(trelloOAuthToken);


    let res;
    await trello.list.search(listId).then((response: TrelloListModel) => {
        console.log(response);
        res = response;
    }, error => {
        console.log(error);
    });

    return res;
}

export const getTrelloBoardLists = async (boardId: string) => {
    trello.setApiKey(trelloApiKey);
    trello.setOauthToken(trelloOAuthToken);

    let res;
    await trello.board.searchLists(boardId).then((response: TrelloListModel[]) => {
        res = response;
    }, error => {
        console.log(error);
    })

    return res;
};

export const createTrelloList = async (name: string, boardId: string) => {
    trello.setApiKey(trelloApiKey);
    trello.setOauthToken(trelloOAuthToken);

    const data: any = {
        name: name,
        idBoard: boardId,
    };

    let reponse;
    await trello.list.create(data).then((response: any) => {
        console.log(reponse);
    }, error => {
        console.log(error);
    });
};

export const createTrelloCardForList = async (listId: string, content: string, description: string) => {
    trello.setApiKey(trelloApiKey);
    trello.setOauthToken(trelloOAuthToken);

    const data: any = {
        name: content,
        desc: description,
        idList: listId
    };

    let response;
    await trello.card.create(data).then((res: any) => {
        response = res;
    }, error => {
        console.log(error);
    });

    return response;
};

export const deleteTrelloCardFromList = async (cardId: string) => {
    trello.setApiKey(trelloApiKey);
    trello.setOauthToken(trelloOAuthToken);

    let response;
    await trello.card.del(cardId).then((res: any) => {
        res = response;
    }, error => {
        console.log(error);
    });
};