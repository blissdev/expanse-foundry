export default class SelectedFocusDialog extends Dialog {
  constructor(actor, item, dialogData={}, options={}) {
    super(dialogData, options);
    this.options.classes = ["dialog"];
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

    // Render the Spell casting template
    /*
    const html = await renderTemplate("systems/dnd5e/templates/apps/spell-cast.html", {
      item: item.data,
      canCast: canCast,
      canUpcast: canUpcast,
      spellLevels,
      hasPlaceableTemplate: game.user.can("TEMPLATE_CREATE") && item.hasAreaTarget
    });
    */

    console.log(actor);
    // Create the Dialog and return as a Promise
    return new Promise((resolve, reject) => {
      const dlg = new this(actor, selectedAbility, {
        title: `${selectedAbility.label.replace(/^\w/, c => c.toUpperCase())} Focuses`,
        content: "<h1>SUP BISH</h1>",
        buttons: {
          cast: {
            icon: '<i class="fas fa-magic"></i>',
            label: "Cast",
            callback: html => resolve(new FormData(html[0].querySelector("#spell-config-form")))
          }
        },
        default: "cast",
        close: reject
      });
      dlg.render(true);
    });
  }
}

