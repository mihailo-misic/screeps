module.exports = {
  run: function (creep) {
    if (creep.room.name === creep.memory.room.name) {
      const container = creep.room.find(FIND_STRUCTURES, {
        filter: (s) => s.structureType === STRUCTURE_CONTAINER && s.id === creep.memory.target.id,
      })[0];

      if (container && creep.harvest(container.pos.findClosestByPath(FIND_SOURCES)) === ERR_NOT_IN_RANGE) {
        creep.moveTo(container, { reusePath: 5, visualizePathStyle: { stroke: 'yellow' } });
      }
    } else {
      // If you're not in the room with sources go to it.
      creep.moveTo(creep.room.find(creep.room.findExitTo(creep.memory.room.name))[5], {
        reusePath: 5, visualizePathStyle: { stroke: 'cyan' },
      });
    }
  },
};
