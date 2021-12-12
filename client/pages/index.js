import Link from "next/link";

const HomePage = ({ currentUser, tickets }) => {
  //return <h1>{currentUser ? `You\'re signed in.` : `You're NOT signed in.`}</h1>
  const ticketList = tickets.map(ticket => {
    return (
      <tr key={ticket.id}>
        <td>{ticket.title}</td>
        <td>{ticket.price}</td>
        <td>
          <Link href="/tickets/[ticketId]" as={`/tickets/${ticket.id}`}>
            <a>View</a>
          </Link>
        </td>
      </tr>
    );
  });

  return (
    <div>
      <h1>Tickets</h1>
      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Price</th>
            <th>Link</th>
          </tr>
        </thead>
        <tbody>
          {ticketList}
        </tbody>
      </table>
    </div>
  );
}

//getInitialProps the first argument "context" has a couple of arguments including Request
HomePage.getInitialProps = async (context, client, currentUser) => {
  const { data } = await client.get('/api/tickets');

  return { tickets: data };
};

export default HomePage;