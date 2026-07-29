import { BR, EV } from './aparte.composites';
import { debugOnly, validateCombination } from './aparte.decorators';
import { EventRegistry } from './aparte.registry';

@validateCombination
class Aparte extends Object {
  private _event!: string[];

  /**
   *
   * @param branch The application domain of the event
   * @param focus The action or signal within the domain
   * @see file://./aparte.composition.yml to have the branch + focus available combinations
   */
  constructor(branch: BR, focus: EV) {
    super();
    this._event = ['', `${branch.toString()}.${focus.toString()}`, ''];
  }
  private ok() {
    this._event[2] = '_OK(🟢)';
    return this;
  }

  private ko() {
    this._event[2] = '_KO(🔴)';
    return this;
  }

  private silent() {
    this._event[0] = '_';
    return this;
  }

  private loud() {
    this._event[0] = '';
    return this;
  }

  private base() {
    this._event[2] = '';
    return this;
  }

  @debugOnly
  deafen() {
    return this.silent().build();
  }

  @debugOnly
  stun() {
    return this.loud().build();
  }

  @debugOnly
  aggravate() {
    return this.ko().build();
  }

  @debugOnly
  encourage() {
    return this.ok().build();
  }

  @debugOnly
  banalyse() {
    return this.base().build();
  }

  build() {
    return this._event.join('');
  }

  override toString() {
    return this.build();
  }

  /****************************************************************************
   * VERBS TO CREATE EVENT BUILDERS TO REDUCE THE REPETITION OF INSTENTIATION *
   * Based on sounds associated with good or bad feed back or the lack        *
   * of OK / KO appreciation (neutral)                                        *
   ****************************************************************************/

  /**
   * Configure a builder event to signal a **[🔴 FAILED + 🔵 SILENT]** communication in an event based architecture
   * CONTEXT : One left the group to get some air
   * @param eventRegistry The entry matching the event registery. Use intellisense. Accepts only possible values
   * @see {@link tickle} for the 🔴 **FAILED** + 🟣 **LOUD** version
   * @see {@link touch} for the 🟠 **NEUTRAL** version
   * @see {@link nod} for the 🟢 **SUCCESS** version
   * @returns An event builder marked as failed and silent
   */
  static bother(eventRegistry: EventRegistry) {
    return Aparte.gen(eventRegistry).ko().silent();
  }

  /**
   * Configure a builder event to signal a **[🔴 FAILED]** communication in an event based architecture
   * CONTEXT : The annoyence started
   * @param eventRegistry The entry matching the event registery. Use intellisense. Accepts only possible values
   * @see {@link bother} for the 🔴 **FAILED** + 🔵 **SILENT** version
   * @see {@link pinch} for the 🟠 **NEUTRAL** version
   * @see {@link hi5} for the 🟢 **SUCCESS** version
   * @returns An event builder marked as failed
   */
  static tickle(eventRegistry: EventRegistry) {
    return Aparte.gen(eventRegistry).ko();
  }

  /**
   * Configure a builder event to signal a **[🟠 NEUTRAL + 🔵 SILENT]** communication in an event based architecture
   * CONTEXT : One needed to ask for a bit of attention
   * @param eventRegistry The entry matching the event registery. Use intellisense. Accepts only possible values
   * @see {@link pinch} for the 🟠 **NEUTRAL** + 🟣 **LOUD** version
   * @see {@link tickle} for the 🔴 **FAILED** version
   * @see {@link hi5} for the 🟢 **SUCCESS** version
   * @returns A silent, neutral event builder
   */
  static touch(eventRegistry: EventRegistry) {
    return Aparte.gen(eventRegistry).silent();
  }

  /**
   * Configure a builder event to signal a **[🟠 NEUTRAL]** communication in an event based architecture
   * CONTEXT : That person tried to create a reaction
   * @param eventRegistry The entry matching the event registery. Use intellisense. Accepts only possible values
   * @see {@link touch} for the 🟠 **NEUTRAL** + 🔵 **SILENT** version
   * @see {@link tickle} for the 🔴 **FAILED** version
   * @see {@link hi5} for the 🟢 **SUCCESS** version
   * @returns A neutral event builder
   */
  static pinch(eventRegistry: EventRegistry) {
    return Aparte.gen(eventRegistry);
  }

  /**
   * Configure a builder event to signal a **[🟢 SUCCESS + 🔵 SILENT]** communication in an event based architecture
   * CONTEXT : They made eye contact and approved
   * @param eventRegistry The entry matching the event registery. Use intellisense. Accepts only possible values
   * @see {@link hi5} for the 🟢 **SUCCESS** + 🟣 **LOUD** version
   * @see {@link bother} for the 🔴 **FAILED** version
   * @see {@link touch} for the 🟠 **NEUTRAL** version
   * @returns A silent success event builder
   */
  static nod(eventRegistry: EventRegistry) {
    return Aparte.gen(eventRegistry).ok().silent();
  }

  /**
   * Configure a builder event to signal a **[🟢 SUCCESS]** communication in an event based architecture
   * CONTEXT : They vigorously slap each other's hand
   * @param eventRegistry The entry matching the event registery. Use intellisense. Accepts only possible values
   * @see {@link nod} for the 🟢 **SUCCESS** + 🔵 **SILENT** version
   * @see {@link tickle} for the 🔴 **FAILED** version
   * @see {@link pinch} for the 🟠 **NEUTRAL** version
   * @returns A successful event builder
   */
  static hi5(eventRegistry: EventRegistry) {
    return Aparte.gen(eventRegistry).ok();
  }

  private static gen(eventRegistry: EventRegistry) {
    return Object.entries(eventRegistry).map(([event, branch]) => {
      const branchName = branch.replaceAll(/\./g, '_').toUpperCase();
      const parsed = (BR as any)[branchName];
      return new Aparte(parsed, (EV as any)[event]);
    })[0];
  }

  static disapointed(eventRegistry: EventRegistry) {
    return Aparte.gen(eventRegistry).ko();
  }

  static doing(eventRegistry: EventRegistry) {
    return Aparte.gen(eventRegistry);
  }

  static satisfied(eventRegistry: EventRegistry) {
    return Aparte.gen(eventRegistry).ok();
  }
}

// for broad casting
export const bother = Aparte.bother; // silent
export const tickle = Aparte.tickle;
export const touch = Aparte.touch; // silent
export const pinch = Aparte.pinch;
export const nod = Aparte.nod; // silent
export const hi5 = Aparte.hi5;

// for listening
export const disapointed = Aparte.disapointed;
export const doing = Aparte.doing;
export const satisfied = Aparte.satisfied;
