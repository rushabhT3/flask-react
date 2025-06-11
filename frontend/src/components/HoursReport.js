import React from "react";
import { Table, Card } from "react-bootstrap";

export default function HoursReport({ monthly, weekly }) {
  return (
    <div>
      <Card className="mb-4">
        <Card.Header>Monthly Hours</Card.Header>
        <Card.Body>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Month</th>
                <th>Total Hours</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(monthly).map(([month, hours]) => (
                <tr key={month}>
                  <td>{month}</td>
                  <td>{hours} hours</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Card>
        <Card.Header>Weekly Hours by Month</Card.Header>
        <Card.Body>
          {Object.entries(weekly).map(([month, weeks]) => (
            <div key={month} className="mb-4">
              <h5>Month {month}</h5>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Week</th>
                    <th>Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(weeks).map(([week, hours]) => (
                    <tr key={`${month}-${week}`}>
                      <td>{week}</td>
                      <td>{hours} hours</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ))}
        </Card.Body>
      </Card>
    </div>
  );
}
