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
}

export enum EntityType {
    Terrain,
    Actor
}

export enum TerrainType {
    WALL,
    FLOOR,
}

export enum ActorType {
    HERO,
    ARCHITECT,
    MOB,
}

export enum VisionSource {
    NoVision,
    Self,
    Remote,
}