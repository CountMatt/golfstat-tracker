// src/components/common/Footer.jsx
const Footer = () => {
  const year = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <p>&copy; {year} Golf Stats Tracker. Personal Use Only.</p>
    </footer>
  );
};

export default Footer;