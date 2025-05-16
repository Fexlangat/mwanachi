// import React, { useState, useEffect } from 'react';
// import { Navbar, Nav } from 'react-bootstrap';
// import { auth } from '../Firebase';
// import { onAuthStateChanged, signOut } from 'firebase/auth';
// import { useNavigate } from 'react-router-dom';
// import { Spinner } from 'react-bootstrap';

// const CustomNavbar = () => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
//       setUser(currentUser);
//       setLoading(false);
//     });
//     return () => unsubscribe();
//   }, []);

//   const handleLogout = async () => {
//     try {
//       await signOut(auth);
//       navigate('/plan-selection');
//     } catch (err) {
//       console.error('Logout failed', err);
//     }
//   };

//   if (loading) return <div className="text-center mt-5"><Spinner animation="border" variant="primary" /></div>;

//   return (
//     <Navbar bg="primary" variant="dark" expand="lg">
//       <Navbar.Brand href="#home">
//         <img
//           src="/basket-icon.png"
//           alt="Kapu Surveys Logo"
//           width="30"
//           height="30"
//           className="d-inline-block align-top"
//           onError={(e) => e.target.src = '/default-logo.png'}
//         />{' '}
//         Mwananchi Surveys
//       </Navbar.Brand>
//       <Navbar.Toggle aria-controls="basic-navbar-nav" />
//       <Navbar.Collapse id="basic-navbar-nav">
//         <Nav className="ml-auto">
//           {user ? (
//             <>
//               <Nav.Link as={Link} to="/">Home</Nav.Link>
//               <Nav.Link as={Link} to="/profile">Profile</Nav.Link>
//               <Nav.Link as={Link} to="/referrals">Referrals</Nav.Link>
//               <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
//             </>
//           ) : (
//             <>
//               <Nav.Link as={Link} to="/login">Login</Nav.Link>
//               <Nav.Link as={Link} to="/register">Register</Nav.Link>
//             </>
//           )}
//         </Nav>
//       </Navbar.Collapse>
//     </Navbar>
//   );
// };

// export default CustomNavbar;


import React from 'react';
import { Navbar as BootstrapNavbar, Nav, Container, Button } from 'react-bootstrap';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../Firebase';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  const handleLogout = () => {
    auth.signOut().then(() => navigate('/login'));
  };

  return (
    <BootstrapNavbar bg="dark" variant="dark" expand="lg" className="mb-4">
      <Container>
        <BootstrapNavbar.Brand href="/">Mwananchi Surveys</BootstrapNavbar.Brand>
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="/">Home</Nav.Link>
            <Nav.Link href="/survey">Surveys</Nav.Link>
            <Nav.Link href="/profile">Profile</Nav.Link>
            <Nav.Link href="/referrals">Referrals</Nav.Link>
            {user && <Nav.Link href="/admin">Admin</Nav.Link>}
          </Nav>
          <Nav>
            {user ? (
              <Button variant="outline-light" onClick={handleLogout}>Logout</Button>
            ) : (
              <>
                <Button variant="outline-light" onClick={() => navigate('/login')} className="me-2">Login</Button>
                <Button variant="primary" onClick={() => navigate('/register')}>Register</Button>
              </>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;