import { Link, Outlet } from "react-router-dom"
import Footer from "../components/Footer"
import Header from "../components/Header"
import logo from "../assets/onepass_logo.svg"

const RootLayout = () => {
    return (
        <>
            <Header />
            <main className="mainLayout">
                <Link to="/" className='flex justify-center items-center mb-8'>
                    <img className='w-[125px]' src={logo} alt="" />
                </Link>
                <Outlet />
            </main>
            <Footer />
        </>
    )
}

export default RootLayout