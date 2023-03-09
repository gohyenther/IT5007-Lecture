const fs = require('fs');
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');
const { MongoClient } = require('mongodb');
const app = express();

const GraphQLDate = new GraphQLScalarType({
	name: 'GraphQLDate',
	description: 'A Date() type in GraphQL as a scalar',
	serialize(value) {
		return value.toISOString();
	},
	parseValue(value) {
		const dateValue = new Date(value);
		return isNaN(dateValue) ? undefined : dateValue;
	},
	parseLiteral(ast) {
		if (ast.kind == Kind.STRING) {
			const value = new Date(ast.value);
			return isNaN(value) ? undefined : value;
		}
	},
});


/* initial issues in server.js, will be used to insert into mongoDB later */
const initialIssues = [
	{
		id: 1,
		status: 'New',
		owner: 'Ravan',
		effort: 5,
		created: new Date('2018-08-15'),
		due: undefined,
		title: 'Error in console when clicking Add',
	},
	{
		id: 2,
		status: 'Assigned',
		owner: 'Eddie',
		effort: 14,
		created: new Date('2018-08-16'),
		due: new Date('2018-08-30'),
		title: 'Missing bottom border on panel',
	}
]


/* Resolvers */
const resolvers = {
	Query: {
		issueList,
	},
	Mutation: {
		issueAdd,
	},
	GraphQLDate,
}


/* Functions in resolvers */
async function issueList() {
	const issueDB = await db.collection('issues').find({}).toArray();
	return issueDB;
}

var counter = 3; // for incrementing id of newIssue
async function issueAdd(_, { newIssue }) {
	newIssue.id = counter;
	newIssue.status = 'New';
	newIssue.created = new Date();

	counter = counter + 1;

	const result = await db.collection('issues').insertOne(newIssue);
	// savedIssue for confirmation
	const savedIssue = await db.collection('issues').findOne({ _id: result.insertedId });
	return savedIssue;
}


/*
* Initialise mongoDB, express and middleware
*/
const url = 'mongodb://localhost/issuetracker';

async function connectToDb() {
	const client = new MongoClient(url, { useNewUrlParser: true });
	await client.connect();
	console.log('Connected to MongoDB at', url);
	db = client.db();

	// restart: drop all database first
	db.dropDatabase();
	// restart: insert initialIssues into database
	db.collection('issues').insertMany(initialIssues);
}

const server = new ApolloServer({
	typeDefs: fs.readFileSync('./server/schema.graphql', 'utf-8'),
	resolvers,
	formatError: error => {
		console.log(error);
		return error;
	},
});

app.use(express.static('public'));

server.applyMiddleware({ app, path: '/graphql' });

(async function () {
	try {
		await connectToDb();
		app.listen(3000, function () {
			console.log('App started on port 3000');
		});
	} catch (err) {
		console.log('ERROR:', err);
	}
})();
