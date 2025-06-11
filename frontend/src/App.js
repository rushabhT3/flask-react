import React, { useState, useEffect } from "react";
import Calendar from "./components/Calendar";
import EventForm from "./components/EventForm";
import HoursReport from "./components/HoursReport";
import { Container, Tabs, Tab } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  const [key, setKey] = useState("calendar");
  const [monthlyHours, setMonthlyHours] = useState({});
  const [weeklyHours, setWeeklyHours] = useState({});

  useEffect(() => {
    fetch(
      `${process.env.REACT_APP_API_BASE_URL}/api/hours/monthly`
    )
      .then((res) => res.json())
      .then((data) => setMonthlyHours(data));

    fetch(
      `${process.env.REACT_APP_API_BASE_URL}/api/hours/weekly`
    )
      .then((res) => res.json())
      .then((data) => setWeeklyHours(data));
  }, []);

  return (
    <Container className="my-4">
      <h1 className="text-center mb-4">Time Tracking System</h1>

      <Tabs activeKey={key} onSelect={(k) => setKey(k)} className="mb-3">
        <Tab eventKey="calendar" title="Calendar">
          <Calendar />
        </Tab>
        <Tab eventKey="create" title="Create Event">
          <EventForm />
        </Tab>
        <Tab eventKey="reports" title="Reports">
          <HoursReport monthly={monthlyHours} weekly={weeklyHours} />
        </Tab>
      </Tabs>
    </Container>
  );
}

export default App;
