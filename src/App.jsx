const initialIssues = [
	{
		id: 1,
		status: 'New',
		owner: 'Ravan',
		effort: 5,
		created: new Date('2018-08-15'),
		due: undefined,
		title: 'Error in console when clicking Add'
	},
	{
		id: 2,
		status: 'Assigned',
		owner: 'Eddie',
		effort: 14,
		created: new Date('2018-08-16'),
		due: new Date('2018-08-30'),
		title: 'Missing bottom border on panel'
	}
]

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
			owner: form.owner.value, title: form.title.value, status: 'New',
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

	loadData() {
		setTimeout(() => {
			this.setState({ issues: initialIssues })
		}, 500);
	}

	createIssue(newIssue) {
		newIssue.id = this.state.issues.length + 1;
		newIssue.created = new Date();
		const newIssueList = this.state.issues.slice();
		newIssueList.push(newIssue);
		this.setState({ issues: newIssueList });
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
