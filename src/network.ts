import * as THREE from 'three';
import { joinRoom, selfId } from 'trystero';
import { NetworkPlayer } from './types';
import { createCharacter, CharacterController } from './character';

export interface NetworkManager {
  roomId: string;
  selfPeerId: string;
  connectedPeersCount: number;
  remoteControllers: Map<string, CharacterController>;
  broadcastPlayerState: (player: NetworkPlayer) => void;
  broadcastAction: (action: { type: string; [key: string]: any }) => void;
  broadcastMonsterHit: (hitData: { monsterId: string; damage: number }) => void;
  broadcastChat: (text: string, senderName: string) => void;
  onMonsterHitReceived: (cb: (hitData: { monsterId: string; damage: number }) => void) => void;
  onChatReceived: (cb: (msg: { text: string; senderName: string; peerId: string }) => void) => void;
  update: (delta: number) => void;
  destroy: () => void;
}

export function initNetwork(
  scene: THREE.Scene,
  roomId: string,
  onPeerJoin?: (peerId: string) => void,
  onPeerLeave?: (peerId: string) => void
): NetworkManager {
  const room = joinRoom({ appId: 'aether-quest-rpg-v1' }, roomId);
  const selfPeerId = selfId;

  const remoteControllers = new Map<string, CharacterController>();
  const remoteTargetStates = new Map<string, NetworkPlayer>();

  // Actions
  const playerStateAction = room.makeAction<NetworkPlayer>('player_state');
  const playerAction = room.makeAction<{ type: string; [key: string]: any }>('player_action');
  const monsterHitAction = room.makeAction<{ monsterId: string; damage: number }>('monster_hit');
  const chatAction = room.makeAction<{ text: string; senderName: string; time: number }>('chat');

  let monsterHitCb: ((data: any) => void) | null = null;
  let chatCb: ((data: any) => void) | null = null;

  // Peer joined
  room.onPeerJoin = (peerId: string) => {
    // Random hue for peer hero tunic
    const peerColor = (0x1000000 + Math.random() * 0xffffff).toString(16).substring(1, 7);
    const controller = createCharacter(parseInt(peerColor, 16), false);
    scene.add(controller.mesh);
    remoteControllers.set(peerId, controller);
    if (onPeerJoin) onPeerJoin(peerId);
  };

  // Peer left
  room.onPeerLeave = (peerId: string) => {
    const controller = remoteControllers.get(peerId);
    if (controller) {
      scene.remove(controller.mesh);
      remoteControllers.delete(peerId);
    }
    remoteTargetStates.delete(peerId);
    if (onPeerLeave) onPeerLeave(peerId);
  };

  // Receive player state updates
  playerStateAction.onMessage = (data: NetworkPlayer, context: { peerId: string }) => {
    const peerId = context.peerId;
    remoteTargetStates.set(peerId, data);

    let ctrl = remoteControllers.get(peerId);
    if (!ctrl) {
      ctrl = createCharacter(parseInt(data.color.replace('#', ''), 16) || 0x2e86de, false);
      scene.add(ctrl.mesh);
      remoteControllers.set(peerId, ctrl);
    }
    ctrl.setNameTag(data.name || 'Hero', data.hp, data.maxHp);
  };

  // Receive player actions (attacks, skills)
  playerAction.onMessage = (data: { type: string; [key: string]: any }, context: { peerId: string }) => {
    const ctrl = remoteControllers.get(context.peerId);
    if (!ctrl) return;

    if (data.type === 'attack') {
      ctrl.triggerAttack(data.combo || 1);
    } else if (data.type === 'dash') {
      ctrl.triggerDash(new THREE.Vector3(data.dirX, 0, data.dirZ));
    } else if (data.type === 'whirlwind') {
      ctrl.triggerWhirlwind();
    } else if (data.type === 'beam') {
      ctrl.triggerBeam();
    }
  };

  // Receive monster damage from peers
  monsterHitAction.onMessage = (data: { monsterId: string; damage: number }) => {
    if (monsterHitCb) monsterHitCb(data);
  };

  // Receive chat messages
  chatAction.onMessage = (data: { text: string; senderName: string; time: number }, context: { peerId: string }) => {
    if (chatCb) chatCb({ ...data, peerId: context.peerId });
  };

  return {
    roomId,
    selfPeerId,
    get connectedPeersCount() {
      return remoteControllers.size;
    },
    remoteControllers,

    broadcastPlayerState: (player: NetworkPlayer) => {
      playerStateAction.send(player);
    },

    broadcastAction: (action: { type: string; [key: string]: any }) => {
      playerAction.send(action);
    },

    broadcastMonsterHit: (hitData: { monsterId: string; damage: number }) => {
      monsterHitAction.send(hitData);
    },

    broadcastChat: (text: string, senderName: string) => {
      chatAction.send({ text, senderName, time: Date.now() });
    },

    onMonsterHitReceived: (cb) => {
      monsterHitCb = cb;
    },

    onChatReceived: (cb) => {
      chatCb = cb;
    },

    update: (delta: number) => {
      // Smooth lerp remote players towards their latest positions
      remoteTargetStates.forEach((target, peerId) => {
        const ctrl = remoteControllers.get(peerId);
        if (!ctrl) return;

        const currentPos = ctrl.mesh.position;
        const targetVec = new THREE.Vector3(target.x, target.y, target.z);
        const dist = currentPos.distanceTo(targetVec);

        if (dist > 0.05) {
          currentPos.lerp(targetVec, Math.min(1, delta * 12));
          ctrl.mesh.rotation.y = THREE.MathUtils.lerp(ctrl.mesh.rotation.y, target.rotationY, delta * 12);
          ctrl.update(delta, true);
        } else {
          ctrl.update(delta, false);
        }
      });
    },

    destroy: () => {
      room.leave();
      remoteControllers.forEach(ctrl => scene.remove(ctrl.mesh));
      remoteControllers.clear();
      remoteTargetStates.clear();
    }
  };
}
