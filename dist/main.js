require('proto.creep');
require('proto.tower');

const roles = {
  'harvester'      : require('role.harvester'),
  'builder'        : require('role.builder'),
  'upgrader'       : require('role.upgrader'),
  'repairer'       : require('role.repairer'),
  'miner'          : require('role.miner'),
  'courier'        : require('role.courier'),
  'reserver'       : require('role.reserver'),
  'remote-miner'   : require('role.remote-miner'),
  'remote-courier' : require('role.remote-courier'),
  'remote-defender': require('role.remote-defender'),
};

const pop = require('population');
const stats = require('stats');

const rooms = [
  {
    name    : 'W52N51',
    intent  : 'reserve', wait: true, isSafe: true,
    reserver: false,
    defender: false,
    sources : 1,
    miners  : [],
    couriers: [],
  },
  {
    name    : 'W51N52',
    intent  : 'reserve', wait: true, isSafe: true,
    reserver: false,
    defender: false,
    sources : 1,
    miners  : [],
    couriers: [],
  },
];

if (Memory.rooms.length !== rooms.length) {
  rooms.forEach(room => {
    if (_.find(Memory.rooms, r => r.name === room.name) === -1) {
      Memory.rooms.push(room);
    }
  });
}

module.exports.loop = function () {
  Memory.home = Game.spawns['Spawn1'].room;

  // Population management.
  pop.mourn();
  pop.breedFrom(Game.spawns['Spawn1']);

  // Make em work!
  Object.values(Game.creeps).forEach(creep => roles[creep.memory.role].run(creep));

  // Room priority logic
  Object.entries(Memory.rooms).forEach(([key, room]) => {
    if (!room.wait && room.intent === 'reserve') {
      if (!room.defender ||
          room.miners.length < room.sources ||
          room.couriers.length < room.sources) {
        for (let i = parseInt(key) + 1; i < Memory.rooms.length; i++) {
          if (Memory.rooms[i] && !Memory.rooms[i].wait && Memory.rooms[i].intent === 'reserve') {
            Memory.rooms[i].wait = true;
          }
        }
      } else {
        let nextRoom = Memory.rooms[parseInt(key) + 1];
        if (nextRoom && nextRoom.wait && nextRoom.intent === 'reserve') {
          nextRoom.wait = false;
        }
      }
    }
  });

  // Towers engage!
  _.filter(Game.structures, s => s.structureType === STRUCTURE_TOWER)
      .forEach(t => t.defend());

  // Stats
  stats.energyStatus();
};
