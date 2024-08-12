import { Link } from "react-router-dom"
import logo from "../assets/onepass_logo.svg"

import Button from "../components/Button"
import Footer from "../components/Footer"
import Header from "../components/Header"

const NotFoundPage = () => {
  return (
    <>
      <Header />
      <main className="mainLayout">
        <Link to="/" className='flex justify-center items-center mb-8'>
          <img className='w-[125px]' src={logo} alt="" />
        </Link>
        <h1 className="text-center mb-4 text-3xl mb-6">404 | Page Not Found</h1>
        <div className="mx-auto">

          <Button
            text="Back To Home"
            url="/"
            variation="primary"
            size="inline"
          />
        </div>
      </main>
      <Footer />
    </>
  )
}

export default NotFoundPage