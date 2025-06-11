import React, { useState } from "react";
import { Form, Button, Row, Col } from "react-bootstrap";

export default function EventForm() {
  const [formData, setFormData] = useState({
    project: "",
    hours: 1,
    date: new Date().toISOString().split("T")[0],
    description: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch(`${process.env.REACT_APP_API_BASE_URL}/api/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then((data) => {
        alert("Event created successfully!");
        setFormData({
          project: "",
          hours: 1,
          date: new Date().toISOString().split("T")[0],
          description: "",
        });
      });
  };

  return (
    <Form onSubmit={handleSubmit} className="mt-4">
      <Row>
        <Col md={6}>
          <Form.Group controlId="project">
            <Form.Label>Project</Form.Label>
            <Form.Control
              type="text"
              name="project"
              value={formData.project}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group controlId="hours">
            <Form.Label>Hours</Form.Label>
            <Form.Control
              type="number"
              name="hours"
              min="0.5"
              step="0.5"
              value={formData.hours}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group controlId="date">
            <Form.Label>Date</Form.Label>
            <Form.Control
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </Col>
      </Row>

      <Form.Group controlId="description" className="mt-3">
        <Form.Label>Description</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          name="description"
          value={formData.description}
          onChange={handleChange}
        />
      </Form.Group>

      <Button variant="primary" type="submit" className="mt-3">
        Create Event
      </Button>
    </Form>
  );
}
