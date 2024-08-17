import { Button } from "../_components"

export { Home }

function Home() {
  const auth = false;

  return (
    <div className="shadow-lg ">
      <div className="bg-black rounded-lg  p-6  flex flex-col items-center justify-center h-full md:w-96 w-full m-auto">
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
              text="Passwords"
              url="/password"
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