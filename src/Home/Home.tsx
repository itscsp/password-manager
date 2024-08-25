import { useSelector } from "react-redux";
import { Button } from "../_components"
import { useEffect } from "react";
import { RootState } from "../app/store";

import Loading from "../_components/Loading";

export { Home }

function Home() {
  const { isLoggedIn } = useSelector((state: any) => state.auth);
  const { loading } = useSelector((state: RootState) => state.auth); // Use RootState type for useSelector


  let auth = isLoggedIn;
  useEffect(() => {
    auth = isLoggedIn
    console.log("User:", isLoggedIn)
  }, [isLoggedIn])

  return (
    <>
      <div className="bg-black rounded-lg  p-6  flex flex-col items-center justify-center h-full sm:w-96 w-full m-auto">
        {loading && <Loading />}
        {!loading &&
          <>
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
          </>
        }
        {!loading &&
          <>
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
          </>
        }
        {!loading &&
          <>
            {/* Generate Password Button */}
            <Button
              text="Generate Password"
              url="/password-generator"
              variation="primary"
              size="block"
            />
          </>
        }
      </div>
    </>
  )
}