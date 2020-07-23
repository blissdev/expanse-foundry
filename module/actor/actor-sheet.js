import SelectedFocusDialog from "../components/selected-focus-dialog.js";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class ExpanseActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["boilerplate", "sheet", "actor"],
      template: "systems/expanse-foundry/templates/actor/actor-sheet.html",
      width: 665,
      height: 865,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
    });
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    const data = super.getData();
    data.dtypes = ["String", "Number", "Boolean"];

    this._prepareActorData(data);

    // Prepare items.
    if (this.actor.data.type == 'character') {
      for (let attr of Object.values(data.data.attributes)) {
        attr.isCheckbox = attr.dtype === "Boolean";
      }
      this._prepareCharacterItems(data);
    }

    return data;
  }

  _prepareActorData(sheetData) {
    const actorData = sheetData.actor;
    const focusByAbility = {};

    for (let a of Object.keys(sheetData.data.abilities)) {
      focusByAbility[a] = [];
    }

    for (let f of sheetData.data.proficientFocuses) {
      const parts = f.split("+");
      focusByAbility[parts[0]].push(parts[1]);
    }

    actorData.focusByAbility = focusByAbility;
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareCharacterItems(sheetData) {
    const actorData = sheetData.actor;

    // Initialize containers.
    const gear = [];
    const features = [];
    const spells = {
      0: [],
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
      7: [],
      8: [],
      9: []
    };

    // Iterate through items, allocating to containers
    // let totalWeight = 0;
    for (let i of sheetData.items) {
      let item = i.data;
      i.img = i.img || DEFAULT_TOKEN;
      // Append to gear.
      if (i.type === 'item') {
        gear.push(i);
      }
      // Append to features.
      else if (i.type === 'feature') {
        features.push(i);
      }
      // Append to spells.
      else if (i.type === 'spell') {
        if (i.data.spellLevel != undefined) {
          spells[i.data.spellLevel].push(i);
        }
      }
    }


    // Assign and return
    actorData.gear = gear;
    actorData.features = features;
    actorData.spells = spells;
    actorData.abilitySet = sheetData.data.abilities;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Add Inventory Item
    html.find('.item-create').click(this._onItemCreate.bind(this));

    // Update Inventory Item
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.getOwnedItem(li.data("itemId"));
      item.sheet.render(true);
    });

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      this.actor.deleteOwnedItem(li.data("itemId"));
      li.slideUp(200, () => this.render(false));
    });

    // Rollable abilities.
    html.find('.rollable').click(this._onRoll.bind(this));
    html.find('.ability-rollable').click(this._onAbilityRoll.bind(this));

    html.find('.ability-focus-trigger').click(this._onFocusEditor.bind(this));

    // Drag events for macros.
    if (this.actor.owner) {
      let handler = ev => this._onDragItemStart(ev);
      html.find('li.item').each((i, li) => {
        if (li.classList.contains("inventory-header")) return;
        li.setAttribute("draggable", true);
        li.addEventListener("dragstart", handler, false);
      });
    }
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      data: data
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.data["type"];

    // Finally, create the item!
    return this.actor.createOwnedItem(itemData);
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    if (dataset.roll) {
      let roll = new Roll(dataset.roll, this.actor.data.data);
      let label = dataset.label ? `Rolling ${dataset.label}` : '';
      roll.roll().toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label
      });
    }
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  async _onAbilityRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    if (dataset.roll) {
      let roll = new Roll(dataset.roll, this.actor.data.data);
      let label = dataset.label ? `Rolling ${dataset.label}` : '';
      let rollResult = roll.roll();

      let normalResults = rollResult.dice[0].rolls.map(r => r.roll);
      let dramaResult = rollResult.dice[1].rolls.map(r => r.roll);
      let combinedResults = [...normalResults, ...dramaResult];
      let total = rollResult.total;

      let double = new Set(combinedResults).size < combinedResults.length;

      let stunt = double ? dramaResult[0] : 0;

      let content = await renderTemplate("systems/expanse-foundry/templates/ability-test-roll.html", {
        d1: combinedResults[0],
        d2: combinedResults[1],
        d3: combinedResults[2],
        hasStunt: double,
        stunt: stunt,
        total: total,
        score: dataset.mod,
        proficiency: dataset.proficiency
      });

      // perform visual dice rolls
      if ("dice3d" in game) {
        await game.dice3d.show({
          formula: '2d6',
          results: [combinedResults[0], combinedResults[1]],
          whisper: null,
          blind: false
        });

        await game.user.setFlag("dice-so-nice", "appearance", {
          colorset: "expanse-drama"
        });

        await game.dice3d.show({
          formula: '1d6',
          results: [combinedResults[2]],
          whisper: null,
          blind: false
        });

        await game.user.setFlag("dice-so-nice", "appearance", {
          colorset: "custom",
        });
      }

      ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        content: content,
        flavor: label
      });
    }
  }

  async _onFocusEditor(event) {
    const selectedFocusDialog = await SelectedFocusDialog.create(
      this.actor,
      event.currentTarget.dataset
    );
  }
}
