const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { user } = require('firebase-functions/v1/auth');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');


admin.initializeApp();

const db = getFirestore();

const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const client = new SecretManagerServiceClient();


exports.updateSecret = functions.region('australia-southeast1').https.onCall(async (data, context) => {
  const configCollection = await db.collection('Config').get();

  let projectId;
  await configCollection.forEach(config => {
    projectId = config.data().projectId;
  })

  const name = 'projects/' + projectId + '/secrets/' + data.secretId;
  payload = data.payload // String source data.

  async function updateSecret() {

    const [secret] = await client.getSecret({
      name: name,
    });

    // Add a version with a payload onto" the secret.
    const [version] = await client.addSecretVersion({
      parent: secret.name,
      payload: {
        data: Buffer.from(payload, 'utf8'),
      },
    });

  }
  await updateSecret();

  return "done";
});


exports.addUser = functions.region('australia-southeast1').https.onCall((data, context) => {
  getAuth()
    .createUser({
      uid: data.subscriber._id,
      email: data.subscriber.email,
      emailVerified: false,
      password: data.subscriber.password,
      displayName: data.subscriber.fullName,
      disabled: false,
      admin: false
    })
    .then((userRecord) => {
    })
    .catch((error) => {
    });
})

exports.updateUser = functions.region('australia-southeast1').https.onCall((data, context) => {
  getAuth()
    .updateUser(data.employee._id, {
      email: data.subscriber.email,
      displayName: data.subscriber.fullName,
      disabled: false,
    })
    .then((userRecord) => {
    })
    .catch((error) => {
    });
})

exports.archiveUser = functions.region('australia-southeast1').https.onCall((data, context) => {
  getAuth()
    .updateUser(data.subscriber._id, {
      disabled: true
    })
    .then((userRecord) => {
    })
    .catch((error) => {
    });
})


// Start writing functions
// https://firebase.google.com/docs/functions/typescript


