const { log } = require("@sap/cds");

module.exports = cds.service.impl(async function () {
       // API reference
       const api = 'xsuaa_api';

       // Get the XSUAA host URL from service binding
       const xsuaa_bind = JSON.parse(process.env.VCAP_SERVICES).xsuaa[0];
       const api_def = cds.env.requires[api];
       api_def.credentials.url = xsuaa_bind.credentials.url;
   
       // connect to the XSUAA host
       const xsuaa = await cds.connect.to(api_def);
    // using req.user approach (user attribute - of class cds.User - from the request object)
    
    this.on('userInfo', req => {
        const jwtToken = readJwt(req)
        console.log('===> JWT: scopes: ' + jwtToken);
        const user = {
            id : req.user.id,
            tenant : req.user.tenant,
            _roles: req.user._roles,
            attr : req.user.attr,
            jwtToken : jwtToken
        }

        return user;
    });

    // using the XSUAA API
    this.on('userInfoUAA', async () => {
        return await xsuaa.get("/userinfo");
    });
});

const readJwt = function(req){
    const authHeader = req.headers.authorization;
    console.log(authHeader);
    if (authHeader){
       const theJwtToken = authHeader.substring(7);
       console.log("JwtToken : "+theJwtToken);
       if(theJwtToken){
          const jwtBase64Encoded = theJwtToken.split('.')[1];
          console.log("jwtBase64Encoded : "+jwtBase64Encoded);
          if(jwtBase64Encoded){
             const jwtDecoded = Buffer.from(jwtBase64Encoded, 'base64').toString('ascii');
             console.log("jwtDecoded : "+jwtDecoded);
             return JSON.parse(jwtDecoded);           
          }
       }
    }
 }