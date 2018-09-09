require('proto.creep');
require('proto.tower');

const harvester = require('role.harvester');
const builder = require('role.builder');
const upgrader = require('role.upgrader');
const repairer = require('role.repairer');

const pop = require('population');
const stats = require('stats');

let CREEP_LIMITS = {
  harvesters: 4,
  builders  : 2,
  upgraders : 1,
  repairers : 0,
};

module.exports.loop = function () {
  // Population management.
  pop.mourn();
  pop.keep(Game.spawns['Spawn1'], CREEP_LIMITS);

  // Make em work!
  for (let name in Game.creeps) {
    let creep = Game.creeps[name];
    switch (creep.memory.role) {
      case 'harvester':
        harvester.run(creep);
        break;
      case 'builder':
        builder.run(creep);
        break;
      case 'upgrader':
        upgrader.run(creep);
        break;
      case 'repairer':
        repairer.run(creep);
        break;
    }
  }

  // Stats
  stats.energyStatus();
};
