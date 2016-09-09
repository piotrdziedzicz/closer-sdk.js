import { API } from "./api";
import { Callback, EventHandler } from "./events";
import { Logger } from "./logger";
import { createMessage, Message } from "./message";
import * as proto from "./protocol";
import { wrapPromise } from "./utils";

class BaseRoom implements proto.Room {
    public id: proto.ID;
    public name: string;
    public direct: boolean;

    private currMark: number;
    private log: Logger;
    protected events: EventHandler;
    protected api: API;

    constructor(room: proto.RosterRoom, log: Logger, events: EventHandler, api: API) {
        this.id = room.id;
        this.name = room.name;
        this.direct = room.direct;
        this.currMark = room.mark || 0;
        this.log = log;
        this.events = events;
        this.api = api;
    }

    getHistory(): Promise<Array<Message>> {
        return this.wrapMessage(this.api.getRoomHistory(this.id));
    }

    getUsers(): Promise<Array<proto.ID>> {
        return this.api.getRoomUsers(this.id);
    }

    getMark(): Promise<number> {
        let _this = this;
        return new Promise(function(resolve, reject) {
            // NOTE No need to retrieve the mark if it's cached here.
            resolve(_this.currMark);
        });
    }

    send(message: string): Promise<Message> {
        return this.wrapMessage(this.api.sendMessage(this.id, message));
    }

    mark(timestamp: proto.Timestamp) {
        this.currMark = timestamp;
        this.api.setMark(this.id, timestamp);
    }

    indicateTyping() {
        this.api.sendTyping(this.id);
    }

    onMessage(callback: Callback<proto.Message>) {
        // FIXME This ought to be a onContreceEvent() call.
        let _this = this;
        this.events.onEvent("message", function(msg: proto.Message) {
            if (msg.room === _this.id) {
                callback(msg);
            }
        });
    }

    onTyping(callback: Callback<proto.Typing>) {
        this.events.onConcreteEvent("typing", this.id, callback);
    }

    private wrapMessage(promise: Promise<proto.Message | Array<proto.Message>>) {
        return wrapPromise(promise, (msg) => createMessage(msg, this.log, this.events, this.api));
    }
}

export class DirectRoom extends BaseRoom {}

export class Room extends BaseRoom {
    join(): Promise<void> {
        return this.api.joinRoom(this.id);
    }

    leave(): Promise<void> {
        return this.api.leaveRoom(this.id);
    }

    invite(user: proto.ID): Promise<void> {
        return this.api.inviteToRoom(this.id, user);
    }

    onJoined(callback: Callback<proto.RoomJoined>) {
        this.events.onConcreteEvent("room_joined", this.id, callback);
    }

    onLeft(callback: Callback<proto.RoomLeft>) {
        this.events.onConcreteEvent("room_left", this.id, callback);
    }

    onInvited(callback: Callback<proto.RoomInvited>) {
        this.events.onConcreteEvent("room_invited", this.id, callback);
    }
}

export function createRoom(room: proto.Room, log: Logger, events: EventHandler, api: API): DirectRoom | Room {
    if (room.direct) {
        return new DirectRoom(room, log, events, api);
    } else {
        return new Room(room, log, events, api);
    }
}
