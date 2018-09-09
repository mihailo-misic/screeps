const startUpgrading = require('role.upgrader');

// Builders: Builds > Upgrades
module.exports = {
  run: function (creep) {
    creep.checkEnergyOr('🚧 Build');

    if (creep.memory.working) {
      let targets = creep.room.find(FIND_CONSTRUCTION_SITES);
      if (targets.length) {
        // Focus on extensions
        // const focus = targets.filter(t => t.structureType == STRUCTURE_ROAD);
        const focus = targets.filter(t => t.structureType === STRUCTURE_EXTENSION);
        if (focus.length) {
          targets = focus;
        }
        // Focus the ones with more progress.
        if (_.filter(targets, t => t.progress > 0).length) {
          targets.sort((a, b) => b.progress - a.progress);
        }
        if (creep.build(targets[0]) === ERR_NOT_IN_RANGE) {
          creep.moveTo(targets[0], { reusePath: 1, visualizePathStyle: { stroke: 'cyan' } });
        }
      } else {
        // Don't be useless start upgrading!
        startUpgrading.run(creep);
      }
    } else {
      creep.getEnergy();
    }
  },
};
