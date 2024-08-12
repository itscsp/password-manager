import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="text-center py-4  text-white font-inter">
      Designed And Built By <Link target="_blank" to="https://chethanspoojary.com/" className="text-red">Chethan S Poojary</Link>
    </footer>
  );
};

export default Footer;
