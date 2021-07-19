import http from 'http';
import smsConfig from '../config/sms';
import fs from 'fs';

class Sms {
    sendSms(message) {
        const { token, credencial, principalUser, auxUser } = smsConfig;

        const options = {
            hostname: `www.pw-api.com`,
            path: `/sms/v_3_00/smspush/enviasms.aspx?Credencial=${credencial}&Token=${token}&Principal_User=${principalUser}&Aux_User=${auxUser}&Mobile=${message.numero}&Send_Project=S&Message=${encodeURIComponent(message.content)}`,
            method: 'GET',
        }

        http.get(options, (res) => {
            let body = "";
            res.on("data", (chunk) => {
                body += chunk;
            });
            res.on("end", () => {
                try {
                    console.log(body)
                } catch (error) {
                    console.error("internal error >> " + error.message);
                };
            });
        }).on("error", (error) => {
            console.error("error >> " + error.message);
        });
    }
}

export default new Sms();
