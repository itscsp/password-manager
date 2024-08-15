import { useState } from "react";

interface formState {
  email: string,
  isValidEmail: boolean,
  message: string,
}

const LoginPage = () => {
  const [message, setMessage] = useState("");
  const [formState, setFormState] = useState<formState>({
    email: "",
    isValidEmail: true,
    message: "",
  })
  setMessage("");
  setFormState({
    email: "",
    isValidEmail: true,
    message: "",
  })


  return (
    <div className="container flex items-center justify-center px-4">
      <div className="md:p-6 py-6 px-4 bg-black rounded-lg shadow-lg text-white max-w-lg w-full">
        <h1 className="text-2xl font-bold mb-8 text-center">
          Login
        </h1>

        <div className="user-login">
          <div>
            <form action="flex flex-cols gap-3" autoComplete="off">
              <div className="form-control mb-6">
                <input
                  type="email"
                  id="registration_email"
                  className="text-base outline-none border-b-2 border-opred w-full p-4 rounded-md bg-opblack400 hover:bg-opblack500 focus:bg-opblack600 active:bg-opblack700 hover:border-opred-dark focus:border-opred-dark active:border-opred-darker"
                  placeholder="Enter your email"
                />
                {!formState.isValidEmail && (
                  <p className="text-red-500 text-sm mt-1">{formState.message}</p>
                )}
              </div>
              <div className="form-control mb-6">
                <input
                  type="password"
                  id="master_password"
                  className="text-base outline-none border-b-2 border-opred w-full p-4 rounded-md bg-opblack400 hover:bg-opblack500 focus:bg-opblack600 active:bg-opblack700 hover:border-opred-dark focus:border-opred-dark active:border-opred-darker"
                  placeholder="Enter Your Master Password"
                />
                {!formState.isValidEmail && (
                  <p className="text-red-500 text-sm mt-1">{formState.message}</p>
                )}
              </div>
              <div className="form-controll">
                <input type="submit" value={"Login"} className="text-white cursor-pointer text-base p-4 rounded-md mb-4 transition-colors duration-300 bg-opred hover:bg-opredHover focus:bg-opredHover active:bg-opredHover  w-full text-center block" />
                {message.length > 1 &&
                  <p className="flex items-center gap-4"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M5.90909 13.8182L6.09091 8.81818L1.86364 11.5L0.772727 9.59091L5.22727 7.27273L0.772727 4.95454L1.86364 3.04545L6.09091 5.72727L5.90909 0.727272H8.09091L7.90909 5.72727L12.1364 3.04545L13.2273 4.95454L8.77273 7.27273L13.2273 9.59091L12.1364 11.5L7.90909 8.81818L8.09091 13.8182H5.90909Z" fill="#D71340" />
                  </svg>
                    <span>

                      {message}
                    </span>
                  </p>
                }
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage