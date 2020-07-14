export default class SelectedFocusDialog extends Dialog {
  constructor(actor, item, dialogData={}, options={}) {
    super(dialogData, options);
    this.options.classes = ["dialog"];
    this.actor = actor;
    this.item = item;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    html.find('.focus-selector-option').change(ev => {
      console.log(ev);
      console.log(this.actor);
    });

  }
  /* -------------------------------------------- */
  /*  Rendering                                   */
  /* -------------------------------------------- */

  /**
   * A constructor function which displays the Spell Cast Dialog app for a given Actor and Item.
   * Returns a Promise which resolves to the dialog FormData once the workflow has been completed.
   * @param {Actor5e} actor
   * @param {Item5e} item
   * @return {Promise}
   */
  static async create(actor, selectedAbility) {
    const html = await renderTemplate("systems/expanse-foundry/templates/focus-selection.html", {
      actor: actor,
      ability: actor.data.data.abilities[selectedAbility.label],
      selectedAbility: selectedAbility
    });


    console.log(actor);
    // Create the Dialog and return as a Promise
    return new Promise((resolve, reject) => {
      const dlg = new this(actor, selectedAbility, {
        title: `${selectedAbility.label.replace(/^\w/, c => c.toUpperCase())} Focuses`,
        content: html,
        buttons: { },
        default: "cast",
        close: reject
      });
      dlg.render(true);
    });
  }
}

