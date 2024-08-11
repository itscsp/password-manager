import Button from "../components/Button"
import Header from "../components/Header"

const NotFoundPage = () => {
  return (
    <div className="flex flex-col justify-center">
        <Header />
        <h1 className="text-center mb-4 text-3xl mb-6">404 | Page Not Found</h1>
        <div className="mx-auto">

        <Button 
        text="Back To Home"
        url="/"
        variation="primary"
        size="inline"
        />
        </div>
    </div>
  )
}

export default NotFoundPage