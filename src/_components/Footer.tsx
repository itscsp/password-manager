import { Link } from "react-router-dom"

export {Footer}

function Footer() {
    return (
        <footer className="w-full text-center py-4  text-white text-[12px]">
        Designed and Developed by <Link target="_blank" to="https://chethanspoojary.com/" className="text-opred">Chethan S Poojary</Link>
      </footer>
    )
}