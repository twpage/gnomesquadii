import * as Bones from '../bones'

export class Ability {
    charges : Bones.Stat
    constructor(public abil_type: Bones.Enums.AbilityType) {
        this.charges = new Bones.Stat(Bones.Enums.StatName.Charges, 1)
    }
    canUse() : boolean {
        return (!(this.charges.isEmpty()))
    }
}

