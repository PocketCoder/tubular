'use strict';
const bcrypt = require('bcryptjs'),
	Q = require('q');
const mongodbUrl = `mongodb+srv://jake:${process.env.MONGOPASS}@user.3gpst.mongodb.net/?retryWrites=true&w=majority`;
const MongoClient = require('mongodb').MongoClient;
exports.localReg = function (username, password) {
	let deferred = Q.defer();
	MongoClient.connect(mongodbUrl, function (err, client) {
		const collection = client.db('usersDB').collection('users');
		collection.findOne({username: username}).then(function (result) {
			if (null != result) {
				console.log('USERNAME ALREADY EXISTS:', result.username);
				deferred.resolve(false);
			} else {
				let hash = bcrypt.hashSync(password, 8);
				let user = {
					username: username,
					password: hash
				};
				console.log('CREATING USER:', username);
				collection.insert(user).then(function () {
					client.close();
					deferred.resolve(user);
				});
			}
		});
	});
	return deferred.promise;
};
exports.localAuth = (username, password) => {
	let deferred = Q.defer();
	MongoClient.connect(mongodbUrl, function (err, client) {
		const collection = client.db('usersDB').collection('users');
		collection.findOne({username: username}).then((result) => {
			if (null == result) {
				console.log('USERNAME NOT FOUND:', username);
				deferred.resolve(false);
			} else {
				let hash = result.password;
				console.log('FOUND USER: ' + result.username);
				if (bcrypt.compareSync(password, hash)) {
					deferred.resolve(result);
				} else {
					console.log('AUTHENTICATION FAILED');
					deferred.resolve(false);
				}
			}
			client.close();
		});
	});
	return deferred.promise;
};
