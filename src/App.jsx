const dateRegex = new RegExp('^\\d\\d\\d\\d-\\d\\d-\\d\\d');

function jsonDateReviver(key, value) {
	if (dateRegex.test(value)) return new Date(value);
	return value;
}



class IssueFilter extends React.Component {
	render() {
		return (
			<div>This is a placeholder for the issue filter.</div>
		);
	}
}

function IssueRow(props) {
	const issue = props.issue;
	return (
		<tr>
			<td>{issue.id}</td>
			<td>{issue.status}</td>
			<td>{issue.owner}</td>
			<td>{issue.created.toDateString()}</td>
			<td>{issue.effort}</td>
			<td>{issue.due ? issue.due.toDateString() : ''}</td>
			<td>{issue.title}</td>
		</tr>
	);
}

function IssueTable(props) {
	const issueRows = props.issues.map(issue => <IssueRow key={issue.id} issue={issue} />);
	return (
		<table className="bordered-table">
			<thead>
				<tr>
					<th>ID</th>
					<th>Status</th>
					<th>Owner</th>
					<th>Created</th>
					<th>Effort</th>
					<th>Due</th>
					<th>Title</th>
				</tr>
			</thead>
			<tbody>
				{issueRows}
			</tbody>
		</table>
	);
}

class IssueAdd extends React.Component {
	constructor() {
		super();
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit(e) {
		e.preventDefault();
		const form = document.forms.issueAdd;
		const newIssue = {
			owner: form.owner.value, title: form.title.value,
			due: new Date(new Date().getTime() + 1000*60*60*24*10),
		}
		this.props.createIssue(newIssue);
		// reset the form input fields
		form.owner.value = ""; form.title.value = "";
	}

	render() {
		return (
			<form name="issueAdd" onSubmit={this.handleSubmit}>
				<input type="text" name="owner" placeholder="Owner" />
				<input type="text" name="title" placeholder="Title" />
				<button>Add</button>
			</form>
		);
	}
}

class IssueList extends React.Component {
	constructor() {
		super();
		this.state = { issues: [] }; // initital states
		this.createIssue = this.createIssue.bind(this);
	}

	componentDidMount() {
		this.loadData();
	}

	async loadData() { // async: unpredictable, await present inside function
		const query = `query {
			issueList {
				id
				title
				status
				owner
				effort
				created
				due
			}
		}`;

		const response = await fetch('http://localhost:3000/graphql', { // await for fetch from URL
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ query })
		});

		const body = await response.text(); // await for response
		const res = JSON.parse(body, jsonDateReviver);
		this.setState({ issues: res.data.issueList });
	}

	async createIssue(newIssue) { // async: unpredictable, await present inside function
		const query = `mutation issueAdd($newIssue: IssueInput!) {
			issueAdd(newIssue: $newIssue) {
				id
			}
		}`;

		const response = await fetch('http://localhost:3000/graphql', { // await for fetch from URL
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ query, variables: { newIssue } })
		});

		this.loadData();
	}

	render() {
		const systemname = "IT5007 Bug Tracker";
		return (
			<>
				<h1>{systemname}</h1>
				<IssueFilter name={systemname} />
				<br></br>
				<IssueTable issues={this.state.issues} />
				<br></br>
				<IssueAdd createIssue={this.createIssue} />
			</>
		);
	}
}

const element = <IssueList />;

ReactDOM.render(element, document.getElementById('contents'));
