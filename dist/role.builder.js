const startUpgrading = require('role.upgrader');
const startRepairing = require('role.repairer');

// Builders: Builds > Upgrades
module.exports = {
  run: function (creep) {
    creep.checkEnergyOr('🏗');

    if (creep.memory.priority) {
      return creep[creep.memory.priority]()
    }

    if (creep.memory.working) {
      // Find a room with a construction site
      let destRoom = Memory.home;

      if (!Game.rooms[destRoom.name].find(FIND_CONSTRUCTION_SITES).length) {
        for (const room of Memory.rooms) {
          if (Game.rooms[room.name] !== undefined && Game.rooms[room.name].find(FIND_CONSTRUCTION_SITES).length) {
            destRoom = room
          }
        }
      }

      if (creep.room.name === destRoom.name) {
        if (!findWork(creep)) {
          if (creep.room.controller && !creep.room.controller.reservation) {
            // Don't be useless start upgrading!
            startUpgrading.run(creep);
          } else {
            // If you're in a remote room start repairing!
            startRepairing.run(creep)
          }
        }
      } else {
        creep.goToRoom(destRoom);
      }
    } else {
      let srcRoom = Memory.home;

      if (creep.room.name !== Memory.home.name && creep.room.find(FIND_SOURCES_ACTIVE).length) {
        srcRoom = creep.room
      }

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
      creep.moveTo(targets[0], { reusePath: 20, visualizePathStyle: { stroke: 'cyan' } });
    }
  }
  return targets.length
};
