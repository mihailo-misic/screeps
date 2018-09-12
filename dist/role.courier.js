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
          creep.moveTo(target, { reusePath: 5, visualizePathStyle: { stroke: 'cyan' } });
        }
      }
    } else {
      // Withdraw
      const containers = creep.room.find(FIND_STRUCTURES, {
        filter: (s) => s.structureType === STRUCTURE_CONTAINER,
      });
      containers.sort((a, b) => b.store[RESOURCE_ENERGY] - a.store[RESOURCE_ENERGY]);
      if (creep.withdraw(containers[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        creep.moveTo(containers[0], { reusePath: 5, visualizePathStyle: { stroke: 'yellow' } });
      } else {
        creep.memory.working = true;
      }
    }
  },
};
