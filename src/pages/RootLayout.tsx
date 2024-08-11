import { Outlet } from "react-router-dom"

const RootLayout = () => {
    return (
        <main>
            <Outlet />
            <footer className="fixed bottom-0 left-0 w-full text-center py-4 bg-black text-white">
                Designed And Built By <a className="text-red">Chethan S Poojary</a>
            </footer>
        </main>


    )
}

export default RootLayout