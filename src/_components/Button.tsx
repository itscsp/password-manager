import React from 'react';
import { Link } from 'react-router-dom';

interface ButtonProps {
  text: string;
  url: string;
  variation?: 'primary' | 'secondary';
  size?: 'inline' | 'block';
  onClick?: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
}

const Button: React.FC<ButtonProps> = ({ text, url, variation = 'primary', size = 'inline', onClick, disabled }) => {
  // Define the base styles
  const baseStyle = "text-white text-base p-4 rounded mb-4 transition-colors duration-300";

  // Define the variation styles
  const variations = {
    primary: "bg-opred hover:bg-opredHover ",
    secondary: "bg-transparent text-opred border border-opred hover:border-opredHover hover:bg-opredHover hover:text-white ",
  };

  // Define the size styles
  const sizes = {
    inline: "p-4 text-center inline-block",
    block: "w-full text-center block",
  };

  // Combine the styles
  const buttonStyle = `${baseStyle} ${variations[variation]} ${sizes[size]} ${disabled ? "pointer-events-none opacity-50":""}`;

  return (
    <Link to={url} className={buttonStyle} onClick={onClick}>
      {text}
    </Link>
  );
};

export {Button};
