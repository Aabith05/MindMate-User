import { Container, Navbar, Nav } from "react-bootstrap";
import { Link,Outlet } from "react-router-dom";
import { House, Gamepad2, Phone, User } from "lucide-react";

const Layout = ({ children }) => {
  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Navbar */}
      <Navbar bg="primary" variant="dark" expand="lg" fixed="top">
        <Container>
          <Navbar.Brand as={Link} to="/home">MindMate</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link as={Link} to="/games">Games</Nav.Link>
              <Nav.Link as={Link} to="/chat">Group Chat</Nav.Link>
              <Nav.Link as={Link} to="/call">Call Caretaker</Nav.Link>
              <Nav.Link as={Link} to="/contact">Contact</Nav.Link>
              <Nav.Link as={Link} to="/settings">Settings</Nav.Link>
              <Nav.Link as={Link} to="/profile">Profile</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Page Content */}
      <main className="flex-grow-1 mt-5 mb-5">
        <Outlet/>
        <div className="content-wrapper">{children}</div>
        
      </main>

      {/* Desktop Footer */}
      <footer className="desktop-footer d-none d-md-block bg-primary text-white py-3 text-center">
        <Container>
          <p className="mb-0">© 2025 MindMate | All Rights Reserved</p>
        </Container>
      </footer>

      {/* Mobile Bottom Nav */}
      <nav className="mobile-footer d-md-none bg-primary text-white fixed-bottom">
        <div className="d-flex justify-content-around py-2">
          <Link to="/" className="text-white text-center">
            <House size={22} />
            <div style={{ fontSize: "12px" }}>Home</div>
          </Link>
          <Link to="/games" className="text-white text-center">
            <Gamepad2 size={22} />
            <div style={{ fontSize: "12px" }}>Games</div>
          </Link>
          <Link to="/contact" className="text-white text-center">
            <Phone size={22} />
            <div style={{ fontSize: "12px" }}>Contact</div>
          </Link>
          <Link to="/profile" className="text-white text-center">
            <User size={22} />
            <div style={{ fontSize: "12px" }}>Profile</div>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default Layout;
