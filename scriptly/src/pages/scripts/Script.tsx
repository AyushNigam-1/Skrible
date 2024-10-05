import React from 'react'
import { useParams } from 'react-router-dom'
import ToggleSwitch from '../../components/Checkbox';
const Script = () => {
    const { id } = useParams()
    const contributions = [
        {
            contributorName: "John Doe",
            date: "2024-09-01",
            para: "In recent years, the rise of web development has transformed how we interact with technology. From simple static websites to complex web applications, the demand for developers with a deep understanding of web technologies has increased dramatically. Web development today involves a variety of frameworks and libraries, such as React, Angular, and Vue, which make building dynamic user interfaces much more efficient. Moreover, backend technologies like Node.js, Django, and Ruby on Rails have streamlined server-side development, allowing developers to focus on creating scalable and maintainable applications. As businesses continue to migrate their operations online, the need for robust, secure, and user-friendly websites will only grow."
        },
        {
            contributorName: "Jane Smith",
            date: "2024-09-10",
            para: "Artificial Intelligence (AI) has become a driving force behind many technological advancements today. Machine learning, a subset of AI, enables computers to learn from data and make decisions without explicit programming. This ability has led to breakthroughs in various fields, including healthcare, finance, and robotics. For example, AI algorithms are being used to detect diseases at early stages, predict market trends, and improve autonomous systems. Despite its potential, AI also raises ethical concerns, such as bias in algorithms and job displacement. As AI continues to evolve, it's crucial to address these challenges and ensure that its benefits are shared by all."
        },
        {
            contributorName: "Alex Johnson",
            date: "2024-09-15",
            para: "Blockchain technology, best known for its role in powering cryptocurrencies like Bitcoin, is reshaping industries far beyond finance. At its core, blockchain is a decentralized ledger that allows secure, transparent, and tamper-proof transactions. This makes it ideal for applications in supply chain management, voting systems, and even healthcare, where trust and security are paramount. One of the key advantages of blockchain is its ability to eliminate the need for intermediaries, reducing costs and improving efficiency. However, scalability and regulatory challenges remain significant barriers to widespread adoption. As the technology matures, it's likely that we will see more innovative use cases for blockchain in the coming years."
        },
        {
            contributorName: "Emily Davis",
            date: "2024-09-22",
            para: "Cloud computing has revolutionized the way businesses operate by providing on-demand access to computing resources over the internet. Companies no longer need to invest in expensive hardware or maintain their own data centers. Instead, they can rent computing power, storage, and other services from cloud providers like Amazon Web Services (AWS), Microsoft Azure, and Google Cloud. This shift has made it easier for businesses to scale their operations, improve collaboration, and reduce IT costs. Furthermore, cloud computing enables faster innovation by allowing developers to deploy applications quickly and efficiently. However, security and compliance issues remain top concerns for businesses considering cloud adoption."
        },
        {
            contributorName: "Michael Brown",
            date: "2024-09-30",
            para: "As the world becomes more connected through the internet, the importance of cybersecurity cannot be overstated. Cyberattacks are becoming more sophisticated, and the consequences of data breaches can be devastating for both individuals and organizations. From phishing attacks to ransomware, hackers are finding new ways to exploit vulnerabilities in systems. To combat these threats, companies are investing in advanced security technologies, such as encryption, multi-factor authentication, and threat detection systems. However, technology alone is not enough. Employees must also be educated on best practices for staying safe online, such as recognizing suspicious emails and using strong passwords. As cyber threats continue to evolve, the need for comprehensive cybersecurity strategies will only grow."
        }
    ];

    return (
        <div className='m-4 gap-3 '>
            <div className='flex flex-col gap-3 '>
                <div className='flex justify-between' >
                    <div className='flex gap-3'>
                        <h3 className='font-sans text-4xl font-bold text-gray-800 ' >
                            Untitled
                        </h3>
                        <button className='rounded-full p-2 bg-white ' >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 text-indigo-600">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                            </svg>
                        </button>
                    </div>
                    <div className='flex gap-2 text-xl items-center ' >
                        <ToggleSwitch /> <h6>Show Annotions</h6>
                    </div>
                </div>
                <hr />
                <div className='grid-cols-10 grid gap-4'>
                    <div className='flex flex-col gap-4 col-span-8' >
                        {
                            contributions.map(contribution =>
                                <div className='flex gap-3 word-spacing-1 rounded-lg text-xl text-gray-800 relative' >
                                    <div className='relative flex flex-col gap-3 items-center' >
                                        <div className='bg-white rounded-full p-2 text-indigo-600 border w-full'>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        {/* <div className='-rotate-90' >
                                            <p className='text-sm font-semibold'>
                                                {contribution.contributorName}
                                            </p>
                                        </div> */}
                                    </div>
                                    <div className='bg-white' >
                                        <p className='p-4'>
                                            {contribution.para}
                                        </p>
                                    </div>
                                </div>
                            )
                        }
                    </div>
                    <div className='col-span-2 bg-white rounded-md p-4 gap-5 flex flex-col' >
                        <div>
                            <h4 className='text-lg text-gray-600 font-bold flex items-center gap-1' > <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                            </svg>
                                Author </h4>
                            <span className='flex items-center gap-2' >
                                {/* <img className="w-8 h-8 rounded-full" src="https://tecdn.b-cdn.net/img/new/avatars/2.webp" alt="Rounded avatar" /> */}
                                <p className='text-lg font-bold' >Ayush Nigam</p>
                            </span>
                        </div>
                        <div>
                            <h4 className='text-lg text-gray-600 font-bold flex items-center gap-1' > <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                            </svg>
                                Contributors </h4>
                            <span className='flex items-center gap-2' >
                                {/* <img className="w-8 h-8 rounded-full" src="https://tecdn.b-cdn.net/img/new/avatars/2.webp" alt="Rounded avatar" /> */}
                                <p className='text-lg font-bold' > Ayush Nigam</p>
                            </span>
                        </div>
                        <div className='flex flex-col gap-2'>
                        <h4 className='text-lg text-gray-600 font-bold flex items-center gap-1' > <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
 Contribution History </h4>
                        {Array(5).fill(0).map(() => {
                            return <span className='flex items-center gap-2 bg-gray border border-gray-400 p-2 rounded-lg' >
                                <img className="w-10 h-10 rounded-full" src="https://tecdn.b-cdn.net/img/new/avatars/2.webp" alt="Rounded avatar" />
                                <div>
                                    <p className='font-semibold text-lg'>Ayush Nigam</p>
                                    <div className='flex items-center justify-center gap-1 p-0.5 px-2 rounded-lg text-green-800 bg-green-100' >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                        </svg>
                                        <p className='text-sm font-medium' >Added 64 New Lines </p>
                                    </div>
                                </div>
                            </span>
                        })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Script