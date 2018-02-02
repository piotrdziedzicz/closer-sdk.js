![SDK](./sdk.png)

# Ratel JavaScript SDK
Building:

```
npm install
npm run build
```

Running:

```
npm start
```

Test environment:

```
npm test
npm run test-dev
```

## 307 response:
When run locally, SDK will connect with ratel & artichoke via `http` protocol.
 This causes HSTS problem.
 To hack this in Chrome (http://stackoverflow.com/questions/34108241/non-authoritative-reason-header-field-http):
 - open chrome://net-internals/#hsts
 - delete domains: 'api.dev.ratel.io' and 'artichoke.ratel.io'
 - enjoy


# Changelog
The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)

## 0.5.15
### Added
- Export Call type

## 0.5.14
### Added
- Handle endpoint for fetching calls with pending invitations

## 0.5.13
### Fixed
- Reconnection do not break websocket

## 0.5.12
### Fixed
- Fix onServerUnreachable events after reconnecting
### Changed
- onDisconnect is not fired on browser offline event anymore.
Use onServerUnreachable instead which is more reliable.

## 0.5.11
### Changed
- Upgraded webrtc-adapter

## 0.5.10
### Added
- \"onServerUnreachable\" callback which is fired when no heartbeat is received from Artichoke within double timeout given in \"Hello\" event

## 0.5.9
### Changed
- Rooms now contain marks of all users in form of a map (userId -> timestamp)
- There's a new, separate RoomMarked event, specific for mark updates from server for all users

## 0.5.8
### Fixed
- Fix DEBUG logging level

## 0.5.7
### Added
- Endpoint for fetching active calls

## 0.5.6
### Changed
- Allow passing multiple chat history filters

## 0.5.5
### Changed
- Renamed `CallOffline`/`CallOnline` to `Offline`/`Online` and updated type tags
- Field `user` changed to `userId` in messages.

## 0.5.4
### Added
- Method for fetchin call users in `ArtichokeAPI`
### Fixed
- Call creator sends WebRTC offer to other users on call object creation

## 0.5.3
### Changed
- `Call` has `creator` field

## 0.5.2
### Added
- Optional context parameter that is passed to the invitee in `createDirect` room methods

## 0.5.1
### Changed
- `Call` no longer has `externalId` field

## 0.5.0
### Added
- `Message` class now has `tag` and optional `context` fields (plain text messages have `tag` set to `TEXT_MESSAGE` and no context).
- `Room` now has `onCustom(tag, callback)`, `sendCustom(body, tag, context)` methods used to send/receive custom messages.

### Changed
- `Room`/`Call` actions are now instances of `Message` class with appropriate `tag` value (`ROOM_JOINED`, `CALL_TRANSFERRED`, etc).
- Actions store context data in `context` field (`message.context.invitee` for invitations and `message.context.reason` for leaves).
- Old `Room`/`Call` callbacks (`onJoined()`, `onLeft()`, etc) still work correctly althoug they now pass a `Message` instance to the callback.

### Removed
- There are no `Media` nor `Metadata` clasess any longer.
- There are no `CallAction`, `RoomAction` events any longer.
- `Room` now doesn't have `onMedia()`, `onMetadata()`, `sendMedia()` nor `sendMetadata()`.

## 0.4.12
### Changed
- `RoomCreated` event has now rich Room object
