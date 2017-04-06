import * as proto from "./wire-events";
import { eventTypes } from "./wire-events";

const actionId = "567";
const roomId = "123";
const callId = "234";
const msgId = "345";
const alice = "321";
const bob = "987";

const events: Array<proto.WireEvent> = [{
  type: eventTypes.HEARTBEAT,
  timestamp: Date.now()
} as proto.WireHeartbeat, {
  type: eventTypes.ROOM_INVITATION,
  inviter: bob,
  room: {
    id: roomId,
    name: "room",
    direct: false
  }
} as proto.WireRoomInvitation, {
  type: eventTypes.ROOM_TYPING,
  id: roomId,
  user: alice,
  timestamp: Date.now(),
} as proto.WireRoomTyping, proto.presenceRequest("available"), {
  type: eventTypes.PRESENCE_UPDATE,
  user: alice,
  status: "away",
  timestamp: Date.now(),
} as proto.WirePresenceUpdate, proto.error("Because!", {
  error: "error",
  text: "string"
}, "23425"), {
  type: eventTypes.ROOM_MARK,
  id: roomId,
  timestamp: Date.now()
} as proto.WireRoomMark, {
  type: eventTypes.ROOM_MESSAGE,
  id: roomId,
  message: {
    type: "message",
    id: msgId,
    body: "Oi papi!",
    user: alice,
    room: roomId,
    timestamp: Date.now(),
  }
} as proto.WireRoomMessage, {
  type: eventTypes.ROOM_ACTION,
  id: roomId,
  action: {
    type: "room_action",
    action: "joined",
    id: actionId,
    room: roomId,
    user: alice,
    timestamp: Date.now()
  }
} as proto.WireRoomActionSent, {
  type: eventTypes.ROOM_ACTION,
  id: roomId,
  action: {
    type: "room_action",
    action: "invited",
    id: actionId,
    room: roomId,
    user: alice,
    invitee: bob,
    timestamp: Date.now()
  }
} as proto.WireRoomActionSent, {
  type: eventTypes.ROOM_ACTION,
  id: roomId,
  action: {
    type: "room_action",
    action: "left",
    id: actionId,
    room: roomId,
    user: alice,
    reason: "reason",
    timestamp: Date.now()
  }
} as proto.WireRoomActionSent, {
  type: eventTypes.CALL_ACTION,
  id: callId,
  action: {
    type: "call_action",
    action: "joined",
    id: actionId,
    call: callId,
    user: alice,
    timestamp: Date.now()
  }
} as proto.WireCallActionSent, {
  type: eventTypes.CALL_ACTION,
  id: callId,
  action: {
    type: "call_action",
    action: "invited",
    id: actionId,
    call: callId,
    user: alice,
    invitee: bob,
    timestamp: Date.now()
  }
} as proto.WireCallActionSent, {
  type: eventTypes.CALL_ACTION,
  id: callId,
  action: {
    type: "call_action",
    action: "left",
    id: actionId,
    call: callId,
    user: alice,
    reason: "reason",
    timestamp: Date.now()
  }
} as proto.WireCallActionSent, {
  type: eventTypes.CALL_ACTION,
  id: callId,
  action: {
    type: "call_action",
    action: "audio_muted",
    id: actionId,
    call: callId,
    user: alice,
    timestamp: Date.now()
  }
} as proto.WireCallActionSent, {
  type: eventTypes.CALL_ACTION,
  id: callId,
  action: {
    type: "call_action",
    action: "audio_unmuted",
    id: actionId,
    call: callId,
    user: alice,
    timestamp: Date.now()
  }
} as proto.WireCallActionSent, {
  type: eventTypes.CALL_ACTION,
  id: callId,
  action: {
    type: "call_action",
    action: "video_paused",
    id: actionId,
    call: callId,
    user: alice,
    timestamp: Date.now()
  }
} as proto.WireCallActionSent, {
  type: eventTypes.CALL_ACTION,
  id: callId,
  action: {
    type: "call_action",
    action: "video_unpaused",
    id: actionId,
    call: callId,
    user: alice,
    timestamp: Date.now()
  }
} as proto.WireCallActionSent,
proto.muteAudio(callId),
proto.unmuteAudio(callId),
proto.pauseVideo(callId),
proto.unpauseVideo(callId)];

describe("Protocol", () => {
  it("should be reversible", () => {
    events.forEach((e) => expect(proto.read(proto.write(e))).toEqual(e));
  });
});
