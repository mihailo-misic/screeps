StructureTower.prototype.defend = function () {
  const closestHostile = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
  if (closestHostile) {
    this.attack(closestHostile);
  } else {
    // Look for broken walls first.
    let target = this.pos.findClosestByRange(FIND_STRUCTURES,
        { filter: (s) => (s.hits <= 3000) && s.structureType === STRUCTURE_WALL },
    );
    // Look for other stuff if walls are fine.
    if (!target) {
      target = this.pos.findClosestByRange(FIND_STRUCTURES,
          { filter: (s) => s.hits < s.hitsMax && s.structureType !== STRUCTURE_WALL },
      );
    }
    if (target) {
      this.repair(target);
    }
  }
};

_.filter(Game.structures, s => s.structureType === STRUCTURE_TOWER).forEach(t => t.defend());
