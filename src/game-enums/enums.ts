export enum EventType {
    NONE,
    WAIT,
    ATTEMPT_MOVE,
    MOVE,
    ATTACK,
    GAMETICK,
    FANCY,
    EXTRA_FANCY,
    MENU,
    CYCLE_SQUAD,
    EXAMINE_START,
    TARGETING_START,
    TARGETING_CANCEL,
    TARGETING_END,
    TARGETING_MOVE,
    HOTKEY,
}

export enum EntityType {
    Terrain,
    Actor
}

export enum TerrainType {
    WALL,
    FLOOR,
    DOOR_CLOSED,
}

export enum ActorType {
    PLAYER,
    ARCHITECT,
    HERO,
    MOB,
}

export enum VisionSource {
    NoVision,
    Self,
    Remote,
}

export enum TargetingType {
    Examine,
    // Throw,
    Shoot,
}

export enum InputHandlerType {
    Core,
    Targeting,
}

export enum StatName {
    Health,
    Stamina,
    Charges,
}

export enum AbilityType {
    Camp,
    Rifle,
    Dash,
}
