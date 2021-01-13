'use strict';

const lodash = require('lodash'); // lodash npm( array, object, .....)
const Jwt = require('../app/models/jwt');
const User = require('../app/models/user');
const Verification = require('../app/models/verification');
const { TokenHandler } = require('../app/helpers/jwt-token');
const { AuthenticationError } = require('../app/helpers/errors');
const { MoleculerClientError, ValidationError } = require('moleculer').Errors;
const email = require('../app/helpers/email');

module.exports = {
    name: 'auth',

    /**
     * Service settings
     */
    settings: {
        /** Secret for JWT */
        JWT_SECRET: process.env.JWT_SECRET || 'jwt-conduit-secret'
    },

    /**
     * Service dependencies
     */
    // dependencies: [],

    /**
     * Actions
     */
    actions: {

        /**
         * Login with username & password
         * use: ApiGateway
         */
        login: {
            visibility: 'published',
            params: {
                email: { type: 'email' },
                password: { type: 'string', min: 8 },
                $$strict: true
            },
            async handler(ctx) {
                const props = ['id', 'first_name', 'last_name', 'email', 'password', 'status', 'type'];

                // check email
                const user = await User.query()
                    .select(props)
                    .where({ email: ctx.params.email })
                    .whereNotDeleted()
                    .first()
                    .then(async (res) => {
                        if (res === undefined) {
                            throw new ValidationError('email-or-password-invalid', 422, [{ fields: 'email' }]);
                        }
                        return res;
                    });
                // check password
                const isMatchPassword = await User.comparePassword(ctx.params.password, user.password);
                if (!isMatchPassword) throw new ValidationError('email-or-password-invalid', null, [{ fields: 'password' }], []);
                return this.login(user);
            }
        },

        /**
         * Register new user with email & password
         * use: ApiGateway
         */
        register: {
            visibility: 'published',
            params: {
                email: { type: 'email', mode: 'precise' },
                first_name: { type: 'string', min: 1, max: 200 },
                last_name: { type: 'string', min: 1, max: 200 },
                phone: { type: 'string', min: 5, max: 100 },
                password: {
                    type: 'string', min: 8, pattern: User.settings.regex.password, max: 255
                },
                password_confirmation: {
                    type: 'string', min: 8, pattern: User.settings.regex.password, max: 255
                },
                type: { type: 'enum', values: ['customer', 'provider'] },
                $$strict: true
            },
            async handler(ctx) {
                const params = ctx.params;
                let user = await User.query().findOne({
                    email: params.email
                });

                if (user !== undefined) {
                    throw new ValidationError('email-existed', null, [{
                        field: 'email',
                        message: 'email-existed'
                    }], []);
                }


                if (params.password !== params.password_confirmation) {
                    throw new ValidationError('password-confirmation-not-match', null, [{
                        field: 'password_confirmation',
                        message: 'password-confirmation-not-match'
                    }], []);
                }

                // check phone
                const checkPhone = await User.query().findOne({
                    phone: params.phone
                });

                if (checkPhone !== undefined) {
                    throw new ValidationError('phone-existed', null, [{
                        field: 'phone',
                        message: 'phone-existed'
                    }], []);
                }

                delete params.password_confirmation;

                // Check admin account

                const loginData = await this.createUser(params);
                const checkadmin = params.email.split('@');
                if (checkadmin[1] === 'smit.com' || checkadmin[1] === 'smit.com.vn') {
                    await email.sendEmail(params.email);
                    return loginData;
                }
                return loginData;
            }
        },
        /**
         * Verify user token & return user info
         * use: ApiGateway
         */
        verifyToken: {
            visibility: 'public',
            params: {
                token: { type: 'string' }
            },
            handler(ctx) {
                return new Promise(resolve => resolve(TokenHandler.validateToken(ctx.params.token)))
                    .then(token => Jwt.query().findOne({ jti: token.body.jti }))
                    .then(result => {
                        if (result) {
                            return Promise.all([
                                result.jti,
                                User.query()
                                    .select(['id', 'type', 'first_name', 'last_name', 'email', 'status', 'quantity', 'amount', 'active_token', 'active_expire']) // SAve ctx.meta.user
                                    .findOne({ id: result.user_id })
                                // ctx.call('organization.verifyOrg', { user_id: result.user_id })
                            ]);
                        }
                        return undefined;
                    })
                    .then(([jti, user, organization]) => {
                        return {
                            jti,
                            ...user,
                            organization
                        };
                    })
                    .catch((error) => {
                        this.logger.info('verify error', error);
                        return undefined;
                    });
            }
        },

        /**
         * Refresh user token & return new token info
         * use: ApiGateway
         */
        refreshToken: {
            visibility: 'public',
            params: {
                refresh_token: { type: 'string' }
            },
            handler(ctx) {
                return Jwt.query()
                    .findOne({
                        refresh_token: ctx.params.refresh_token
                    })
                    .then(token => {
                        if (token === undefined) {
                            throw new ValidationError('invalid-token', null, '', []);
                        }

                        let generatedToken = TokenHandler.generateJWT({
                            id: token.user_id
                        });
                        return Promise.all([
                            generatedToken,
                            Jwt.query()
                                .insert({
                                    user_id: token.user_id,
                                    jti: generatedToken.jti,
                                    refresh_token: generatedToken.refreshToken
                                }),
                            Jwt.query().delete(true).where('id', token.id)
                        ]);
                    })
                    .then(([token, jwt, deleted]) => {
                        if (jwt === undefined) {
                            this.logger.error('Can not create jwt', ctx.meta.user);
                            throw MoleculerClientError('unexpected-error');
                        }
                        this.logger.info('Token revoke status: ', deleted);

                        return {
                            data: {
                                token_type: 'Bearer',
                                access_token: token.accessToken,
                                refresh_token: token.refreshToken
                            }
                        };
                    });
            }
        },

        logout: {
            params: {
                token: { type: 'string', $$strict: true }
            },
            handler(ctx) {
                return new Promise(resolve => resolve(TokenHandler.validateToken(ctx.params.token)))
                    .then(() => TokenHandler.validateToken(ctx.params.token))
                    .then(token => Jwt.query().findOne({
                        jti: token.body.jti
                    }))
                    .then(token => {
                        if (token === undefined) {
                            return {
                                message: 'logout-successfully'
                            };
                        }

                        return Jwt.logout(token);
                    })
                    .then(result => {
                        if (result) {
                            this.broker.emit('user.logout', {
                                token: ctx.params.token
                            }, ['api']);
                            return {
                                message: 'logout-successfully'
                            };
                        }
                        throw new MoleculerClientError('unexpected-error', 500, '', []);
                    })
                    .catch(() => {
                        throw new AuthenticationError('invalid-token', []);
                    });
            }
        },

        changePassword: {
            params: {
                current_password: {
                    type: 'string', min: 8, pattern: User.settings.regex.password, max: 255
                },
                new_password: {
                    type: 'string', min: 8, pattern: User.settings.regex.password, max: 255
                },
                password_confirmation: {
                    type: 'string', min: 8, pattern: User.settings.regex.password, max: 255
                },
                $$strict: true
            },
            async handler(ctx) {
                const params = ctx.params;
                if (params.new_password !== params.password_confirmation) {
                    throw new ValidationError('password-confirmation-not-match', 422, [{
                        field: 'password_confirmation',
                        message: 'password-confirmation-not-match'
                    }], []);
                }
                if (params.new_password === params.current_password) {
                    throw new ValidationError('password-does-not-change', null, [{
                        field: 'new_password',
                        message: 'password-does-not-change'
                    }], []);
                }

                const user = await User.query()
                    .select(['password'])
                    .where({ id: ctx.meta.user.id })
                    .first();

                // check password
                const isMatchPassword = await User.comparePassword(params.current_password, user.password);
                if (!isMatchPassword) {
                    throw new ValidationError('invalid-old-password', null, [{
                        field: 'current_password',
                        message: 'invalid-old-password'
                    }], []);
                }

                return User.hashPassword(params.new_password)
                    .then(hashed => {
                        return Promise.all([
                            User.query()
                                .patch({ password: hashed })
                                .findById(ctx.meta.user.id),
                            Jwt.query()
                                .delete(true)
                                .where('user_id', ctx.meta.user.id),
                            TokenHandler.generateJWT({
                                id: ctx.meta.user.id
                            })
                        ]);
                    })
                    .then(data => {
                        if (data[0] === undefined || data[2] === undefined) {
                            throw new MoleculerClientError('unexpected-error', 500, '', []);
                        }

                        return Promise.all([
                            data[2],
                            Jwt.query().insert({
                                user_id: ctx.meta.user.id,
                                jti: data[2].jti,
                                refresh_token: data[2].refreshToken
                            })
                        ]);
                    })
                    .then(([token]) => {
                        return {
                            message: 'password-changed-successfully',
                            data: {
                                token_type: 'Bearer',
                                access_token: token.accessToken,
                                refresh_token: token.refreshToken
                            }
                        };
                    });
            }
        }


    },

    /**
     * Events
     */
    events: {

    },

    /**
     * Methods
     */
    methods: {
        async handleOauth(token, provider, phone) {
            try {
                const userInfo = await provider.handler(token);
                const user = await User.query()
                    .findOne({ email: userInfo.email })
                    .join('verifications', 'verifications.user_id', 'users.id')
                    .select(['users.type', 'users.id', 'users.email', 'users.first_name', 'users.last_name', 'users.status', 'users.password', 'users.created_at', 'users.phone', `verifications.${provider.verifiedProps}`]);

                if (user && !user[provider.verifiedProps]) {
                    throw new ValidationError('duplicate-credential', []);
                }

                if (!user) {
                    if (!phone) {
                        throw new ValidationError('please-enter-your-phone', null, {
                            key: 'phone-require-when-register'
                        });
                    }

                    const payload = await this.createUser({ ...lodash.pick(userInfo, ['email', 'first_name', 'last_name']), phone })
                        .catch(err => {
                            this.logger.info('Cannot register user:', userInfo);
                            userInfo.user.delete();
                            return Promise.reject(err);
                        });

                    await Verification.verify(payload.data.user.id, provider);
                    return payload;
                }

                return this.login(user);
            } catch (err) {
                if (err instanceof ValidationError) throw err;
                this.logger.error(err);
                throw new ValidationError('account-invalid', []);
            }
        },

        transformLogin(data) {
            if (data.user && data.token) {
                return {
                    data: {
                        token_type: 'Bearer',
                        access_token: data.token.accessToken,
                        refresh_token: data.token.refreshToken,
                        user: data.user
                    }
                };
            }
            throw new MoleculerClientError('Unexpected-error', 500, '', []);
        },

        /*
         * Create user step :
         * - create user
         * - create user profile
         * - send email register success
         * - login user (generate jwt and save) & return response
         * @param
         *   - email
         *   - password
         *   - first_name
         *   - last_name
         */
        createUser(params) {
            return User
                .register(params)
                .then(user => {
                    return Promise.all([
                        user,
                        Verification.query().insert({
                            user_id: user.id
                        })
                    ]);
                })
                .then(async ([user]) => {
                    return this.login(user);
                });
        },

        login(user) {
            return Promise.resolve()
                .then(() => User.generateToken(user))
                .then((userWithToken) => {
                    return Promise.all(
                        [
                            userWithToken,
                            Jwt.query()
                                .insert({
                                    user_id: userWithToken.user.id,
                                    jti: userWithToken.token.jti,
                                    refresh_token: userWithToken.token.refreshToken
                                })
                        ]
                    );
                })
                .then(([userWithToken]) => this.transformLogin(userWithToken));
        }
    },

    /**
     * Service created lifecycle event handler
     */
    created() {
        global.Promise = this.Promise;
    },

    /**
     * Service started lifecycle event handler
     */
    started() {

    },

    /**
     * Service stopped lifecycle event handler
     */
    stopped() {

    }
};
