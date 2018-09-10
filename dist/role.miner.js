module.exports = {
  run: function (creep) {
    // Glitch mine
    const index = _.filter(Game.creeps, c => c.memory.role === 'miner').indexOf(creep);
    const container = creep.room.find(FIND_STRUCTURES, { filter: s => s.structureType === STRUCTURE_CONTAINER })[index];

    if (creep.harvest(creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE)) === ERR_NOT_IN_RANGE) {
      creep.moveTo(container, { reusePath: 1, visualizePathStyle: { stroke: 'yellow' } });
    }
  },
};
