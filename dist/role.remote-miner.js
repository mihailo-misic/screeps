module.exports = {
  run: function (creep) {
    if (creep.room.name === creep.memory.room.name) {
      const container = creep.room.find(FIND_STRUCTURES, {
        filter: (s) => s.structureType === STRUCTURE_CONTAINER && s.id === creep.memory.target.id,
      })[0];

      if (container.hits < container.hitsMax){
        creep.repair(container);
      }

      if (container && creep.harvest(container.pos.findClosestByPath(FIND_SOURCES)) === ERR_NOT_IN_RANGE) {
        creep.moveTo(container, { reusePath: 10, visualizePathStyle: { stroke: 'yellow' } });
      }
    } else {
      creep.goToRoom(creep.memory.room)
    }
  },
};
