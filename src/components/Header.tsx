import React from 'react'
import logo from "../assets/onepass_logo.svg"
import { Link } from 'react-router-dom'

const Header = () => {
  return (
    <Link to="/" className='flex justify-center items-center mb-16'>
        <img className='w-[125px]' src={logo} alt="" />
    </Link>
  )
}

export default Header