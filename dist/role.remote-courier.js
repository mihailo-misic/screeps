module.exports = {
  run: function (creep) {
    creep.checkEnergyOr('🛫');

    if (creep.memory.priority) {
      return creep[creep.memory.priority]()
    }

    if (creep.memory.working) {
      if (creep.room.name === creep.memory.depositRoom.name) {
        // Makes issues
        // if (creep.ticksToLive < 800) {
        //   creep.memory.priority = 'goRefill';
        // }

        // Deposit to empty structure
        let target = creep.findDepletedStructure();
        if (target) {
          if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            creep.moveTo(target, { reusePath: 20, visualizePathStyle: { stroke: 'cyan' } });
          }
        }
      } else {
        // Fix the road along the way
        let target = creep.pos.findClosestByPath(FIND_STRUCTURES,
            { filter: (s) => s.hits < s.hitsMax && (s.structureType !== STRUCTURE_WALL && s.structureType !== STRUCTURE_RAMPART) },
        );
        if (target) {
          creep.repair(target)
        }
        creep.goToRoom(creep.memory.depositRoom)
      }
    } else {
      if (creep.room.name === creep.memory.sourceRoom.name) {
        // Withdraw
        const containers = creep.room.find(FIND_STRUCTURES, {
          filter: (s) => s.structureType === STRUCTURE_CONTAINER,
        });
        if (containers.length) {
          containers.sort((a, b) => b.store[RESOURCE_ENERGY] - a.store[RESOURCE_ENERGY]);
          if (creep.withdraw(containers[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            creep.moveTo(containers[0], { reusePath: 20, visualizePathStyle: { stroke: 'yellow' } });
          } else if (creep.carry.energy === creep.carryCapacity) {
            creep.memory.working = true;
          }
        } else {
          creep.say('🤔');
        }
      } else {
        creep.goToRoom(creep.memory.sourceRoom)
      }
    }

  },
};
