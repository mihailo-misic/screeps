module.exports = {
  run: function (creep) {
    creep.checkEnergyOr('🚚');

    if (creep.memory.priority) {
      return creep[creep.memory.priority]()
    }

    if (creep.memory.working) {
      // Deposit to empty structure
      let target = creep.findDepletedStructure();
      if (target) {
        if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          creep.moveTo(target, { reusePath: 20, visualizePathStyle: { stroke: 'cyan' } });
        }
      }
    } else {
      // Withdraw
      const container = creep.room.find(FIND_STRUCTURES, {
        filter: (s) => s.structureType === STRUCTURE_CONTAINER && s.id === creep.memory.target.id,
      })[0];

      if (creep.carry.energy > creep.carryCapacity / 2 && container.store[RESOURCE_ENERGY] < 100) {
        creep.memory.working = true;
      } else if (creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES)) {
        creep.getDroppedEnergy();
      } else if (creep.withdraw(container, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        creep.moveTo(container, { reusePath: 20, visualizePathStyle: { stroke: 'yellow' } });
      } else if (creep.carry.energy && !container.store[RESOURCE_ENERGY] &&
          !container.pos.findClosestByPath(FIND_SOURCES).amount) {
        creep.memory.working = true;
      }
    }
  },
};
