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

if (!Memory.rooms) {
  Memory.rooms = [
    { name: 'W52N51', intent: 'reserve', reserver: false, defender: false, sources: 1, miners: [], courier: false },
    { name: 'W51N52', intent: 'reserve', reserver: false, defender: false, sources: 1, miners: [], courier: false },
  ];
}

module.exports.loop = function () {
  Memory.home = Game.spawns['Spawn1'].room;

  // Population management.
  pop.mourn();
  pop.breedFrom(Game.spawns['Spawn1']);

  // Make em work!
  for (let name in Game.creeps) {
    let creep = Game.creeps[name];
    // Command the builders
    if (Memory.rooms.length && creep.memory.role === 'builder') {
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
