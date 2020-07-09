/**
 * Extend the base Actor entity by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class BoilerplateActor extends Actor {

  /**
   * Augment the basic actor data with additional dynamic data.
   */
  prepareData() {
    super.prepareData();

    const actorData = this.data;
    const data = actorData.data;
    const flags = actorData.flags;

    // Make separate methods for each Actor type (character, npc, etc.) to keep
    // things organized.
    if (actorData.type === 'character') this._prepareCharacterData(actorData);
  }

  /**
   * Prepare Character type specific data
   */
  _prepareCharacterData(actorData) {
    const data = actorData.data;

    const activeFocuses = {};

    for (let a in data.abilities) {
      for (let f of data.abilities[a].focuses) {
        if (f.proficient) {
          if (!(a in activeFocuses)) {
            activeFocuses[a] = [f];
          } else {
            activeFocuses[a].push(f);
          }
        }
      }
    }

    data.activeFocuses = activeFocuses;
  }
}
