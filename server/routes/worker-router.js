const express = require('express');
const router = express.Router();
const keys = require('../config/keys');
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const Worker = require('../models/worker-model');
const mainserviceModel = require('../models/mainservice-model');
const subserviceModel = require('../models/subservice-model');
const workOrderModel = require('../models/order-model');

const poolData = {
	UserPoolId: keys.cognito.userPoolId,
	ClientId: keys.cognito.clientId
}

const workerPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

router.post('/signup', (req, res) => {
	const { email, password, phoneNo } = req.body;

	const phoneData = {
		Name: 'phone_number',
		Value: phoneNo
	}
	const emailData = {
		Name: 'email',
		Value: email
	}
	const categoryData = {
		Name: 'custom:category',
		Value: 'Worker'
	}

	const emailAttribute = new AmazonCognitoIdentity.CognitoUserAttribute(emailData);
	const phoneAttribute = new AmazonCognitoIdentity.CognitoUserAttribute(phoneData);
	const categoryAttribute = new AmazonCognitoIdentity.CognitoUserAttribute(categoryData);

	workerPool.signUp(email, password, [emailAttribute, phoneAttribute, categoryAttribute], null, (err, data) => {
		if (err) {
			console.log(err)
		}
		const workerID = data.userSub;
		const newWorker = new Worker({
			email,
			phoneNo,
			workerID
		})
		newWorker
			.save()
			.then((worker) => {
				res.send({ user: worker, data: data.user });
			})

	})
})

router.post('/login', (req, res) => {
	const authenticationData = {
		Username: req.body.email,
		Password: req.body.password,
	};
	const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
	const userData = {
		Username: req.body.email,
		Pool: workerPool
	};
	const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
	cognitoUser.authenticateUser(authenticationDetails, {
		onSuccess: function (session) {
			const tokens = {
				accessToken: session.getAccessToken().getJwtToken(),
				idToken: session.getIdToken().getJwtToken(),
				refreshToken: session.getRefreshToken().getToken()
			};
			cognitoUser['tokens'] = tokens; // Save tokens for later use
		},
		onFailure: function (err) {
			res.send(err.code);
		},
	});
})

router.post('/completeProfile/:id', (req, res) => {
	const id = req.params.id;
	let worker = {};
	worker.name = req.body.name;
	worker.workerType = req.body.type;
	worker.companyID = req.body.companyID;
	worker.specialization = req.body.specialization;
	worker.address = req.body.address;
	worker.service = req.body.service;

	worker = { $set: worker };

	Worker.update({ workerID: id }, worker).then(() => {
		res.send({ status: "Success!", worker: worker });
	})

})

// fetch tags while worker signup
router.get('/fetchtags', async (req, res) => {
	service = req.query.service
	let tags = []
	let serviceID = await mainserviceModel.findOne({ serviceName: service }, '_id') // fetch id of mainservice
	let subservice = await subserviceModel.find({ mainserviceID: serviceID._id }, 'name categories.category -_id') // fetdh subservice name and category names of corresponding mainservice
	for (i = 0; i < subservice.length; i++) {
		tags.push(subservice[i].name); // save name of subservice
		if (subservice[i].categories) {
			// console.log(subservice[i].name)
			// console.log(subservice[i].categories)
			if (service != "Cleaning") {
				for (j = 0; j < subservice[i].categories.length; j++)
					tags.push(subservice[i].categories[j].category) // save name of category
			}

		}
	}
	// TODO: if mainservice is cleaning the remoove category name from tags
	res.send({ tags })
})

router.post('/forgotPassword', (req, res) => {
	const cognitoUser = new AmazonCognitoIdentity.CognitoUser({
		Username: req.body.email,
		Pool: workerPool
	});
	cognitoUser.forgotPassword({
		onSuccess: function (result) {
			res.send({ status: "Success", res: result });
		},
		onFailure: function (err) {
			res.send({ status: "Error", error: err });
		}
	});
});

router.post('/confirmFPassword', (req, res) => {
	const cognitoUser = new AmazonCognitoIdentity.CognitoUser({
		Username: req.body.email,
		Pool: workerPool
	});
	const verificationCode = req.body.code;
	const newPassword = req.body.password;
	cognitoUser.confirmPassword(verificationCode, newPassword, {
		onSuccess: function (result) {
			res.send({ status: "Success", res: result });
		},
		onFailure: function (err) {
			res.send({ status: "Error", error: err });
		}
	})
})

router.post('/confirmEmail', (req, res) => {
	const cognitoUser = new AmazonCognitoIdentity.CognitoUser({
		Username: req.body.email,
		Pool: workerPool
	})
	const confirmationCode = req.body.code;
	cognitoUser.confirmRegistration(confirmationCode, true, function (err, result) {
		if (err) {
			res.send({ status: "Error", error: err });
		}
		res.send({ status: "Success", res: result });
	})
})

router.post('/verifyCategory', (req, res) => {
	const workerID = req.body.workerID;
	Worker.findOne({ workerID: workerID }, (err, results) => {
		if (results) {
			res.send({ status: "Success" });
		}
		else {
			res.send({ status: "Not found!" });
		}
	})
})

// fetch myworks
router
	.route('/myworks')
	.get(async (req, res) => {
		let id = "no worker assigned" //TODO : find workerID from cookies
		let completedWorks = await workOrderModel.find({ workerID: id, completed: true }, 'service address date totalAmount -_id')
		let upcommingWorks = await workOrderModel.find({ workerID: id, completed: false }, 'service address date totalAmount -_id')
		res.json({ "completedWorks": completedWorks, "upcommingWorks": upcommingWorks })
	})

// TODO: show today's work

module.exports = router;