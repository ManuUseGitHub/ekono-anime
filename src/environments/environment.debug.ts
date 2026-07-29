import { AparteEnvConfig } from "../aparte/shared/aparte.types";


// INFO: dev environment
export const environment: AparteEnvConfig = {
  production: false,
  eventLog: {
    events: 'loud',
    history: {
      listeners: 'regex',
      listenersRegex: "FILTER",
      broadcaster: 'regex',
      broadcastersRegex : 'FILTER'
    },
  }
};
