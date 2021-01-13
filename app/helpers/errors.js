'use strict';

const { MoleculerError } = require('moleculer').Errors;

class AuthenticationError extends MoleculerError {
    constructor(message, data) {
        super();
        this.message = message;
        this.data = data;
        this.code = 401;
        this.type = 'AuthenticationError';
    }
}
class UnexpectedError extends MoleculerError {
    constructor(message, data) {
        super();
        this.message = message;
        this.data = data;
        this.code = 500;
        this.type = 'UnexpectedError';
    }
}
class NotFoundError extends MoleculerError {
    constructor(message, data) {
        super();
        this.message = message;
        this.data = data;
        this.code = 404;
        this.type = 'NotFoundError';
    }
}
class AuthorizationError extends MoleculerError {
    constructor(message, code, type, data) {
        super();
        this.code = 401;
        this.message = message;
        this.type = type;
        this.data = data;
    }
}
module.exports = {
    AuthenticationError,
    UnexpectedError,
    NotFoundError,
    AuthorizationError
};
