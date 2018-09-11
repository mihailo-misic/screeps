const startBuilding = require('role.builder');

// Harvesters: Deposits > Builds > Upgrades
module.exports = {
  run: function (creep) {
    creep.checkEnergyOr('📦');

    if (creep.memory.working) {
      let target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: (s) => {
          if ((s.structureType === STRUCTURE_EXTENSION
              || s.structureType === STRUCTURE_SPAWN)
              && s.energy < s.energyCapacity) {
            return true;
          }
          // This prevents the creep from feeding the tower for each shot
          if (s.structureType === STRUCTURE_TOWER && s.energy < (s.energyCapacity / 2)) {
            // It starts filling it if it's below 33% energy.
            creep.memory.busyWithTower = true;
          }
          if (s.structureType === STRUCTURE_TOWER && creep.memory.busyWithTower === true) {
            // Fill it with energy until it's full, and leave it be afterwords.
            creep.memory.busyWithTower = s.energy < s.energyCapacity;
            return creep.memory.busyWithTower;
          }

          return s.structureType === STRUCTURE_STORAGE && s.energy < s.energyCapacity;
        },
      });

      if (target) {
        if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          creep.moveTo(target, { reusePath: 5, visualizePathStyle: { stroke: 'cyan' } });
        }
      } else {
        // Don't be useless start building!
        startBuilding.run(creep);
      }
    } else {
      creep.getEnergy();
    }
  },
};
