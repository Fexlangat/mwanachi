// import React from 'react';
// import { Container, Row, Col, Nav } from 'react-bootstrap';
// import '../App.css';

// const Footer = () => {
//   const currentYear = new Date().getFullYear();

//   return (
//     <footer className="footer">
//       <Container>
//         <Row>
//           <Col md={4}>
//             <h5>Mwananchi Surveys</h5>
//             <p>Earn money by completing surveys from the comfort of your home.</p>
//           </Col>
//           <Col md={4}>
//             <h5>Quick Links</h5>
//             <Nav className="flex-column">
//               <Nav.Link href="/terms">Terms & Conditions</Nav.Link>
//               <Nav.Link href="/privacy">Privacy Policy</Nav.Link>
//               <Nav.Link href="/contact">Contact Us</Nav.Link>
//             </Nav>
//           </Col>
//           <Col md={4}>
//             <h5>Contact</h5>
//             <p>Email: support@mwananchisurveys.com</p>
//             <p>Phone: +254 123 456 789</p>
//             <p>Follow us on: <a href="https://x.com/mwananchisurveys" target="_blank" rel="noopener noreferrer">X</a></p>
//           </Col>
//         </Row>
//         <Row className="mt-3">
//           <Col className="text-center">
//             <p>© {currentYear} Mwananchi Surveys. All rights reserved.</p>
//           </Col>
//         </Row>
//       </Container>
//     </footer>
//   );
// };

// export default Footer;


import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="bg-dark text-light mt-5 py-4">
      <Container>
        <Row>
          <Col md={6}>
            <p>&copy; {new Date().getFullYear()} Mwananchi Surveys. All rights reserved.</p>
          </Col>
          <Col md={6} className="text-md-end">
            <a href="/terms" className="text-light me-3">Terms of Service</a>
            <a href="/privacy" className="text-light">Privacy Policy</a>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;