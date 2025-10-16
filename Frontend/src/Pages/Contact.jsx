import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";

const Contact = () => {
  return (
    <Container
      fluid
      className="d-flex align-items-center"
      style={{
        background: "#f5f3ff",
        minHeight: "100vh",   // ensures full height
      }}
    >
      <Container>
        <Row className="align-items-center">
          {/* Left Illustration */}
          <Col md={6} className="mb-4 mb-md-0 text-center">
            <img
              src="./Globalization-amico.svg"
              alt="Contact Illustration"
              className="img-fluid"
              style={{ maxHeight: "350px" }}
            />
          </Col>

          {/* Right Contact Form */}
          <Col md={6}>
            <Card className="shadow-sm border-0 p-4 rounded-4">
              <h3 className="fw-bold mb-4 text-center">Contact Us</h3>
              <Form>
                <Form.Group className="mb-3" controlId="name">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter your name"
                    className="rounded-3"
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="email">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter your email"
                    className="rounded-3"
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="message">
                  <Form.Label>Message</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    placeholder="Write your message"
                    className="rounded-3"
                  />
                </Form.Group>

                <div className="d-grid">
                  <Button
                    variant="dark"
                    type="submit"
                    className="rounded-3 fw-bold"
                  >
                    Submit
                  </Button>
                </div>
              </Form>
            </Card>
          </Col>
        </Row>
      </Container>
    </Container>
  );
};

export default Contact;
