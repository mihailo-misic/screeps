const startUpgrading = require('role.upgrader');

// Builders: Builds > Upgrades
module.exports = {
  run: function (creep, srcRoom = Memory.home, destRoom = Memory.home) {
    creep.checkEnergyOr('🏗');

    // Pick up energy along the way.
    const droppedEnergy = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES);
    if (droppedEnergy) {
      creep.pickup(droppedEnergy)
    }

    if (creep.memory.working) {
      // if (creep.room.name === Memory.home.name && _.filter(Game.creeps, c => c.memory.role === 'miner').length){
      //
      // }
      if (creep.room.name === destRoom.name) {
        if (!findWork(creep)) {
          if (srcRoom.name === destRoom.name) {
            // Don't be useless start upgrading!
            startUpgrading.run(creep);
          } else {
            creep.goToRoom(srcRoom);
          }
        }
      } else {
        creep.goToRoom(destRoom);
      }
    } else {
      creep.getEnergy(srcRoom);
    }
  },
};

let findWork = function (creep) {
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
      creep.moveTo(targets[0], { reusePath: 5, visualizePathStyle: { stroke: 'cyan' } });
    }
  }
  return targets.length
};
