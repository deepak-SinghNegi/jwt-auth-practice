import React, { useContext } from 'react'
import { assets } from '../assets/assets'
import { AppContent } from '../context/AppContext'

const Header = () => {
    const {userData , isLoggedIn} = useContext(AppContent);
    return (
        <div className='w-full  flex flex-col justify-center items-center mt-20 px-4 text-gray-800 text-center'><img src={assets.header_img} alt="" className='w-50 h-50 rounded-full mb-6' />
            <h1 className='flex items-center gap-2 text-xl sm:text-3xl font-medium mb-2'>Hey {isLoggedIn ? userData.name :"Developer !"}<img className="w-8 aspect-square" src={assets.hand_wave} alt="" className='w-8 aspect-square' />
            </h1>
            <h2 className='text-3xl sm:text-5xl font-semibold mb-4'>Welcome to the app</h2>
            <p className='mb-8 max-w-md'>A complete authentication system built with MongoDB, Express, React, and Node.js featuring JWT authentication, email verification, password reset, and protected routes. </p>
            <button className='border border-gray-500 px-8 py-2.5 rounded-full hover:bg-gray-100 cursor-pointer transition-all'>Get Started </button>
        </div>
    )
}

export default Header