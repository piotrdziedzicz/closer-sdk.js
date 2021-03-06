// tslint:disable:readonly-array

import { Session, roomEvents } from '@closerplatform/closer-sdk';
import { makeChatBox, makeInputWithBtn, makeDiv, makeMessageEntry } from'../view';
import { Page } from '../page';
import { ConversationService } from './conversation.service';
import { Credentials } from '../credentials';
import { Logger } from '../logger';

interface MessageHandle {
  messageId: string;
  authorId: string;
  elem: JQuery;
}

enum MessageColors {
  undelievered = 'border-warning',
  delievered = 'border-success',
  opposite = 'border-secondary',
  read = 'border-info'
}

export class ConversationModule {
  private static readonly INFO_TIME = 2000;

  private textBox: JQuery;
  private infoText: JQuery;
  private inner: JQuery;
  private messages: MessageHandle[];

  private infoTimeout: ReturnType<typeof setTimeout>;
  private conversationService: ConversationService;
  private credentials: Credentials;

  public init = async (roomId: string, session: Session, credentials: Credentials): Promise<void> => {
    this.credentials = credentials;
    this.conversationService = new ConversationService(session);
    await this.conversationService.setRoom(roomId);

    this.conversationService.setMessageCallback(this.handleMessageCallback);
    this.conversationService.setTypingCallback(this.handleTypingCallback);
    this.conversationService.setDelieveredCallback(this.handleDelieveredCallback);
    this.conversationService.setMarkedCallback(this.handleMarkedCallback);

    window.addEventListener('focus', () => {
      this.conversationService.setMark();
    });

    this.render();
    await this.refreehTextBox();
  }

  public toggleVisible = (visible = true): void => {
    if (visible) {
      this.inner.show();
      Logger.log(this.messages);
    } else {
      this.inner.hide();
    }
  }

  private handleMessageCallback = (msg: roomEvents.MessageSent): void => {
    const ctx = JSON.stringify(msg.context);
    this.textBoxAppend(msg);
    if (ctx !== '{}') {
      this.textBox.append(ctx);
    }

    if (msg.authorId !== this.credentials.id) {
      this.conversationService.setDelievered(msg.messageId);
      this.infoText.empty();
      clearTimeout(this.infoTimeout);
    }
  }

  private handleTypingCallback = (ts: roomEvents.TypingSent): void => {
    this.infoText.empty();
    this.infoText.append('<small class="text-primary">User is typing...</small>');

    Logger.log(ts);

    clearTimeout(this.infoTimeout);
    this.infoTimeout = setTimeout(this.clearInfoText, ConversationModule.INFO_TIME);
  }

  private handleDelieveredCallback = (message: roomEvents.MessageDelivered): void => {
    const messageHandle = this.messages.find(m => m.messageId === message.messageId);
    if (messageHandle) {
      messageHandle.elem.removeClass(MessageColors.undelievered).addClass(MessageColors.delievered);
    }
  }

  private handleMarkedCallback = (mark: roomEvents.MarkSent): void => {
    if (mark.authorId === this.credentials.id) {
      return;
    }

    this.messages.filter(mh => mh.authorId === this.credentials.id).forEach(mh => {
      mh.elem
      .removeClass([MessageColors.delievered, MessageColors.undelievered])
      .addClass(MessageColors.read);
    });
  }

  private clearInfoText = (): void => {
    this.infoText.empty();
  }

  private refreehTextBox = async (): Promise<void> => {
    this.messages = [];
    const history = await this.conversationService.getRoomMessageHistory();
    this.textBoxEmpty();
    if (history) {
      history.items.forEach(message => {
        this.textBoxAppend(message as roomEvents.MessageSent, false);
      });
    }
  }

  private textBoxAppend = (message: roomEvents.MessageSent, isNewMessage = true): void => {
    if (message.message) {
      const isAuthor = message.authorId === this.credentials.id;

      const color = isAuthor ?
      `${isNewMessage ? MessageColors.undelievered : MessageColors.read}` :
      MessageColors.opposite;

      const position = isAuthor ? 'align-self-end' : 'align-self-start';
      const border = isAuthor ? 'border-right' : 'border-left';

      const messageEntry = makeMessageEntry(message.message, [position, border, color]);
      this.messages.push({
        messageId: message.messageId,
        authorId: message.authorId,
        elem: messageEntry
      });
      this.textBox.append(messageEntry);
    }
  }
  private textBoxEmpty = (): void => {
    this.textBox.empty();
  }

  private render = (): void => {
    this.textBox = makeChatBox();
    const legend = makeDiv().prop({
      class: 'd-flex justify-content-center my-3'
    }).append([
      makeMessageEntry('Others\' message', ['border-left', MessageColors.opposite]),
      makeMessageEntry('Not delievered', ['border-right', MessageColors.undelievered]),
      makeMessageEntry('Delievered', ['border-right', MessageColors.delievered]),
      makeMessageEntry('Read', ['border-right', MessageColors.read])
    ]);

    const msgInput = makeInputWithBtn(Page.msgInputId, this.sendCallback, 'Send',
      'Type your message here...', '', this.conversationService.indicateTyping);
    this.infoText = makeDiv().prop({
      class: 'mb-3'
    });

    this.inner = makeDiv().append([legend, this.textBox, msgInput, this.infoText]);
    Page.contents.append(this.inner);
  }

  private sendCallback = (inputValue: string): void => {
    if (!this.conversationService.room) {
      alert('Not connected to any room');
    } else {
      this.conversationService.sendMessage(inputValue);
      $(`#${Page.msgInputInnerId}`).val('');
    }
  }
}
