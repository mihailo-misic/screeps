const startBuilding = require('role.builder');

// Harvesters: Deposits > Builds > Upgrades
module.exports = {
  run: function (creep) {
    creep.checkEnergyOr('📦');

    if (creep.memory.working) {
      let target = creep.findDepletedStructure('ignoreStorage');
      if (target) {
        if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          creep.moveTo(target, { reusePath: 20, visualizePathStyle: { stroke: 'cyan' } });
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
