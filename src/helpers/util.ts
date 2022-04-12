/* eslint-disable import/prefer-default-export */
export const setDBEnv = (collectionName:string) => {
  switch (process.env.CUSTOM_ENV) {
    case 'production':
      return `${collectionName}-prod`;
    case 'development':
      return `${collectionName}-prod`;
    default:
      return `${collectionName}-dev`;
  }
};
