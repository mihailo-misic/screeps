module.exports = {
  run: function (creep, room) {
    if (creep.room.name === room.name) {
      // Glitch mine
      const index = _.filter(Game.creeps, c => c.memory.role === 'miner').indexOf(creep);
      const container = creep.room.find(FIND_STRUCTURES, { filter: s => s.structureType === STRUCTURE_CONTAINER })[index];

      if (creep.harvest(container.pos.findClosestByPath(FIND_SOURCES)) === ERR_NOT_IN_RANGE) {
        creep.moveTo(container, { reusePath: 5, visualizePathStyle: { stroke: 'yellow' } });
      }
    } else {
      // If you're not in the room with sources go to it.
      creep.moveTo(creep.room.find(creep.room.findExitTo(room))[5], {
        reusePath: 5, visualizePathStyle: { stroke: 'cyan' },
      });
    }
  },
};
