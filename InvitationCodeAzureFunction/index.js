module.exports = async function (context, req) {

    // parse Basic Auth username and password
    var header = req.headers["authorization"] || "", // get the header
        token = header.split(/\s+/).pop() || "", // and the encoded auth token
        auth = new Buffer.from(token, "base64").toString(), // convert from base64
        parts = auth.split(/:/), // split on colon
        username = parts[0],
        password = parts[1];

    // Check for HTTP Basic Authentication, return HTTP 401 error if invalid credentials.
    if (
        username !== process.env["BASIC_AUTH_USERNAME"] ||
        password !== process.env["BASIC_AUTH_PASSWORD"]
    ) {
        context.res = {
            status: 401,
        };
        context.log("Invalid Authentication");
        return;
    }

    context.log('JavaScript HTTP trigger function processed a request.');

    //if dynamic, could integrate with a backend that tracks valid sign-up codes per email address.
    const validInvitationCodes = ["invitation-code-1", "invitation-code-2"]

    const invitationCodeAttributeKey = "extension_" + process.env["B2C_EXTENSIONS_APP_ID"] + "_InvitationCode";
    
    let inviteCode = req.body && req.body[invitationCodeAttributeKey]; //extension app-id

    var body = {
        "version": "1.0.0",
        "status": 400,
        "action": "ValidationError",
    };
    var status = 400;

    if(!inviteCode){
        body["userMessage"] = "Please provide an invitation code.";
    } else if (!validInvitationCodes.includes(inviteCode)) {
        body["userMessage"] = "Your invitation code is invalid. Please try again."
    } else {
        status = 200;
        body = {
            "version": "1.0.0",
            "action": "Continue",
            [invitationCodeAttributeKey]: "" //overwrites extension attribute to "" in order to not store it in the directory
        };
    }

    context.res = {
        status: status,
        body: body
    };
};