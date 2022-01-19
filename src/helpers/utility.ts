import bcrypt from 'bcryptjs';

module.exports.genHash = (stringValue: string) => {
    return new Promise((res, rej) => {
        bcrypt.genSalt(10, function(err: any, salt: string) {
            if(err) {
                rej(err.message)
            }
            bcrypt.hash(stringValue, salt, async(err, hash) => {
                if(err) {
                    rej(err.message)
                }
                res(hash);
            });
        });
    })
}