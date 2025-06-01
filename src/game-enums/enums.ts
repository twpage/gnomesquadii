export enum EventType {
    NONE,
    WAIT,
    ATTEMPT_MOVE,
    MOVE,
    ATTACK,
    GAMETICK,
    FANCY,
    EXTRA_FANCY,
    // MENU,
    MENU_START,
    MENU_CYCLE,
    MENU_SELECT,
    MENU_STOP,
    CYCLE_SQUAD,
    EXAMINE_START,
    TARGETING_START,
    TARGETING_CANCEL,
    TARGETING_END,
    TARGETING_MOVE,
    ATTEMPT_ABILITY,
    HOTKEY,
    FOLLOW_START,
    FOLLOW_STOP,
    FOLLOW_LEADER,
    RALLY,
    SWAP,
    CRIT_SHOT,
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
    Bullseye,
}

export enum InputHandlerType {
    Core,
    Targeting,
    Menu,
}

export enum StatName {
    Health,
    Stamina,
    Charges,
}

export enum AbilityType {
    Examine,
    Rally,
    Follow,
    Unfollow,
    Shoot,
    Bullseye,
    Dash,
    Rest,
    Cycle,

    ActionMenu,
    SquadMenu,
    InventoryMenu,
    GameMenu,
}

export enum EventBlockedByTimeDistLockResponse {
    Allowed,
    Blocked,
    NormallyBlockedButPermitted,
}

export enum PathmapCacheType {
    ToPlayer_Walk,
    ToPlayer_Fly,
    FromPlayer_Walk,
    FromPlayer_Fly
}

export enum LevelNavigationType {
    Walk,
    Fly
    //walkable no items no exits
    //ignore radiation
    //walkable safe from radiation
}
