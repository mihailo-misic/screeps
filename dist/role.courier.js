module.exports = {
  run: function (creep) {
    creep.checkEnergyOr('🚚');

    if (creep.memory.working) {
      // Deposit to empty structure
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

          return false;
        },
      });

      target = target ? target : creep.room.storage;
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
