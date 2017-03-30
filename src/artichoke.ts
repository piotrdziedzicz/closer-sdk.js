import { ArtichokeAPI } from "./api";
import { Call, createCall, DirectCall } from "./call";
import { ChatConfig } from "./config";
import { Callback, EventHandler } from "./events";
import { Logger } from "./logger";
import * as proto from "./protocol";
import { CallInvitation } from "./protocol";
import { RichCallInvitation, richEvents, RichRoomInvitation } from "./rich-events";
import { createRoom, DirectRoom, GroupRoom, Room } from "./room";
import { wrapPromise } from "./utils";

export class Artichoke {
  private api: ArtichokeAPI;
  private config: ChatConfig;
  private log: Logger;
  private events: EventHandler;

  constructor(config: ChatConfig, log: Logger, events: EventHandler, api: ArtichokeAPI) {
    this.api = api;
    this.config = config;
    this.log = log;
    this.events = events;

    // NOTE Disable some events by default.
    let nop = (e: proto.Event) => {
      // Do nothing.
    };
    events.onEvent("error", nop);
    events.onEvent("chat_received", nop);
    events.onEvent("chat_delivered", nop);
  }

  // Callbacks:
  onConnect(callback: Callback<proto.Hello>) {
    this.events.onEvent("hello", callback);
  }

  onHeartbeat(callback: Callback<proto.Heartbeat>) {
    this.events.onEvent("heartbeat", callback);
  }

  onDisconnect(callback: Callback<proto.Disconnect>) {
    this.events.onEvent("disconnect", callback);
  }

  onError(callback: Callback<proto.Error>) {
    this.events.onError(callback);
  }

  // API:
  connect() {
    this.api.connect();

    this.api.onEvent((e: proto.Event) => {
      if (richEvents.isCallInvitation(e)) {

        const call = createCall(e.call, this.config.rtc, this.log, this.events, this.api);
        const richEvent: RichCallInvitation =  { ...e, call };
        this.events.notify(richEvent);

      } else if (richEvents.isRichRoomInvitation(e)) {

        const room: Room = createRoom(e.room, this.log, this.events, this.api);
        const richEvent: RichRoomInvitation = {...e, room };
        this.events.notify(richEvent);

      } else {

        this.events.notify(e);

      }

    });
  }

  disconnect() {
    this.api.disconnect();
  }

  // Bot API:
  onBotUpdate(callback: Callback<proto.BotUpdated>) {
    this.events.onEvent("bot_updated", callback);
  }

  createBot(name: string, callback?: string): Promise<proto.Bot> {
    return this.api.createBot(name, callback);
  }

  getBot(bot: proto.ID): Promise<proto.Bot> {
    return this.api.getBot(bot);
  }

  getBots(): Promise<Array<proto.Bot>> {
    return this.api.getBots();
  }

  // Call API:
  onCall(callback: Callback<CallInvitation>) {
    this.events.onEvent("call_invitation", callback);
  }

  createDirectCall(stream: MediaStream, peer: proto.ID, timeout?: number): Promise<DirectCall> {
    return this.wrapCall(this.api.createDirectCall(peer, timeout), stream);
  }

  createCall(stream: MediaStream, users: Array<proto.ID>): Promise<Call> {
    return this.wrapCall(this.api.createCall(users), stream);
  }

  getCall(call: proto.ID): Promise<Call | DirectCall> {
    return this.wrapCall(this.api.getCall(call));
  }

  getCalls(): Promise<Array<Call | DirectCall>> {
    return this.wrapCall(this.api.getCalls());
  }

  // Chat room API:
  onRoom(callback: Callback<RichRoomInvitation>) {
    this.events.onEvent("room_invitation", callback);
  }

  createRoom(name: string): Promise<GroupRoom> {
    return this.wrapRoom(this.api.createRoom(name));
  }

  createDirectRoom(peer: proto.ID): Promise<DirectRoom> {
    return this.wrapRoom(this.api.createDirectRoom(peer));
  }

  getRoom(room: proto.ID): Promise<Room> {
    return this.wrapRoom(this.api.getRoom(room));
  }

  getRooms(): Promise<Array<Room>> {
    return this.wrapRoom(this.api.getRooms());
  }

  getRoster(): Promise<Array<Room>> {
    return this.wrapRoom(this.api.getRoster());
  }

  // Presence API:
  onStatusUpdate(callback: Callback<proto.PresenceUpdate>) {
    this.events.onEvent("presence_update", callback);
  }

  setStatus(status: proto.Status) {
    this.api.setStatus(status);
  }

  // Utils:
  private wrapCall(promise: Promise<proto.Call | Array<proto.Call>>, stream?: MediaStream) {
    return wrapPromise(promise, (call) => createCall(call, this.config.rtc, this.log, this.events, this.api, stream));
  }

  private wrapRoom(promise: Promise<proto.Room | Array<proto.Room>>) {
    return wrapPromise(promise, (room: proto.Room) => createRoom(room, this.log, this.events, this.api));
  }
}
