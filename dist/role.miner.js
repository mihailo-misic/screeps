module.exports = {
  run: function (creep) {
    const container = creep.room.find(FIND_STRUCTURES, {
      filter: (s) => s.structureType === STRUCTURE_CONTAINER && s.id === creep.memory.target.id,
    })[0];

    if (container && creep.harvest(container.pos.findClosestByPath(FIND_SOURCES)) === ERR_NOT_IN_RANGE) {
      creep.moveTo(container, { reusePath: 20, visualizePathStyle: { stroke: 'yellow' } });
    } else if (creep.harvest(container.pos.findClosestByPath(FIND_SOURCES)) === ERR_NOT_ENOUGH_RESOURCES) {
      creep.moveTo(container, { reusePath: 20, visualizePathStyle: { stroke: 'yellow' } });
    }
  },
};
