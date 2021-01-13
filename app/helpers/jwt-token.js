const jwt = require('njwt');
const config = require('../../config/config.js');
const { AuthenticationError } = require('./errors');
const randomstring = require('randomstring');

// var firebase = require('firebase/app');
// require('firebase/auth');

// firebase.initializeApp(config.FIREBASE);

class TokenHandler {
    // static verifyOauthFacebook(token) {
    //     const credential = firebase.auth.FacebookAuthProvider.credential(token);
    //     return firebase.auth().signInWithCredential(credential)
    //         .then((res) => {
    //             return {
    //                 first_name: res.additionalUserInfo.profile.first_name,
    //                 last_name: res.additionalUserInfo.profile.last_name,
    //                 email: res.additionalUserInfo.profile.email,
    //                 uid: res.user.uid,
    //                 providerId: res.user.providerId,
    //                 providerData: res.user.providerData,
    //                 avatar: res.user.photoURL,
    //                 user: res.user
    //             };
    //         });
    // }

    // static verifyOauthGoogle(token) {
    //     const credential = firebase.auth.GoogleAuthProvider.credential(null, token);
    //     // Sign in with credential from the Google user.
    //     return firebase.auth().signInWithCredential(credential)
    //         .then((res) => {
    //             return {
    //                 first_name: res.additionalUserInfo.profile.given_name,
    //                 last_name: res.additionalUserInfo.profile.family_name,
    //                 email: res.additionalUserInfo.profile.email,
    //                 uid: res.user.uid,
    //                 providerId: res.user.providerId,
    //                 providerData: res.user.providerData,
    //                 avatar: res.user.photoURL,
    //                 user: res.user
    //             };
    //         });
    // }

    static validateToken(token) {
        if (token.startsWith('Bearer')) {
            const decoded = jwt.verify(token.slice(7), config.JWT_SECRET);
            console.log(token.slice(7));
            return {
                ...decoded,
                token: token.slice(7)
            };
        }

        throw new AuthenticationError('invalid-token', []);
    }

    static generateJWT(user) {
        const now = new Date();
        const exp = new Date();
        exp.setDate(now.getDate() + 90);
        const accessJwt = jwt.create({
            sub: user.id,
            iat: Math.floor(now.getTime() / 1000)
        }, config.JWT_SECRET);
        accessJwt.setExpiration(exp);

        const accessToken = accessJwt.compact();
        const refreshToken = randomstring.generate(30);

        const jti = accessJwt.body.jti;

        return {
            accessToken, refreshToken, exp, jti
        };
    }
}
module.exports = {
    TokenHandler
};
