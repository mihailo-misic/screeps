const startUpgrading = require('role.upgrader');

// Repairers: Repairs > Upgrades
module.exports = {
  run: function (creep) {
    creep.checkEnergyOr('🛠');

    if (creep.memory.working) {
      // Look for broken walls first.
      let target = creep.pos.findClosestByPath(FIND_STRUCTURES,
          { filter: (s) => (s.hits <= 20000) && s.structureType === STRUCTURE_WALL || s.structureType === STRUCTURE_RAMPART },
      );
      // Look for other stuff if walls are fine.
      if (!target) {
        target = creep.pos.findClosestByPath(FIND_STRUCTURES,
            { filter: (s) => s.hits < s.hitsMax && (s.structureType !== STRUCTURE_WALL && s.structureType !== STRUCTURE_RAMPART) },
        );
      }
      if (target) {
        if (creep.repair(target) === ERR_NOT_IN_RANGE) {
          creep.moveTo(target, { reusePath: 20, visualizePathStyle: { stroke: 'cyan' } });
        }
      } else {
        // Don't be useless start building!
        startUpgrading.run(creep);
      }
    } else {
      creep.getEnergy();
    }
  },
};
