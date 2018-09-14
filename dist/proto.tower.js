StructureTower.prototype.defend = function () {
  const closestHostile = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
  if (closestHostile) {
    this.attack(closestHostile);
  } else {
    // Look for broken walls first.
    let target = this.pos.findClosestByRange(FIND_STRUCTURES,
        { filter: (s) => (s.hits <= 20000) && (s.structureType === STRUCTURE_WALL || s.structureType === STRUCTURE_RAMPART) },
    );
    // Look for other stuff if walls are fine.
    if (!target) {
      target = this.pos.findClosestByRange(FIND_STRUCTURES,
          { filter: (s) => s.hits < s.hitsMax && (s.structureType !== STRUCTURE_WALL && s.structureType !== STRUCTURE_RAMPART) },
      );
    }
    if (target) {
      this.repair(target);
    }
  }
};

