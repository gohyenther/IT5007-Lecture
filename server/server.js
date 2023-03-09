const fs = require('fs');
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');
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


/* Internal DB in server.js */
const issueDB = [
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
function issueList() {
	return issueDB;
}

function issueAdd(_, {newIssue}) {
	newIssue.id = issueDB.length + 1;
	newIssue.created = new Date();
	if (newIssue.status == undefined) newIssue.status = 'New';
	issueDB.push(newIssue);

	return newIssue;
}


const url = 'mongodb://localhost/issuetracker';

async function connectToDb() {
	const client = new MongoClient(url, { useNewUrlParser: true });
	await client.connect();
	console.log('Connected to MongoDB at', url);
	db = client.db();
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
