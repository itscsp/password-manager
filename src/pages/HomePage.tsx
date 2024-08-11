import React from 'react'

const HomePage = () => {
    return (

        <div className="container">

            <div class="flex flex-col items-center justify-center h-full">
                <div class="bg-[#181818] p-6 rounded-lg shadow-lg">
                    <button class="bg-[#D71340] text-white font-bold py-2 px-4 rounded w-full mb-4 hover:bg-[#ff4a6e]">
                        Login
                    </button>
                    <button class="bg-transparent text-[#D71340] font-bold py-2 px-4 rounded w-full mb-4 border-2 border-[#D71340] hover:bg-[#ff4a6e] hover:text-white">
                        Create An Account
                    </button>
                    <button class="bg-[#D71340] text-white font-bold py-2 px-4 rounded w-full hover:bg-[#ff4a6e]">
                        Generate Password
                    </button>
                </div>
            </div>

        </div>
    )
}

export default HomePage