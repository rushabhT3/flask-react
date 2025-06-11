import React, { useState, useEffect } from "react";
import { Calendar as BigCalendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Button, Modal, Form } from "react-bootstrap";

const localizer = momentLocalizer(moment);

export default function Calendar() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [currentDate, setCurrentDate] = useState(new Date());

  const loadEvents = () => {
    fetch(
      `${process.env.REACT_APP_API_BASE_URL}/api/events`
    )
      .then((res) => res.json())
      .then((data) =>
        setEvents(
          data.map((event) => {
            // Create start date at beginning of day
            const startDate = new Date(event.date + "T00:00:00");
            // Create end date on the same day, just add hours to the time
            const endDate = new Date(event.date + "T00:00:00");
            endDate.setHours(endDate.getHours() + parseFloat(event.hours));

            return {
              ...event,
              start: startDate,
              end: endDate,
              title: `${event.project} - ${event.hours}h`,
            };
          })
        )
      );
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setEditFormData({
      project: event.project,
      hours: event.hours,
      date: event.date, // Keep as string for form input
      description: event.description || "",
    });
  };

  const handleDelete = () => {
    if (selectedEvent && selectedEvent.id) {
      fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/events/${selectedEvent.id}`,
        {
          method: "DELETE",
        }
      )
        .then((res) => {
          if (res.ok) {
            return res.json();
          }
          throw new Error("Delete failed");
        })
        .then(() => {
          alert("Event deleted successfully!");
          loadEvents();
          setSelectedEvent(null);
        })
        .catch((error) => {
          alert("Error deleting event");
          console.error("Error:", error);
        });
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    if (selectedEvent && selectedEvent.id) {
      // Ensure the data is properly formatted
      const updateData = {
        project: editFormData.project,
        hours: parseFloat(editFormData.hours),
        date: editFormData.date,
        description: editFormData.description || "",
      };

      fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/events/${selectedEvent.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
        }
      )
        .then((res) => {
          if (res.ok) {
            return res.json();
          }
          throw new Error("Update failed");
        })
        .then(() => {
          alert("Event updated successfully!");
          loadEvents();
          setSelectedEvent(null);
          setIsEditing(false);
        })
        .catch((error) => {
          alert("Error updating event");
          console.error("Error:", error);
        });
    }
  };

  const handleFormChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleNavigate = (newDate) => {
    setCurrentDate(newDate);
  };

  return (
    <div>
      <BigCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        onSelectEvent={handleSelectEvent}
        date={currentDate}
        onNavigate={handleNavigate}
      />

      <Modal
        show={selectedEvent !== null}
        onHide={() => {
          setSelectedEvent(null);
          setIsEditing(false);
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {isEditing ? "Edit Event" : "Event Details"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedEvent && !isEditing && (
            <div>
              <p>
                <strong>Project:</strong> {selectedEvent.project}
              </p>
              <p>
                <strong>Hours:</strong> {selectedEvent.hours}
              </p>
              <p>
                <strong>Date:</strong> {selectedEvent.date}
              </p>
              <p>
                <strong>Description:</strong> {selectedEvent.description}
              </p>
            </div>
          )}
          {selectedEvent && isEditing && (
            <Form onSubmit={handleUpdateSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Project</Form.Label>
                <Form.Control
                  type="text"
                  name="project"
                  value={editFormData.project}
                  onChange={handleFormChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Hours</Form.Label>
                <Form.Control
                  type="number"
                  name="hours"
                  min="0.5"
                  step="0.5"
                  value={editFormData.hours}
                  onChange={handleFormChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Date</Form.Label>
                <Form.Control
                  type="date"
                  name="date"
                  value={editFormData.date}
                  onChange={handleFormChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={editFormData.description}
                  onChange={handleFormChange}
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          {!isEditing ? (
            <>
              <Button variant="primary" onClick={handleEdit}>
                Edit
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                Delete
              </Button>
              <Button
                variant="secondary"
                onClick={() => setSelectedEvent(null)}
              >
                Close
              </Button>
            </>
          ) : (
            <>
              <Button variant="success" onClick={handleUpdateSubmit}>
                Save Changes
              </Button>
              <Button variant="secondary" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
}
