/* eslint-disable import/prefer-default-export */
export enum RESPONSE_MESSAGES {
    SERVER_ERROR = 'Server Error',
    UNAUTHORIZED = 'You are not authorized to perform this action',
    FORBIDDEN = 'You are not authorized to perform this request',
    UNABLE_TO_CREATE_USER = 'We were unable to create your account at this time. Please try again later',
    UNABLE_TO_FIND_EMAIL = 'This account does not exist, Try creating one.',
    UNABLE_TO_LOGIN = 'We could not log you in at this time. Please try again later',
    MISSING_EMAIL_OR_PASSWORD = 'Please check the email and password and try again.',
    UNABLE_TO_FETCH_USER = 'Unable to fetch user.',
    UNABLE_TO_DELETE_USER = 'We were unable to delete your account at this time.',
    UNABLE_TO_UPDATE_PROFILE = 'Looks like we cannot update your profile at this time. Please try again later.',
    UNABLE_TO_UPLOAD_AVATAR = 'Looks like we cannot upload your avatar at this time. Please try again later.',
    UNABLE_TO_CREATE_ENVITE = 'We are currently experiencing issues creating this envite. Please try again later.',
    UNABLE_TO_DELETE_ENVITE = 'We are currently experiencing issues deleting this envite. Please try again later.',
    UNABLE_TO_FETCH_ENVITE = 'We could not fetch this envite as requested',
    UNABLE_TO_FETCH_ENVITES = 'We could not fetch envites as requested'

}
