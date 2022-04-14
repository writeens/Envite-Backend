/* eslint-disable import/prefer-default-export */
const setDBEnv = (collectionName:string) => {
  switch (process.env.NODE_ENV) {
    case 'production':
      return `${collectionName}-prod`;
    case 'development':
      return `${collectionName}-dev`;
    default:
      return `${collectionName}-dev`;
  }
};

export const COLLECTIONS = {
  USERS: setDBEnv('users'),
  ENVITES: setDBEnv('envites'),
};
