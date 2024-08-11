import React from 'react';
import { Link } from 'react-router-dom';

interface ButtonProps {
  text: string;
  url: string;
  variation?: 'primary' | 'secondary';
  size?: 'inline' | 'block';
}

const Button: React.FC<ButtonProps> = ({ text, url, variation = 'primary', size = 'inline' }) => {
  // Define the base styles
  const baseStyle = "text-white text-base py-2 px-4 rounded mb-4 transition-colors duration-300";
  
  // Define the variation styles
  const variations = {
    primary: "bg-red hover:bg-redHover ",
    secondary: "bg-transparent text-red border border-red hover:border-redHover hover:bg-redHover hover:text-white ",
  };

  // Define the size styles
  const sizes = {
    inline: "py-3 px-6 text-center inline-block",
    block: "py-3 px-6 w-full text-center block",
  };

  // Combine the styles
  const buttonStyle = `${baseStyle} ${variations[variation]} ${sizes[size]}`;

  return (
    <Link to={url} className={buttonStyle}>
      {text}
    </Link>
  );
};

export default Button;
