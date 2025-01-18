import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { LOGIN_MUTATION } from '../../graphql/mutation/mutations';
import { useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
const Login = () => {
    const nav = useNavigate()

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [login] = useMutation(LOGIN_MUTATION);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const username = `${firstName.trim()}${lastName.trim()}`.toLowerCase();

        try {
            const response = await login({ variables: { username, password } });
            console.log('Login successful:', response.data.login);
            localStorage.setItem('token', response.data.login.token);
            nav("/")
        } catch (err) {
            console.error('Login failed:', err.message);
        }
    };


    return (
        <form action="#" onSubmit={handleSubmit} className="mt-8 grid grid-cols-6 gap-6">
            <div className="col-span-6 sm:col-span-3">
                <label for="first_name" class="block mb-2 text-sm font-medium text-gray-900">First name</label>
                <input value={firstName}
                    onChange={(e) => setFirstName(e.target.value)} type="text" id="first_name" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 " placeholder="John" required autoComplete='off' />
            </div>
            <div className="col-span-6 sm:col-span-3">
                <label for="last_name" class="block mb-2 text-sm font-medium text-gray-900">Last name</label>
                <input type="text" id="last_name" value={lastName}
                    onChange={(e) => setLastName(e.target.value)} class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 " placeholder="John" required autoComplete='off' />
            </div>
            <div className="col-span-6">
                <label for="email" class="block mb-2 text-sm font-medium text-gray-900">Email</label>
                <input type="text" value={email}
                    onChange={(e) => setEmail(e.target.value)} id="email"
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 " placeholder="John" required autoComplete='off' />
            </div>

            <div className="col-span-6 sm:col-span-3">
                <label for="password" class="block mb-2 text-sm font-medium text-gray-900">Password</label>
                <input type="text" value={password}
                    onChange={(e) => setPassword(e.target.value)} id="password" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 " placeholder="John" required autoComplete='off' />
            </div>

            <div className="col-span-6 sm:col-span-3">
                <label for="first_name" class="block mb-2 text-sm font-medium text-gray-900">Password Confirmation</label>
                <input type="text" id="first_name" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 " placeholder="John" required />
            </div>

            <div className="col-span-6">
                <p className="text-sm text-gray-500">
                    By creating an account, you agree to our
                    <a href="#" className="text-gray-700 underline"> terms and conditions </a>
                    and
                    <a href="#" className="text-gray-700 underline">privacy policy</a>.
                </p>
            </div>

            <div className="col-span-6 sm:flex sm:items-center sm:gap-4">
                <button
                    className="inline-block shrink-0 rounded-md border border-blue-600 bg-blue-600 px-12 py-3 text-sm font-medium text-white transition hover:bg-transparent hover:text-blue-600 focus:outline-none focus:ring active:text-blue-500"
                >
                    Create an account
                </button>

                <p className="mt-4 text-sm text-gray-500 sm:mt-0">
                    Already have an account?
                    <Link to="/login" className="text-gray-700 underline">Log in</Link>.
                </p>
            </div>
        </form>
    )
}

export default Login