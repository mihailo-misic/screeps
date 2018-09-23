// Instructs the creep to grab energy from the closest source.
Creep.prototype.getEnergy = function (room = Memory.home) {
  if (this.room.name === room.name) {
    let source;

    if (this.room.storage && this.room.storage.store[RESOURCE_ENERGY] > 0) {
      source = this.room.storage
    }

    if (source) {
      if (this.withdraw(source, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        this.moveTo(source, { reusePath: 20, visualizePathStyle: { stroke: 'yellow' } });
      } else {
        this.memory.working = true;
      }
    } else {
      source = this.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
      if (!source && this.carry.energy !== 0) {
        this.memory.working = true;
      }
      if (this.harvest(source) === ERR_NOT_IN_RANGE) {
        this.moveTo(source, { reusePath: 20, visualizePathStyle: { stroke: 'yellow' } });
      }
    }
  } else {
    // If you're not in the room with sources go to it.
    this.goToRoom(room);
  }
};

Creep.prototype.findDepletedStructure = function (ignoreStorage) {
  let target = this.pos.findClosestByPath(FIND_STRUCTURES, {
    filter: (s) => {
      if ((s.structureType === STRUCTURE_EXTENSION
          || s.structureType === STRUCTURE_SPAWN)
          && s.energy < s.energyCapacity) {
        return true;
      }
      // This prevents the creep from feeding the tower for each shot
      if (s.structureType === STRUCTURE_TOWER) {
        // It starts filling it if it's below 50% energy.
        return s.energy < (s.energyCapacity / 2);
      }

      return false;
    },
  });
  if (!target && !ignoreStorage) {
    target = this.room.storage;
  }

  return target
};

// Check if the creep has energy,
// and decide to either harvest or work.
Creep.prototype.checkEnergyOr = function (msg) {
  if (this.memory.working && this.carry.energy === 0) {
    this.memory.working = false;
    this.say('⛏');
  } else if (!this.memory.working && this.carry.energy === this.carryCapacity) {
    this.memory.working = true;
    this.say(msg);
  }

  // Pick up energy along the way.
  const droppedEnergy = this.pos.findClosestByPath(FIND_DROPPED_RESOURCES);
  if (droppedEnergy) {
    this.pickup(droppedEnergy)
  }
  const nearTombstone = this.pos.findClosestByPath(FIND_TOMBSTONES);
  if (nearTombstone) {
    this.withdraw(nearTombstone, RESOURCE_ENERGY)
  }
};

Creep.prototype.goToRoom = function (room) {
  this.moveTo(this.pos.findClosestByRange(this.room.findExitTo(room.name)), {
    reusePath: 20, visualizePathStyle: { stroke: 'lime' },
  })
};

Creep.prototype.getDroppedEnergy = function () {
  const droppedEnergy = this.pos.findClosestByPath(FIND_DROPPED_RESOURCES);
  if (this.pickup(droppedEnergy) === ERR_NOT_IN_RANGE) {
    this.moveTo(droppedEnergy, { reusePath: 20, visualizePathStyle: { stroke: 'white' } });
  } else {
    this.memory.priority = null;
  }
};

Creep.prototype.goRefill = function () {
  const closestSpawn = this.pos.findClosestByPath(FIND_STRUCTURES, { filter: (s) => s.structureType === STRUCTURE_SPAWN });
  if (this.ticksToLive <= 1200) {
    this.moveTo(closestSpawn, { reusePath: 20, visualizePathStyle: { stroke: 'lime' } });
  } else {
    this.memory.priority = null;
  }
};
