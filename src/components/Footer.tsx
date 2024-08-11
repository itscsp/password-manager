import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="fixed bottom-0 left-0 w-full text-center py-4  text-white font-inter">
      Designed And Built By <Link target="_blank" to="https://chethanspoojary.com/" className="text-red">Chethan S Poojary</Link>
    </footer>
  );
};

export default Footer;
