import { useSelector } from "react-redux";
import { Button } from "../_components"

export { Home }

function Home() {
  const { isLoggedIn } = useSelector((state: any) => state.auth);
  console.log("Is user logedin", isLoggedIn)
  const auth = isLoggedIn;

  return (
    <div className="shadow-lg ">
      <div className="bg-black rounded-lg  p-6  flex flex-col items-center justify-center h-full sm:w-96 w-full m-auto">
        {!auth &&
          <>
            {/* Login Button */}
            < Button
              text="Login"
              url="/account/login"
              variation="primary"
              size="block"
            />

            {/* Create An Account Button */}
            <Button
              text="Create An Account"
              url="/account/register"
              variation="secondary"
              size="block"
            />
          </>
        }

        {
          auth && <>
            <Button
              text="My Passwords"
              url="/passwords"
              variation="primary"
              size="block"
            />
            <Button
              text="Add Password"
              url="/passwords/add"
              variation="secondary"
              size="block"
            />
          </>
        }

        {/* Generate Password Button */}
        <Button
          text="Generate Password"
          url="/password-generator"
          variation="primary"
          size="block"
        />
      </div>
    </div>
  )
}