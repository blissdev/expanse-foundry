export default class SelectedFocusDialog extends Dialog {
  constructor(actor, item, dialogData={}, options={}) {
    super(dialogData, options);
    this.options.classes = ["dialog"];
    this.actor = actor;
    this.item = item;
  }

  slugify(abilityName, focusName) {
    return `${abilityName}+${focusName}`;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    html.find('.focus-selector-option').change(ev => {
      const ability = this.actor.data.data.abilities[this.item.label];
      const focus = ability.focuses[ev.currentTarget.value]
      const slug = this.slugify(this.item.label, focus.name);

      let currentProficiencies = [...this.actor.data.data.proficientFocuses];

      if (ev.currentTarget.checked) {
        currentProficiencies.push(slug);
      } else {
        currentProficiencies = currentProficiencies.filter(p => p !== slug);
      }

      this.actor.update({
        data: { proficientFocuses: currentProficiencies }
      });
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
        default: null,
        close: reject
      });
      dlg.render(true);
    });
  }
}

