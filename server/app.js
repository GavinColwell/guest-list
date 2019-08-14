const express = require('express');
const GoogleSpreadsheet = require('google-spreadsheet');
const { promisify } = require('util');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

let creds;
try {
    creds = require("./client_secret.json");
}
catch {
    creds = credsFromEnvironment();
}

let invites;
async function getInvites() {
    const rows = await getRows();

    invites = rows.map( (val, index) => {
        return {
            inviteName: val.invitename,
            checkInTime: val.timein,
            checkOutTime: val.timeout,
            isOver21: val.over21,
            id: index
        }
    })
}

getInvites()




// Used to deploy on heroku
function credsFromEnvironment() {
    console.log("Using creds from environment");
    return {
        private_key: process.env.G_private_key,
        client_email: process.env.G_client_email,   
    }
}

app.get('/api/invites', (req, res) => {
    getInvites();
    res.json(invites);
})

app.post('/api/checkin', (req, res) => {
    let invite = req.body;
    console.log(`Checkin ${invite.inviteName}`);
    checkIn(invite);
    res.sendStatus(200)
})

app.post('/api/undoCheckin', (req, res) => {
    let invite = req.body;
    console.log(`Undo checkin ${invite.inviteName}`);
    undoCheckIn(invite);
    res.sendStatus(200)
})

app.post('/api/checkout', (req, res) => {
    let invite = req.body;
    console.log(`Checkout ${invite.inviteName}`);
    checkOut(invite);
    res.sendStatus(200)
})

app.post('/api/undoCheckout', (req, res) => {
    let invite = req.body;
    console.log(`Undo checkout ${invite.inviteName}`);
    undoCheckOut(invite);
    res.sendStatus(200)
})

app.post('/api/toggle21', (req,res) => {
    let invite = req.body;
    console.log(`Toggle 21 ${invite.inviteName}`);
    toggle21(invite)
    res.sendStatus(200);
})


app.listen(port, () => console.log(`Listening on ${port}`));



async function checkIn(invite) {
    let record = await getRecord(invite);

    record.timein = invite.checkInTime;
    record.save();
}

async function checkOut(invite) {

    let record = await getRecord(invite);
    record.timeout = invite.checkOutTime;
    record.save();
}

async function undoCheckOut(invite) {

    let record = await getRecord(invite)

    record.timeout = '';
    record.save();
}

async function undoCheckIn(invite) {

    let record = await getRecord(invite)

    record.timein = '';

    // shouldn't have a checkout time without checkin time
    record.timeout = '';
    record.save();
}

async function getRecord(invite) {
    let rows = await getRows();
    let name = invite.inviteName;
    return rows.filter( (val) =>{
        return val.invitename === name
    })[0];
}

async function toggle21(invite) {
    let record = await getRecord(invite);

    record.over21 = ( invite.isOver21 ) ? "✅" : "";
    record.save();
}

async function getRows(){
    const doc = new GoogleSpreadsheet('1gkMFtS8zGFWemDdF-mvMSl4iHaklX_64Y1MPMrIc3pU');
    await promisify(doc.useServiceAccountAuth)(creds);

    const info = await promisify(doc.getInfo)();
    const sheet = info.worksheets[0];

    const rows = await promisify(sheet.getRows)({
        offset: 1
    });

    return rows;
}

app.use(express.static(__dirname + '/dist/'));

app.get('/*', function(req,res) {
    res.sendFile(path.join(__dirname+'/dist/index.html'));
});