require('proto.creep');
require('proto.tower');

const roles = {
  harvester  : require('role.harvester'),
  builder    : require('role.builder'),
  upgrader   : require('role.upgrader'),
  repairer   : require('role.repairer'),
  miner      : require('role.miner'),
  courier    : require('role.courier'),
  reserver   : require('role.reserver'),
  minerRemote: require('role.remote-miner'),
};

const pop = require('population');
const stats = require('stats');

Memory.roomsToReserve = [
  { name: 'W52N51', reserver: true, sources: 1, miners: [] },
];

module.exports.loop = function () {
  Memory.home = Game.spawns['Spawn1'].room;

  // Population management.
  pop.mourn();
  pop.breedFrom(Game.spawns['Spawn1']);

  // Make em work!
  for (let name in Game.creeps) {
    let creep = Game.creeps[name];
    // Command the builders
    if (Memory.roomsToReserve.length && creep.memory.role === 'builder') {
      roles[creep.memory.role].run(creep, Memory.home, Memory.home);
      continue
    }
    roles[creep.memory.role].run(creep);
  }

  // Towers engage!
  _.filter(Game.structures, s => s.structureType === STRUCTURE_TOWER)
      .forEach(t => t.defend());

  // Stats
  stats.energyStatus();
};
