import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import Cookies from 'js-cookie'
import { LOGIN_MUTATION } from '../../graphql/mutation/userMutations';
const Login = () => {
    // const nav = useNavigate()

    // const [firstName, setFirstName] = useState('');
    // const [lastName, setLastName] = useState('');
    // const [password, setPassword] = useState('');
    // const [email, setEmail] = useState('');
    // const [login, { loading }] = useMutation(LOGIN_MUTATION);

    // const handleSubmit = async (e) => {
    //     e.preventDefault();
    //     const username = `${firstName.trim()}${lastName.trim()}`.toLowerCase();
    //     try {
    //         const response = await login({ variables: { username, password } });
    //         const user = response.data.login
    //         localStorage.setItem('user', JSON.stringify({ id: user.id, username: user.username }));
    //         nav('/')
    //     } catch (err) {
    //         toast.error(err.message)
    //         console.error('Login failed:', err.message);
    //     }
    // };
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Form submitted", formData);
    };

    return (
        // <form action="#" onSubmit={handleSubmit} className="mt-8 grid grid-cols-6 gap-6">
        //     <div className="col-span-6 sm:col-span-3">
        //         <label for="first_name" class="block mb-2 text-sm font-medium text-gray-900">First name</label>
        //         <input value={firstName}
        //             onChange={(e) => setFirstName(e.target.value)} type="text" id="first_name" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 " placeholder="John" required autoComplete='off' />
        //     </div>
        //     <div className="col-span-6 sm:col-span-3">
        //         <label for="last_name" class="block mb-2 text-sm font-medium text-gray-900">Last name</label>
        //         <input type="text" id="last_name" value={lastName}
        //             onChange={(e) => setLastName(e.target.value)} class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 " placeholder="John" required autoComplete='off' />
        //     </div>
        //     <div className="col-span-6">
        //         <label for="email" class="block mb-2 text-sm font-medium text-gray-900">Email</label>
        //         <input type="text" value={email}
        //             onChange={(e) => setEmail(e.target.value)} id="email"
        //             class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 " placeholder="John" required autoComplete='off' />
        //     </div>

        //     <div className="col-span-6 sm:col-span-3">
        //         <label for="password" class="block mb-2 text-sm font-medium text-gray-900">Password</label>
        //         <input type="text" value={password}
        //             onChange={(e) => setPassword(e.target.value)} id="password" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 " placeholder="John" required autoComplete='off' />
        //     </div>

        //     <div className="col-span-6 sm:col-span-3">
        //         <label for="first_name" class="block mb-2 text-sm font-medium text-gray-900">Password Confirmation</label>
        //         <input type="text" id="first_name" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 " placeholder="John" required />
        //     </div>

        //     <div className="col-span-6">
        //         <p className="text-sm text-gray-500">
        //             By creating an account, you agree to our
        //             <a href="#" className="text-gray-700 underline"> terms and conditions </a>
        //             and
        //             <a href="#" className="text-gray-700 underline">privacy policy</a>.
        //         </p>
        //     </div>

        //     <div className="col-span-6 sm:flex sm:items-center sm:gap-4">
        //         <button
        //             className="inline-block shrink-0 rounded-md border border-blue-600 bg-blue-600 px-12 py-3 text-sm font-medium text-white transition hover:bg-transparent hover:text-blue-600 focus:outline-none focus:ring active:text-blue-500"
        //         >{loading ?
        //             <svg aria-hidden="true" class="w-5 h-5 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
        //                 <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
        //                 <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
        //             </svg> : 'Login'}
        //         </button>

        //         <p className="mt-4 text-sm text-gray-500 sm:mt-0">
        //             DOn't have an account?
        //             <Link to="/create-account" className="text-gray-700 underline"> Create Account</Link>.
        //         </p>
        //     </div>
        //     <ToastContainer />
        // </form>
        <div className="max-w-md w-full flex flex-col gap-4 ">
            <div className='bg-white rounded-full p-2 w-min mx-auto' >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-12 text-gray-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
            </div>
            <h1 className="text-4xl text-gray-700 font-extrabold text-center ">Login</h1>
            <p className="text-sm text-gray-500 text-center">Welcome back! Please enter your credentials.</p>
            <div className="flex flex-col lg:flex-row items-center justify-between">
                <button className="w-full flex justify-center items-center gap-1 bg-white text-sm text-gray-600 rounded-md hover:bg-gray-50 border border-gray-200 transition-colors duration-300 p-2">
                    <img src="/google.png" alt="Google" className="w-5" /> Sign in with Google
                </button>
            </div>
            <div className="text-sm text-gray-500 text-center">
                <p>or with email</p>
            </div>
            <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
                <div>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder='Email'
                        value={formData.email}
                        onChange={handleChange}
                        className="mt-1 p-2 w-full border rounded-md focus:ring-gray-300 transition-colors duration-300"
                    />
                </div>
                <div>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        placeholder='Password'
                        value={formData.password}
                        onChange={handleChange}
                        className="mt-1 p-2 w-full border rounded-md focus:ring-gray-300 transition-colors duration-300"
                    />
                </div>
                <button type="submit" className="w-full bg-gray-800 text-white p-2 rounded-md hover:bg-gray-800 transition-colors duration-300 font-semibold">
                    Login
                </button>
            </form>
            <div className="text-sm text-gray-600 text-center">
                <p>
                    Don't have an account? <Link to="/create-account" className="text-black hover:underline">Sign up here</Link>
                </p>
            </div>
        </div>
    )
}

export default Login