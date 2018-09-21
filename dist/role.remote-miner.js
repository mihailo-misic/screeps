module.exports = {
  run: function (creep) {
    if (creep.room.name === creep.memory.room.name) {
      const container = creep.room.find(FIND_STRUCTURES, {
        filter: (s) => s.structureType === STRUCTURE_CONTAINER && creep.memory.target && s.id === creep.memory.target.id,
      })[0];

      if (!container) {
        creep.moveTo(creep.pos.findClosestByPath(FIND_SOURCES))
      } else {
        if (container.hits < container.hitsMax) {
          if (creep.repair(container) === ERR_NOT_ENOUGH_RESOURCES) {
            if (container && creep.harvest(container.pos.findClosestByPath(FIND_SOURCES)) === ERR_NOT_IN_RANGE) {
              creep.moveTo(container, {
                reusePath: 20, visualizePathStyle: { stroke: 'yellow' },
              })
            }
          }
        } else if (container.store[RESOURCE_ENERGY] === container.storeCapacity) {
          creep.say('🤔');
        } else if (container && creep.harvest(container.pos.findClosestByPath(FIND_SOURCES)) === ERR_NOT_IN_RANGE) {
          creep.moveTo(container, { reusePath: 20, visualizePathStyle: { stroke: 'yellow' } });
        } else if (creep.harvest(container.pos.findClosestByPath(FIND_SOURCES)) === ERR_NOT_ENOUGH_RESOURCES) {
          creep.moveTo(container, { reusePath: 20, visualizePathStyle: { stroke: 'yellow' } });
        }
      }
    }
    else {
      creep.goToRoom(creep.memory.room)
    }
  },
};
